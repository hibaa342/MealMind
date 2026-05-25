const express = require('express');
const router = express.Router();
const { registerUser, loginUser, addFavorite, removeFavorite, getFavorites } = require('../controllers/UserControls');

// Routes pour l'authentification
router.post('/register', registerUser);
router.post('/login', loginUser);

// Routes pour les favoris
router.post('/favorites/add/:userId', addFavorite);
router.delete('/favorites/:userId/:recipeId', removeFavorite);
router.get('/favorites/:userId', getFavorites);

module.exports = router;
