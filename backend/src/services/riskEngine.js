const AuditLog = require('../models/AuditLog');

const calculateRiskScore = async (agentId, action, payload = {}, roleName = '') => {
  // 1. A: Action Risk (Max 40)
  let A = 0;
  switch (action) {
    case 'READ_ORDER': A = 5; break;
    case 'READ_CUSTOMER': 
      A = (roleName === 'FinancialAuditor') ? 35 : 10; 
      break;
    case 'UPDATE_CUSTOMER': A = 15; break;
    case 'READ_SALES': 
      A = (roleName === 'CustomerSupport') ? 35 : 10;
      break;
    case 'VIEW_PAYMENT': A = 20; break;
    case 'EXECUTE_REFUND': 
      A = (roleName === 'FinancialAuditor') ? 15 : 30;
      break;
    case 'DELETE_CUSTOMER': A = 40; break;
    case 'EXPORT_CUSTOMERS': A = 40; break;
    default: A = 10; // Default for unknown actions
  }

  // 2. S: Data Sensitivity (Max 20)
  let S = 0;
  if (['EXPORT_CUSTOMERS'].includes(action)) {
    S = 20; // Bulk Sensitive
  } else if (['VIEW_PAYMENT', 'EXECUTE_REFUND'].includes(action) || (payload && payload.amount !== undefined)) {
    S = 15; // Financial/Payment
  } else if (['UPDATE_CUSTOMER', 'DELETE_CUSTOMER'].includes(action)) {
    S = 10; // Account Info
  } else if (['READ_CUSTOMER', 'READ_SALES'].includes(action)) {
    S = 5; // Customer Info / Sales Info
  } else {
    S = 0; // Public
  }

  // 3. V: Transaction Value (Max 20)
  let V = 0;
  if (action === 'EXECUTE_REFUND' && payload && typeof payload.amount !== 'undefined') {
    const amount = Number(payload.amount);
    // Adjusted thresholds to ensure Standard Refund is ALLOWED (<40 total)
    // For FinanceBot: A=15, S=15 -> Base=30.
    // Standard Refund ($5000): V needs to be <= 9. We'll set V=5. Total=35 (ALLOW)
    // Massive Refund ($15000): V needs to be >= 10. We'll set V=15. Total=45 (PENDING)
    if (amount > 25000) V = 20;
    else if (amount >= 10000) V = 15; // Massive Refund
    else if (amount >= 5000) V = 5; // Standard Refund (e.g. $5k)
    else if (amount >= 1000) V = 0;
    else V = 0;
  }

  // 4. F: Frequency/Anomaly (Max 10)
  let F = 0;
  // 5. B: Agent Behavior (Max 10)
  let B = 0;

  try {
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    // Query for Frequency over the last 1 minute
    const recentRequests = await AuditLog.countDocuments({
      agentId,
      timestamp: { $gte: oneMinuteAgo }
    });

    if (recentRequests > 10) F = 10;
    else if (recentRequests > 5) F = 6;
    else if (recentRequests > 2) F = 3;
    else F = 0;

    // Query for Agent Behavior (Failed requests over the last 5 minutes)
    const recentFailedRequests = await AuditLog.countDocuments({
      agentId,
      decision: 'BLOCKED',
      timestamp: { $gte: fiveMinutesAgo }
    });

    if (recentFailedRequests > 5) B = 10;
    else if (recentFailedRequests > 2) B = 5; // Unusual pattern
    else if (recentFailedRequests > 0) B = 3; // Repeated failed requests
    else B = 0;

  } catch (error) {
    console.error('Error fetching AuditLogs for risk engine:', error);
  }

  const totalScore = Math.min(100, A + S + V + F + B);

  return {
    totalScore,
    factors: { A, S, V, F, B }
  };
};

module.exports = { calculateRiskScore };
