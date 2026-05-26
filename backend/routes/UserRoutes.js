const express = require('express');
const router = express.Router();
const { registerUser, loginUser, addFavorite, removeFavorite, getFavorites } = require('../controllers/UserControls');
const User = require('../models/UserModels');
const auth = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Routes pour les favoris
router.post('/favorites/add/:userId', auth, addFavorite);
router.delete('/favorites/:userId/:recipeId', auth, removeFavorite);
router.get('/favorites/:userId', auth, getFavorites);

module.exports = router;
