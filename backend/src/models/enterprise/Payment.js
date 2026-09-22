const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  paymentId: { type: String, required: true, unique: true },
  customerId: { type: String, required: true, ref: 'Customer' },
  orderId: { type: String, required: true, ref: 'Order' },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  paymentMethod: { type: String, enum: ['CREDIT_CARD', 'PAYPAL', 'BANK_TRANSFER', 'WALLET'], default: 'CREDIT_CARD' },
  status: { type: String, enum: ['SUCCESS', 'PENDING', 'FAILED', 'REFUNDED'], default: 'SUCCESS' },
  transactionDate: { type: Date, default: Date.now },
  referenceNumber: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
