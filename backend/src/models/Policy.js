const mongoose = require('mongoose');

const policySchema = new mongoose.Schema({
  policyId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  // conditions could be structured as an array of rules: [{ field: 'agentRole', operator: 'equals', value: 'finance' }]
  conditions: [{ type: mongoose.Schema.Types.Mixed }],
  action: { type: String }, // e.g. REFUND, or '*' for any
  effect: { type: String, enum: ['ALLOW', 'BLOCK', 'APPROVAL'], required: true },
  priority: { type: Number, default: 100 }, // lower number = higher priority
  enabled: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Policy', policySchema);
