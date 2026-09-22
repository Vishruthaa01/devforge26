const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  customerId: { type: String, required: true, ref: 'Customer' },
  items: [{
    productId: String,
    name: String,
    quantity: Number,
    price: Number
  }],
  subtotal: { type: Number, required: true },
  tax: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'], default: 'PENDING' },
  orderStatus: { type: String, enum: ['PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'], default: 'PROCESSING' },
  shippingStatus: { type: String, default: 'PREPARING' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
