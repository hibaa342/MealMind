const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const User = require('../models/UserModels');
const auth = require('../middleware/auth');

// Get all notifications for a user
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    // If Pause All is active, logically we might still show history but logic for sending new ones would stop
    const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(50);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching notifications' });
  }
});

// Get notification settings
router.get('/settings', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('notificationSettings');
    res.json(user.notificationSettings);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching settings' });
  }
});

// Update notification settings
router.put('/settings', auth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { notificationSettings: req.body },
      { new: true }
    ).select('notificationSettings');
    res.json(user.notificationSettings);
  } catch (err) {
    res.status(500).json({ message: 'Error updating settings' });
  }
});

// Mark a specific notification as read
router.patch('/:id', auth, async (req, res) => {
  try {
    const updated = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { isRead: true },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Error updating notification' });
  }
});

module.exports = router;