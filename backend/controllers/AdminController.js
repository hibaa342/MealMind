const User = require('../models/UserModels');
const Product = require('../models/ProductModel');
const MealPlan = require('../models/MealPlan');
const Notification = require('../models/Notification');
const Ingredient = require('../models/ingredients');

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
    try {
        // On compte les utilisateurs et les admins
        const totalUsers = await User.countDocuments({});
        const totalAdmins = await User.countDocuments({ role: 'admin' });
        const totalStandardUsers = totalUsers - totalAdmins;

        // On compte les recettes, les ingrédients et les meal plans
        const totalRecipes = await Product.countDocuments({});
        const totalIngredients = await Ingredient.countDocuments({});
        const totalMealPlans = await MealPlan.countDocuments({});

        // On compte les notifications (toutes, puis seulement les non lues)
        const totalNotifications = await Notification.countDocuments({});
        const unreadNotifications = await Notification.countDocuments({ isRead: false });

        // On calcule la date d'il y a 7 jours pour voir les nouveaux inscrits
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const newUsersThisWeek = await User.countDocuments({
            createdAt: { $gte: sevenDaysAgo }
        });

        // Répartition des meal plans par jour de la semaine
        const mealPlansByDay = await MealPlan.aggregate([
            { $group: { _id: '$dayOfWeek', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        // Répartition des meal plans par type de repas (petit-déj, déjeuner, etc.)
        const mealPlansByType = await MealPlan.aggregate([
            { $group: { _id: '$mealType', count: { $sum: 1 } } }
        ]);

        // Répartition des ingrédients par catégorie
        const ingredientsByCategory = await Ingredient.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // Répartition des notifications par type
        const notificationsByType = await Notification.aggregate([
            { $group: { _id: '$type', count: { $sum: 1 } } }
        ]);

        // Les 5 derniers utilisateurs inscrits
        const recentUsers = await User.find({})
            .select('name surname email createdAt role')
            .sort({ createdAt: -1 })
            .limit(5);

        // Les 5 dernières recettes ajoutées
        const recentRecipes = await Product.find({})
            .populate('user', 'name surname email')
            .sort({ createdAt: -1 })
            .limit(5);

        // Les 5 derniers ingrédients ajoutés
        const recentIngredients = await Ingredient.find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .select('name category unit createdAt');

        res.json({
            stats: {
                totalUsers,
                totalAdmins,
                totalStandardUsers,
                totalRecipes,
                totalIngredients,
                totalMealPlans,
                totalNotifications,
                unreadNotifications,
                newUsersThisWeek,
            },
            charts: {
                mealPlansByDay,
                mealPlansByType,
                ingredientsByCategory,
                notificationsByType,
            },
            recentUsers,
            recentRecipes,
            recentIngredients,
        });
    } catch (error) {
        console.error('Error in getDashboardStats:', error);
        res.status(500).json({ message: 'Server error retrieving admin stats' });
    }
};

// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        console.error('Error in getAllUsers:', error);
        res.status(500).json({ message: 'Server error retrieving users list' });
    }
};

// @desc    Update a user's role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!role || !['user', 'admin'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role provided. Must be user or admin.' });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.role = role;
        await user.save();

        res.json({
            message: `User role successfully updated to ${role}`,
            user: {
                _id: user._id,
                name: user.name,
                surname: user.surname,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Error in updateUserRole:', error);
        res.status(500).json({ message: 'Server error updating user role' });
    }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (id === req.user.id) {
            return res.status(400).json({ message: 'You cannot delete your own admin account.' });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await Product.deleteMany({ user: id });
        await User.findByIdAndDelete(id);

        res.json({ message: 'User and all associated recipes successfully deleted.' });
    } catch (error) {
        console.error('Error in deleteUser:', error);
        res.status(500).json({ message: 'Server error deleting user' });
    }
};

// @desc    Get all recipes for moderation
// @route   GET /api/admin/recipes
// @access  Private/Admin
const getAllRecipes = async (req, res) => {
    try {
        const recipes = await Product.find({})
            .populate('user', 'name surname email')
            .sort({ createdAt: -1 });
        res.json(recipes);
    } catch (error) {
        console.error('Error in getAllRecipes:', error);
        res.status(500).json({ message: 'Server error retrieving recipes' });
    }
};

// @desc    Delete a recipe (moderation)
// @route   DELETE /api/admin/recipes/:id
// @access  Private/Admin
const deleteRecipe = async (req, res) => {
    try {
        const { id } = req.params;
        const recipe = await Product.findById(id);
        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        await Product.findByIdAndDelete(id);
        res.json({ message: 'Recipe successfully removed by admin.' });
    } catch (error) {
        console.error('Error in deleteRecipe:', error);
        res.status(500).json({ message: 'Server error deleting recipe' });
    }
};

module.exports = {
    getDashboardStats,
    getAllUsers,
    updateUserRole,
    deleteUser,
    getAllRecipes,
    deleteRecipe
};