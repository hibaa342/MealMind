const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/UserControls');

// Routes pour l'authentification
router.post('/register', registerUser);
router.post('/login', loginUser);

module.exports = router;
