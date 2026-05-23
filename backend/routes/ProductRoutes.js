const express = require('express');
const router = express.Router();
const { getProducts, addProduct, updateProduct, deleteProduct } = require('../controllers/ProductController');
const { upload } = require('../config/cloudinaryConfig');
const auth = require('../middleware/auth');

router.get('/', auth, getProducts);
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