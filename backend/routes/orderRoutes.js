const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const auth = require('../middleware/auth');

// ─── POST /api/orders ───────────────────────────────────────────────────────
// Save a completed order. Auth is optional: logged-in users get the order
// linked to their account; guests can still save without a token.
router.post('/', async (req, res) => {
  try {
    const { orderId, items, totalMAD, totalEUR, stripePaymentIntentId } = req.body;

    if (!orderId || !items?.length || totalMAD == null || totalEUR == null) {
      return res.status(400).json({ error: 'orderId, items, totalMAD and totalEUR are required' });
    }

    // Try to read auth token without hard-failing if absent
    let userId = null;
    const authHeader = req.headers['authorization'] || req.headers['x-auth-token'];
    if (authHeader) {
      try {
        const jwt = require('jsonwebtoken');
        const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        userId = decoded.id || decoded._id || null;
      } catch (_) { /* anonymous order — fine */ }
    }

    const order = await Order.create({
      user: userId,
      orderId,
      items,
      totalMAD,
      totalEUR,
      stripePaymentIntentId: stripePaymentIntentId || '',
      status: 'paid',
    });

    res.status(201).json(order);
  } catch (err) {
    console.error('Order save error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/orders ─────────────────────────────────────────────────────────
// Return the 20 most recent orders for the authenticated user.
// Requires a valid JWT.
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    res.json(orders);
  } catch (err) {
    console.error('Order fetch error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
