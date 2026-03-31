const express = require('express');
const router = express.Router();
const { getProducts, addProduct, updateProduct } = require('../controllers/ProductController');
const { upload } = require('../config/cloudinaryConfig');

router.get('/', getProducts);
router.post('/', upload.single('image'), addProduct);
router.put('/:id', upload.single('image'), updateProduct);

module.exports = router;
