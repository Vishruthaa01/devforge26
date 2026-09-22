const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  status: { type: String, enum: ['AVAILABLE', 'OUT_OF_STOCK', 'DISCONTINUED'], default: 'AVAILABLE' },
  supplier: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
