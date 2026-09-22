const mongoose = require('mongoose');

const endpointSchema = new mongoose.Schema({
  endpointId: { type: String, required: true, unique: true },
  apiId: { type: String, required: true, ref: 'EnterpriseAPI' }, // reference to EnterpriseAPI.apiId
  method: { type: String, required: true, enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] },
  path: { type: String, required: true },
  action: { type: String, required: true }, // e.g. READ_CUSTOMER
  description: { type: String },
  sensitivity: { type: String, enum: ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED'], default: 'INTERNAL' },
  requiredPermission: { type: String },
  riskLevel: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'LOW' },
  approvalRequired: { type: String, enum: ['NEVER', 'CONDITIONAL', 'ALWAYS'], default: 'CONDITIONAL' },
  blocked: { type: Boolean, default: false },
  rateLimit: { type: Number, default: 100 }, // requests per minute
  enabled: { type: Boolean, default: true }
}, { timestamps: true });

// Compound index to quickly find an endpoint by method and path
endpointSchema.index({ method: 1, path: 1 });

module.exports = mongoose.model('Endpoint', endpointSchema);
