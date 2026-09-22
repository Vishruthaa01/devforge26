const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
  agentId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  agentType: { type: String, default: 'INTERNAL' },
  owner: { type: String },
  department: { type: String },
  environment: { type: String, default: 'PRODUCTION' },
  status: { type: String, enum: ['ACTIVE', 'DISABLED'], default: 'ACTIVE' },
  role: { type: String, required: true },
  token: { type: String },
  allowedApis: [{ type: String }],
  riskLevel: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'LOW' },
  requestCount: { type: Number, default: 0 },
  blockedRequestCount: { type: Number, default: 0 },
  approvalRequestCount: { type: Number, default: 0 },
  lastActiveAt: { type: Date },
}, { timestamps: true
});

module.exports = mongoose.model('Agent', agentSchema);
