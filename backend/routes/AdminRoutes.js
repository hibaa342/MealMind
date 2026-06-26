const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const {
    getDashboardStats,
    getAllUsers,
    updateUserRole,
    updateUserStatus,
    deleteUser,
    getAllRecipes,
    updateRecipeStatus,
    deleteRecipe,
    getActivityLogs,
    getAnalytics,
    getSystemOverview
} = require('../controllers/AdminController');

router.use(auth);
router.use(admin);

// Dashboard
router.get('/stats', getDashboardStats);

// Users
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);

// Content Management (Products)
router.get('/recipes', getAllRecipes);
router.put('/recipes/:id/status', updateRecipeStatus);
router.delete('/recipes/:id', deleteRecipe);

// Activity Logs
router.get('/activity-logs', getActivityLogs);

// Analytics
router.get('/analytics', getAnalytics);

// System Overview
router.get('/system-overview', getSystemOverview);

module.exports = router;