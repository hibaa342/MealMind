const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const {
    getDashboardStats,
    getAllUsers,
    updateUserRole,
    deleteUser,
    getAllRecipes,
    deleteRecipe
} = require('../controllers/AdminController');

// All routes under this router require user auth AND admin role
router.use(auth);
router.use(admin);

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);
router.get('/recipes', getAllRecipes);
router.delete('/recipes/:id', deleteRecipe);

module.exports = router;
