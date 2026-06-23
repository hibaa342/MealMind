const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getProfile, updateProfile, getTopRecipes } = require('../controllers/UserControls');

router.get('/profile/top-recipes', auth, getTopRecipes);
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);

module.exports = router;
