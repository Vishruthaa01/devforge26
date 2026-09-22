const mongoose = require('mongoose');

const refundSchema = new mongoose.Schema({
  refundId: { type: String, required: true, unique: true },
  paymentId: { type: String, required: true, ref: 'Payment' },
  orderId: { type: String, required: true, ref: 'Order' },
  customerId: { type: String, required: true, ref: 'Customer' },
  amount: { type: Number, required: true },
  reason: { type: String },
  status: { type: String, enum: ['REQUESTED', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'PROCESSED', 'FAILED'], default: 'PROCESSED' },
  requestedBy: { type: String }, // Can be the Agent ID
  approvedBy: { type: String },
  processedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Refund', refundSchema);
