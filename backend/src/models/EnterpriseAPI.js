const mongoose = require('mongoose');

const enterpriseApiSchema = new mongoose.Schema({
  apiId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  baseUrl: { type: String, required: true },
  department: { type: String },
  environment: { type: String, default: 'PRODUCTION' },
  version: { type: String, default: 'v1' },
  status: { type: String, enum: ['ACTIVE', 'DEPRECATED', 'OFFLINE'], default: 'ACTIVE' },
  authenticationType: { type: String, default: 'OAUTH2' },
  sensitivity: { type: String, enum: ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED'], default: 'INTERNAL' },
  riskLevel: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'LOW' },
  owner: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('EnterpriseAPI', enterpriseApiSchema);
