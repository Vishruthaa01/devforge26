const mongoose = require('mongoose');

const securityAlertSchema = new mongoose.Schema({
  alertId: { type: String, required: true, unique: true },
  severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], required: true },
  type: { type: String, required: true }, // e.g., 'UNAUTHORIZED_ACCESS', 'BEHAVIOR_ANOMALY'
  title: { type: String, required: true },
  description: { type: String },
  agentId: { type: String },
  requestId: { type: String },
  status: { type: String, enum: ['NEW', 'ACKNOWLEDGED', 'RESOLVED'], default: 'NEW' },
  acknowledgedBy: { type: String },
  resolvedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('SecurityAlert', securityAlertSchema);
