const Product = require('../models/ProductModel');

// @desc    Get all products belonging to the logged-in user
// @route   GET /api/products
// @access  Private
const getProducts = async (req, res) => {
    try {
        const products = await Product.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server error retrieving products' });
    }
};

// @desc    Get only approved products belonging to the logged-in user
// @route   GET /api/products/mine/approved
// @access  Private
const getMyApprovedRecipes = async (req, res) => {
    try {
        const products = await Product.find({
            user: req.user.id,
            status: 'approved',
        }).sort({ createdAt: -1 });
        res.status(200).json(products);
    } catch (error) {
        console.error('Error fetching approved recipes:', error.message);
        res.status(500).json({ message: 'Server error retrieving approved recipes' });
    }
};

// @desc    Add a new product
// @route   POST /api/products
// @access  Private
const addProduct = async (req, res) => {
    try {
        const {
            title,
            description,
            time,
            categories,
            rating,
            tags,
            accent,
            instructions,
        } = req.body;

        const image = req.file ? req.file.path : req.body.image;
        if (!image) return res.status(400).json({ message: 'An image is required' });

        let ingredients = [];
        if (req.body.ingredients) {
            try {
                ingredients = JSON.parse(req.body.ingredients);
            } catch {
                ingredients = [];
            }
        }

        const product = await Product.create({
            user: req.user.id,
            title,
            description: description || '',
            time,
            categories,
            rating: rating ? Number(rating) : 0,
            tags: Array.isArray(tags)
                ? tags
                : tags
                ? tags.split(',').map((t) => t.trim()).filter(Boolean)
                : [],
            image,
            accent: accent || 'green',
            ingredients,
            instructions: instructions || '',
        });

        res.status(201).json(product);
    } catch (error) {
        console.error('PRODUCT ERROR:', error.message);
        res.status(500).json({ message: 'Server error creating product' });
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private
const updateProduct = async (req, res) => {
    try {
        const { title, description, time, categories, rating, tags, accent, instructions } = req.body;
        const image = req.file ? req.file.path : req.body.image;

        const update = {};
        if (title        !== undefined) update.title        = title;
        if (description  !== undefined) update.description  = description;
        if (time         !== undefined) update.time         = time;
        if (categories   !== undefined) update.categories   = categories;
        if (rating       !== undefined) update.rating       = rating;
        if (accent       !== undefined) update.accent       = accent;
        if (instructions !== undefined) update.instructions = instructions;
        if (tags !== undefined) {
            update.tags = Array.isArray(tags)
                ? tags
                : tags
                ? tags.split(',').map((t) => t.trim()).filter(Boolean)
                : [];
        }
        if (req.body.ingredients !== undefined) {
            try {
                update.ingredients = JSON.parse(req.body.ingredients);
            } catch {
                update.ingredients = [];
            }
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

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private
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
    getMyApprovedRecipes,
    addProduct,
    updateProduct,
    deleteProduct,
};
