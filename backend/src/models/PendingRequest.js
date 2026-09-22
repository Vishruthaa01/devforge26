const mongoose = require('mongoose');

const pendingRequestSchema = new mongoose.Schema({
  requestId: { type: String, required: true, unique: true },
  agentId: { type: String, required: true },
  action: { type: String, required: true },
  targetRoute: { type: String, required: true },
  payload: { type: mongoose.Schema.Types.Mixed },
  riskScore: { type: Number, required: true },
  riskFactors: {
    actionRisk: { type: Number },
    dataSensitivity: { type: Number },
    transactionValue: { type: Number },
    frequencyAnomaly: { type: Number },
    agentBehavior: { type: Number }
  },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PendingRequest', pendingRequestSchema);
