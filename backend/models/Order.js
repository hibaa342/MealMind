const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  id:           { type: String, required: true },
  name:         { type: String, required: true },
  unit:         { type: String, required: true },
  pricePerUnit: { type: Number, required: true },
  quantity:     { type: Number, required: true },
  imageUrl:     { type: String, default: '' },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  // If the user is logged in we link to their account; guests leave this null
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  // Human-readable order reference (e.g. "ORD-2026-042")
  orderId: {
    type: String,
    required: true,
  },
  items: {
    type: [orderItemSchema],
    required: true,
  },
  // Total in MAD (local currency)
  totalMAD: {
    type: Number,
    required: true,
  },
  // Amount charged in EUR via Stripe
  totalEUR: {
    type: Number,
    required: true,
  },
  // Stripe PaymentIntent ID for reference / refund support
  stripePaymentIntentId: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'paid',
  },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
