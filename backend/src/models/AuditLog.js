const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  agentId: { type: String, required: true },
  actionRequested: { type: String, required: true },
  targetRoute: { type: String },
  decision: { type: String, enum: ['ALLOWED', 'BLOCKED', 'PENDING'], required: true },
  blockReason: { type: String },
  riskScore: { type: Number },
  riskFactors: {
    actionRisk: { type: Number },
    dataSensitivity: { type: Number },
    transactionValue: { type: Number },
    frequencyAnomaly: { type: Number },
    agentBehavior: { type: Number }
  }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
