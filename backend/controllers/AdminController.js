const mongoose = require('mongoose');
const appPackageJson = require('../package.json');
const User = require('../models/UserModels');
const Product = require('../models/ProductModel');
const MealPlan = require('../models/MealPlan');
const Ingredient = require('../models/ingredients');
const ActivityLog = require('../models/ActivityLog');

const logActivity = async (adminId, action, targetType, targetId, details) => {
    try {
        await ActivityLog.create({
            admin: adminId,
            action,
            targetType: targetType || null,
            targetId: targetId || null,
            details: details || ''
        });
    } catch (error) {
        console.error('Error in logActivity:', error);
    }
};

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
    try {
        // ── Users (counts the whole database, not the logged-in admin) ──
        const totalUsers = await User.countDocuments({});
        const activeUsers = await User.countDocuments({ isActive: true });
        const inactiveUsers = totalUsers - activeUsers;

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const newUsersThisWeek = await User.countDocuments({
            createdAt: { $gte: sevenDaysAgo }
        });

        // ── Products (whole database) ───────────────────────────────────
        const totalRecipes = await Product.countDocuments({});
        const recipesAddedThisWeek = await Product.countDocuments({
            createdAt: { $gte: sevenDaysAgo }
        });

        // ── Favorites (sum across every user) ───────────────────────────
        const allUsers = await User.find({}).select('favorites');
        let totalFavorites = 0;
        for (let i = 0; i < allUsers.length; i++) {
            totalFavorites += allUsers[i].favorites.length;
        }

        // ── Most active users (by number of products submitted) ────────
        const topContributors = await Product.aggregate([
            { $group: { _id: '$user', productCount: { $sum: 1 } } },
            { $sort: { productCount: -1 } },
            { $limit: 5 }
        ]);

        const mostActiveUsers = [];
        for (let i = 0; i < topContributors.length; i++) {
            const contributor = topContributors[i];
            const user = await User.findById(contributor._id).select('name surname email');
            if (user) {
                mostActiveUsers.push({
                    _id: user._id,
                    name: user.name,
                    surname: user.surname,
                    email: user.email,
                    productCount: contributor.productCount
                });
            }
        }

        // ── Other existing collections ─────────────────────────────────
        const totalIngredients = await Ingredient.countDocuments({});
        const totalMealPlans = await MealPlan.countDocuments({});

        const mealPlansByDay = await MealPlan.aggregate([
            { $group: { _id: '$dayOfWeek', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        const mealPlansByType = await MealPlan.aggregate([
            { $group: { _id: '$mealType', count: { $sum: 1 } } }
        ]);

        const ingredientsByCategory = await Ingredient.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        const recentUsers = await User.find({})
            .select('name surname email createdAt role isActive')
            .sort({ createdAt: -1 })
            .limit(5);

        const recentRecipes = await Product.find({})
            .populate('user', 'name surname email')
            .sort({ createdAt: -1 })
            .limit(5);

        const recentIngredients = await Ingredient.find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .select('name category unit createdAt');

        res.json({
            stats: {
                totalUsers,
                activeUsers,
                inactiveUsers,
                newUsersThisWeek,
                totalRecipes,
                recipesAddedThisWeek,
                totalFavorites,
                totalIngredients,
                totalMealPlans,
            },
            charts: {
                mealPlansByDay,
                mealPlansByType,
                ingredientsByCategory,
            },
            mostActiveUsers,
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

        await logActivity(req.user.id, 'User role updated', 'User', user._id, `Role changed to ${role}`);

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

// @desc    Activate or deactivate a user account
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        if (typeof isActive !== 'boolean') {
            return res.status(400).json({ message: 'isActive must be true or false.' });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.isActive = isActive;
        await user.save();

        const actionLabel = isActive ? 'User activated' : 'User deactivated';
        await logActivity(req.user.id, actionLabel, 'User', user._id, '');

        res.json({
            message: isActive ? 'User account activated' : 'User account deactivated',
            user: {
                _id: user._id,
                name: user.name,
                surname: user.surname,
                email: user.email,
                isActive: user.isActive
            }
        });
    } catch (error) {
        console.error('Error in updateUserStatus:', error);
        res.status(500).json({ message: 'Server error updating user status' });
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

        await logActivity(req.user.id, 'User deleted', 'User', id, `${user.name} ${user.surname}`);

        res.json({ message: 'User and all associated recipes successfully deleted.' });
    } catch (error) {
        console.error('Error in deleteUser:', error);
        res.status(500).json({ message: 'Server error deleting user' });
    }
};

// @desc    Get all products for content management
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

// @desc    Update a product's review status (pending / approved / rejected)
// @route   PUT /api/admin/recipes/:id/status
// @access  Private/Admin
const updateRecipeStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status. Must be pending, approved or rejected.' });
        }

        const recipe = await Product.findById(id);
        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        recipe.status = status;
        await recipe.save();

        await logActivity(req.user.id, `Product ${status}`, 'Product', recipe._id, recipe.title);

        res.json({ message: `Recipe status updated to ${status}`, recipe });
    } catch (error) {
        console.error('Error in updateRecipeStatus:', error);
        res.status(500).json({ message: 'Server error updating recipe status' });
    }
};

// @desc    Delete a product (content management)
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

        await logActivity(req.user.id, 'Product deleted', 'Product', id, recipe.title);

        res.json({ message: 'Recipe successfully removed by admin.' });
    } catch (error) {
        console.error('Error in deleteRecipe:', error);
        res.status(500).json({ message: 'Server error deleting recipe' });
    }
};

// @desc    Get recent activity logs
// @route   GET /api/admin/activity-logs
// @access  Private/Admin
const getActivityLogs = async (req, res) => {
    try {
        const logs = await ActivityLog.find({})
            .populate('admin', 'name surname email')
            .sort({ createdAt: -1 })
            .limit(100);
        res.json(logs);
    } catch (error) {
        console.error('Error in getActivityLogs:', error);
        res.status(500).json({ message: 'Server error retrieving activity logs' });
    }
};

// @desc    Get analytics data (registrations/submissions over time, approval rate, etc.)
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getAnalytics = async (req, res) => {
    try {
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

        const userRegistrationsByDay = await User.aggregate([
            { $match: { createdAt: { $gte: fourteenDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const productSubmissionsByDay = await Product.aggregate([
            { $match: { createdAt: { $gte: fourteenDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const totalRecipes = await Product.countDocuments({});
        const approvedRecipes = await Product.countDocuments({ status: 'approved' });
        const approvalRate = totalRecipes > 0 ? Math.round((approvedRecipes / totalRecipes) * 100) : 0;

        const topContributors = await Product.aggregate([
            { $group: { _id: '$user', productCount: { $sum: 1 } } },
            { $sort: { productCount: -1 } },
            { $limit: 5 }
        ]);

        const mostActiveContributors = [];
        for (let i = 0; i < topContributors.length; i++) {
            const contributor = topContributors[i];
            const user = await User.findById(contributor._id).select('name surname email');
            if (user) {
                mostActiveContributors.push({
                    _id: user._id,
                    name: user.name,
                    surname: user.surname,
                    email: user.email,
                    productCount: contributor.productCount
                });
            }
        }

        const totalUsers = await User.countDocuments({});
        const allUsers = await User.find({}).select('favorites');
        let totalFavorites = 0;
        for (let i = 0; i < allUsers.length; i++) {
            totalFavorites += allUsers[i].favorites.length;
        }
        const averageFavoritesPerUser = totalUsers > 0 ? (totalFavorites / totalUsers).toFixed(1) : '0';

        res.json({
            userRegistrationsByDay,
            productSubmissionsByDay,
            approvalRate,
            totalRecipes,
            approvedRecipes,
            mostActiveContributors,
            favoritesStats: {
                totalFavorites,
                averageFavoritesPerUser
            }
        });
    } catch (error) {
        console.error('Error in getAnalytics:', error);
        res.status(500).json({ message: 'Server error retrieving analytics' });
    }
};

// @desc    Get system overview (backend/database status, version, environment)
// @route   GET /api/admin/system-overview
// @access  Private/Admin
const getSystemOverview = async (req, res) => {
    try {
        const dbStateLabels = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting'
        };
        const databaseStatus = dbStateLabels[mongoose.connection.readyState] || 'unknown';

        const lastUser = await User.findOne({}).sort({ updatedAt: -1 }).select('updatedAt');
        const lastProduct = await Product.findOne({}).sort({ updatedAt: -1 }).select('updatedAt');

        let lastDatabaseUpdate = null;
        if (lastUser && lastProduct) {
            lastDatabaseUpdate = lastUser.updatedAt > lastProduct.updatedAt ? lastUser.updatedAt : lastProduct.updatedAt;
        } else if (lastUser) {
            lastDatabaseUpdate = lastUser.updatedAt;
        } else if (lastProduct) {
            lastDatabaseUpdate = lastProduct.updatedAt;
        }

        res.json({
            backendStatus: 'online',
            databaseStatus,
            applicationVersion: appPackageJson.version,
            environment: process.env.NODE_ENV || 'development',
            lastDatabaseUpdate
        });
    } catch (error) {
        console.error('Error in getSystemOverview:', error);
        res.status(500).json({ message: 'Server error retrieving system overview' });
    }
};

module.exports = {
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
};
