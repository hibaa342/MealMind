const Product = require('../models/ProductModel');

// @desc    Obtenir tous les produits
// @route   GET /api/products
// @access  Private
const getProducts = async (req, res) => {
    try {
        // IMPORTANT: On filtre par l'ID de l'utilisateur qui vient du middleware !
        const products = await Product.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur lors de la récupération' });
    }
};
// @desc    Ajouter un nouveau produit
// @route   POST /api/products
// @access  Public (simulé admin côté front par localhost)
const addProduct = async (req, res) => {
    try {
        console.log('req.body:', req.body);   // ADD THIS
        console.log('req.file:', req.file); 
        const { title, time, categories, rating, tags, accent } = req.body;
        const image = req.file ? req.file.path : req.body.image;

        if (!image) return res.status(400).json({ message: 'Une image est requise' });

        const product = await Product.create({
            user: req.user.id, // <--- On ajoute le propriétaire ici !
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
    res.status(500).json({ message: 'Erreur serveur lors de la création' });
}
};

// @desc    Mettre à jour un produit
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

        if (!product) return res.status(404).json({ message: 'Produit introuvable' });
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur lors de la mise à jour' });
    }
};
    const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        if (!product) return res.status(404).json({ message: 'Produit introuvable' });
        res.status(200).json({ message: 'Produit supprimé' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
};
module.exports = {
    getProducts,
    addProduct,
    updateProduct,
    deleteProduct
};
