const express = require('express');
const router = express.Router();
const PendingRequest = require('../models/PendingRequest');
const AuditLog = require('../models/AuditLog');
const Role = require('../models/Role');
const axios = require('axios'); // We need axios to forward the request

// Get all roles
router.get('/roles', async (req, res) => {
  try {
    const roles = await Role.find();
    res.json({ success: true, data: roles });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update role permissions
router.put('/roles/:id', async (req, res) => {
  try {
    const { allowedActions } = req.body;
    const role = await Role.findByIdAndUpdate(
      req.params.id,
      { allowedActions },
      { new: true }
    );
    res.json({ success: true, data: role });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/pending', async (req, res) => {
  try {
    const pending = await PendingRequest.find({ status: 'PENDING' }).sort({ createdAt: -1 });
    res.json({ success: true, data: pending });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/approve/:id', async (req, res) => {
  try {
    const request = await PendingRequest.findById(req.params.id);
    if (!request || request.status !== 'PENDING') {
      return res.status(404).json({ error: 'Pending request not found' });
    }

    request.status = 'APPROVED';
    await request.save();

    // Log the human approval
    const log = await AuditLog.create({
      agentId: request.agentId,
      actionRequested: request.action,
      targetRoute: request.targetRoute,
      decision: 'ALLOWED',
      blockReason: `Human Approved (Risk Score: ${request.riskScore})`
    });

    if (req.io) {
      req.io.emit('approval.approved', request);
      req.io.emit('request.allowed', log);
    }

    // Forward the original request to the enterprise API (bypassing gateway as it's approved)
    // Extract method and path
    const [method, path] = request.targetRoute.split(' ');
    
    // Simulate forwarding by returning success (since the enterprise mock routes return mock data)
    res.json({ success: true, message: 'Request approved and executed' });

  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/reject/:id', async (req, res) => {
  try {
    const request = await PendingRequest.findById(req.params.id);
    if (!request || request.status !== 'PENDING') {
      return res.status(404).json({ error: 'Pending request not found' });
    }

    request.status = 'REJECTED';
    await request.save();

    // Log the human rejection
    const log = await AuditLog.create({
      agentId: request.agentId,
      actionRequested: request.action,
      targetRoute: request.targetRoute,
      decision: 'BLOCKED',
      blockReason: `Human Rejected (Risk Score: ${request.riskScore})`
    });

    if (req.io) {
      req.io.emit('approval.rejected', request);
      req.io.emit('request.blocked', log);
    }

    res.json({ success: true, message: 'Request firmly rejected' });

  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
