const User = require('../models/UserModels');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const body = req.body || {};
        let { name, surname, birthDate, city, email, password } = body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please fill in all required fields' });
        }

        // Normalize email
        const normalizedEmail = email.toLowerCase().trim();

        // Check if user already exists
        const userExists = await User.findOne({ email: normalizedEmail });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create the user
        const user = await User.create({
            name,
            surname,
            birthDate,
            city,
            email: normalizedEmail,
            password: hashedPassword
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                surname: user.surname,
                email: user.email,
                role: user.role,
                token: generateToken(user._id, user.role)
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// @desc    Authenticate a user and get a token
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const body = req.body || {};
        const { email, password } = body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide an email and password' });
        }

        // Normalize email to match stored data
        const normalizedEmail = email.toLowerCase().trim();

        // Find user by email
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            console.log(`[AUTH] Failed: User not found (${normalizedEmail})`);
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // DEBUG: If you just migrated the code, check if the password in DB is hashed
        if (!user.password.startsWith('$2')) {
            console.warn(`[AUTH] Warning: The password in DB for ${normalizedEmail} is not properly hashed!`);
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            console.log(`[AUTH] Success: Login successful for ${normalizedEmail}`);
            res.json({
                _id: user._id,
                name: user.name,
                surname: user.surname,
                email: user.email,
                role: user.role,
                token: generateToken(user._id, user.role)
            });
        } else {
            console.log(`[AUTH] Failed: Incorrect password for ${normalizedEmail}`);
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// Générer un JWT
const generateToken = (id, role) => {
    // Convert ObjectId to string to avoid payload errors
    const userId = id.toString();
    return jwt.sign({ id: userId, role }, process.env.JWT_SECRET || 'your_jwt_secret', {
        expiresIn: '30d',
    });
};

// @desc    Add a recipe to favorites
// @route   POST /api/users/favorites/add
// @access  Private
const addFavorite = async (req, res) => {
    try {
        const { userId } = req.params;
        const { recipeId, title, image } = req.body;

        if (!userId || !recipeId) {
            return res.status(400).json({ message: 'userId and recipeId are required' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if recipe is already in favorites
        const alreadyExists = user.favorites.some(fav => fav.id === recipeId);
        if (alreadyExists) {
            return res.status(400).json({ message: 'This recipe is already in favorites' });
        }

        user.favorites.push({
            id: recipeId,
            title: title,
            image: image,
            addedAt: new Date()
        });

        await user.save();
        res.json({ message: 'Recipe added to favorites', favorites: user.favorites });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error adding to favorites' });
    }
};

// @desc    Remove a recipe from favorites
// @route   DELETE /api/users/favorites/:userId/:recipeId
// @access  Private
const removeFavorite = async (req, res) => {
    try {
        const { userId, recipeId } = req.params;

        if (!userId || !recipeId) {
            return res.status(400).json({ message: 'userId and recipeId are required' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.favorites = user.favorites.filter(fav => fav.id !== recipeId);
        await user.save();

        res.json({ message: 'Recipe removed from favorites', favorites: user.favorites });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during removal' });
    }
};

// @desc    Get a user's favorites
// @route   GET /api/users/favorites/:userId
// @access  Private
const getFavorites = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ message: 'userId is required' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ favorites: user.favorites });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error retrieving favorites' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    addFavorite,
    removeFavorite,
    getFavorites
};
