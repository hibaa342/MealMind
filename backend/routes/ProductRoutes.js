const express = require('express');
const router = express.Router();
const { getProducts, addProduct, updateProduct, deleteProduct, getMyApprovedRecipes } = require('../controllers/ProductController');
const { upload } = require('../config/cloudinaryConfig');
const auth = require('../middleware/auth');

// Get all recipes belonging to the logged-in user
router.get('/', auth, getProducts);

// Get only the approved recipes belonging to the logged-in user
// Must be defined before /:id to avoid being caught by the param route
router.get('/mine/approved', auth, getMyApprovedRecipes);

// Add a new recipe (with Cloudinary image upload)
router.post('/', auth, (req, res, next) => {
    upload.single('image')(req, res, (err) => {
        if (err) {
            console.error('MULTER/CLOUDINARY ERROR:', err.message);
            return res.status(500).json({ message: err.message });
        }
        next();
    });
}, addProduct);

router.put('/:id', auth, upload.single('image'), updateProduct);
router.delete('/:id', auth, deleteProduct);

module.exports = router;
