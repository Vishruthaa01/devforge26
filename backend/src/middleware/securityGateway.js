const { v4: uuidv4 } = require('uuid');
const Agent = require('../models/Agent');
const Role = require('../models/Role');
const AuditLog = require('../models/AuditLog');
const Endpoint = require('../models/Endpoint');
const SecurityAlert = require('../models/SecurityAlert');

const { calculateRiskScore } = require('../services/riskEngine');
const { evaluatePolicies } = require('../services/policyEngine');

const matchEndpoint = async (method, path) => {
  let endpoint = await Endpoint.findOne({ method, path });
  if (endpoint) return endpoint;

  const endpoints = await Endpoint.find({ method });
  for (const ep of endpoints) {
    const regexPath = ep.path.replace(/:\w+/g, '[^/]+');
    const regex = new RegExp(`^${regexPath}$`);
    if (regex.test(path)) {
      return ep;
    }
  }
  return null;
};

const createSecurityAlert = async (agentId, type, title, description, severity = 'HIGH', io) => {
  const alert = await SecurityAlert.create({
    alertId: uuidv4(),
    severity,
    type,
    title,
    description,
    agentId
  });
  if (io) io.emit('alert.created', alert);
};

const securityGateway = async (req, res, next) => {
  const agentId = req.headers['x-agent-id']; 
  const targetRoute = `${req.method} ${req.originalUrl}`;
  const payload = req.body || {};

  if (!agentId) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Missing x-agent-id header' } });
  }

  try {
    const agent = await Agent.findOne({ agentId });
    if (!agent || agent.status !== 'ACTIVE') {
      return res.status(401).json({ success: false, error: { code: 'INVALID_AGENT', message: 'Invalid or disabled Agent' } });
    }

    agent.requestCount += 1;
    agent.lastActiveAt = new Date();
    await agent.save();

    const fullPath = `${req.baseUrl || ''}${req.path}`;
    const endpoint = await matchEndpoint(req.method, fullPath);
    
    if (!endpoint || !endpoint.enabled) {
      await AuditLog.create({ agentId, actionRequested: 'UNKNOWN_ENDPOINT', targetRoute, decision: 'BLOCKED', blockReason: 'Endpoint not registered or disabled' });
      req.io.emit('request.blocked', { agentId, actionRequested: 'UNKNOWN_ENDPOINT', targetRoute });
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'API Endpoint not recognized by Gateway' } });
    }

    const actionRequested = endpoint.action;

    const role = await Role.findOne({ name: agent.role });
    if (!role || (!role.allowedActions.includes(actionRequested) && !role.allowedActions.includes('*'))) {
      agent.blockedRequestCount += 1;
      await agent.save();

      const log = await AuditLog.create({ agentId, actionRequested, targetRoute, decision: 'BLOCKED', blockReason: 'Lacks domain clearance (RBAC)' });
      await createSecurityAlert(agentId, 'RBAC_VIOLATION', 'RBAC Violation Attempt', `Agent attempted unauthorized action: ${actionRequested}`, 'HIGH', req.io);
      req.io.emit('request.blocked', log);

      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'SECURITY ALERT: Agent lacks domain clearance.' } });
    }

    const { decision: policyDecision, matchedPolicy } = await evaluatePolicies(agent, actionRequested, payload);
    
    if (policyDecision === 'BLOCK') {
      agent.blockedRequestCount += 1;
      await agent.save();

      const log = await AuditLog.create({ agentId, actionRequested, targetRoute, decision: 'BLOCKED', blockReason: `Blocked by Policy: ${matchedPolicy.name}` });
      await createSecurityAlert(agentId, 'POLICY_VIOLATION', 'Policy Violation Block', `Agent blocked by policy ${matchedPolicy.name}`, 'HIGH', req.io);
      req.io.emit('request.blocked', log);

      return res.status(403).json({ success: false, error: { code: 'POLICY_BLOCK', message: 'Action explicitly blocked by security policy' } });
    }

    const { totalScore: riskScore, factors: riskFactors } = await calculateRiskScore(agentId, actionRequested, payload, role.name);
    req.securityContext = { agent, role, actionRequested, riskScore, riskFactors, payload, endpoint };

    const requiresApproval = (endpoint.approvalRequired === 'ALWAYS') || (policyDecision === 'APPROVAL') || (riskScore >= 40 && riskScore <= 69);

    if (riskScore >= 70) {
      agent.blockedRequestCount += 1;
      await agent.save();

      const log = await AuditLog.create({ agentId, actionRequested, targetRoute, decision: 'BLOCKED', blockReason: `Suspicious action blocked. Risk Score: ${riskScore}`, riskScore, riskFactors });
      await createSecurityAlert(agentId, 'HIGH_RISK_BLOCK', 'High Risk Action Blocked', `Risk Score ${riskScore} exceeded block threshold of 70.`, 'CRITICAL', req.io);
      req.io.emit('request.blocked', log);

      return res.status(403).json({ success: false, error: { code: 'RISK_BLOCK', message: 'Suspicious Action Blocked by Risk Engine' } });
    } 
    
    if (requiresApproval) {
      agent.approvalRequestCount += 1;
      await agent.save();

      const requestId = uuidv4();
      const PendingRequest = require('../models/PendingRequest');
      
      const pendingReq = await PendingRequest.create({ requestId, agentId, action: actionRequested, targetRoute, payload, riskScore, riskFactors });
      const log = await AuditLog.create({ agentId, actionRequested, targetRoute, decision: 'PENDING', blockReason: `Paused for Human Approval. Risk Score: ${riskScore}`, riskScore, riskFactors });
      
      req.io.emit('approval.pending', pendingReq);
      req.io.emit('request.blocked', log); // Log it as blocked/pending in live view

      return res.status(202).json({ success: true, decision: 'APPROVAL_REQUIRED', requestId, riskScore, riskFactors, message: 'Held for Human Approval' });
    }

    const log = await AuditLog.create({ agentId, actionRequested, targetRoute, decision: 'ALLOWED', blockReason: `Risk Score: ${riskScore} (Auto-Approved)`, riskScore, riskFactors });
    req.io.emit('request.allowed', log);

    next();

  } catch (error) {
    console.error('Gateway Error:', error);
    res.status(500).json({ success: false, error: { code: 'GATEWAY_ERROR', message: 'Internal Gateway Error' } });
  }
};

module.exports = securityGateway;
