const express = require('express');
const router = express.Router();
const MealPlan = require('../models/MealPlan');
const Expense = require('../models/Expense');
const User = require('../models/UserModels');
// Assuming you have an auth middleware like in your other routes
const auth = require('../middleware/auth'); 

// Get user budget and manual expenses
router.get('/budget-data', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('budgetLimit');
    const expenses = await Expense.find({ userId: req.user.id });
    res.json({ budgetLimit: user.budgetLimit, expenses });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching budget data' });
  }
});

// Update budget limit
router.put('/budget-limit', auth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user.id, { budgetLimit: req.body.limit }, { new: true });
    res.json({ budgetLimit: user.budgetLimit });
  } catch (err) {
    res.status(500).json({ message: 'Error updating budget limit' });
  }
});

// Add manual expense
router.post('/expenses', auth, async (req, res) => {
  try {
    const newExpense = new Expense({ userId: req.user.id, amount: req.body.amount });
    const saved = await newExpense.save();
    res.json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get user plans
router.get('/', auth, async (req, res) => {
  try {
    const plans = await MealPlan.find({ userId: req.user.id });
    res.json(plans);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Add to plan
router.post('/', auth, async (req, res) => {
  try {
    const newPlan = new MealPlan({
      ...req.body,
      userId: req.user._id || req.user.id
    });
    const savedPlan = await newPlan.save();
    res.json(savedPlan);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete from plan
router.delete('/:id', auth, async (req, res) => {
  try {
    await MealPlan.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user.id || req.user._id 
    });
    res.json({ msg: 'Meal removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;