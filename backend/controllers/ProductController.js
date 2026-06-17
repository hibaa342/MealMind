const Product = require('../models/ProductModel');

// @desc    Get all products
// @route   GET /api/products
// @access  Private
const getProducts = async (req, res) => {
    try {
        // IMPORTANT: We filter by the user ID that comes from the middleware!
        const products = await Product.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server error retrieving products' });
    }
};
// @desc    Add a new product
// @route   POST /api/products
// @access  Public (simulated admin on front by localhost)
const addProduct = async (req, res) => {
    try {
        console.log('req.body:', req.body);   // ADD THIS
        console.log('req.file:', req.file); 
        const { title, time, categories, rating, tags, accent } = req.body;
        const image = req.file ? req.file.path : req.body.image;

        if (!image) return res.status(400).json({ message: 'An image is required' });

        const product = await Product.create({
            user: req.user.id, // Add the owner here!
            title,
            time,
            categories,
            rating,
            tags: Array.isArray(tags) ? tags : (tags ? tags.split(',') : []),
            image,
            accent
        });

        res.status(201).json(product);
    }  catch (error) {
    console.error('PRODUCT ERROR:', error.message);
    res.status(500).json({ message: 'Server error creating product' });
}
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private
const updateProduct = async (req, res) => {
    try {
        const { title, time, categories, rating, tags, accent } = req.body;
        const image = req.file ? req.file.path : req.body.image;

        const update = {};
        if (title !== undefined) update.title = title;
        if (time !== undefined) update.time = time;
        if (categories !== undefined) update.categories = categories;
        if (rating !== undefined) update.rating = rating;
        if (accent !== undefined) update.accent = accent;
        if (tags !== undefined) {
            update.tags = Array.isArray(tags) ? tags : (tags ? tags.split(',') : []);
        }
        if (image !== undefined) update.image = image;

        const product = await Product.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            update,
            { new: true, runValidators: true }
        );

        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Server error updating product' });
    }
};
    const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.status(200).json({ message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
module.exports = {
    getProducts,
    addProduct,
    updateProduct,
    deleteProduct
};
