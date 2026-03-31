const Product = require('../models/ProductModel');

// @desc    Obtenir tous les produits
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.status(200).json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur lors de la récupération des produits' });
    }
};

// @desc    Ajouter un nouveau produit
// @route   POST /api/products
// @access  Public (simulé admin côté front par localhost)
const addProduct = async (req, res) => {
    try {
        console.log('Request body:', req.body);
        console.log('Request file:', req.file);

        const { title, time, categories, rating, tags, accent } = req.body;
        
        // L'image est maintenant uploadée via multer et disponible dans req.file
        const image = req.file ? req.file.path : req.body.image;

        if (!image) {
            return res.status(400).json({ message: 'Une image est requise' });
        }

        const product = await Product.create({
            title,
            time,
            categories,
            rating,
            tags: Array.isArray(tags) ? tags : (tags ? tags.split(',') : []),
            image,
            accent
        });

        if (product) {
            res.status(201).json(product);
        } else {
            res.status(400).json({ message: 'Données produit invalides' });
        }
    } catch (error) {
        console.error('Add Product Error:', error);
        res.status(500).json({ 
            message: 'Erreur serveur lors de l\'ajout du produit',
            error: error.message,
            details: error.errors // Pour les erreurs de validation Mongoose
        });
    }
};

// @desc    Modifier un produit
// @route   PUT /api/products/:id
// @access  Public (simulé admin côté front par localhost)
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, time, categories, rating, tags, accent } = req.body;
        
        let updateData = {
            title,
            time,
            categories,
            rating,
            accent
        };

        if (tags) {
            updateData.tags = Array.isArray(tags) ? tags : tags.split(',');
        }

        // Si une nouvelle image est uploadée
        if (req.file) {
            updateData.image = req.file.path;
        }

        const product = await Product.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

        if (product) {
            res.status(200).json(product);
        } else {
            res.status(404).json({ message: 'Produit non trouvé' });
        }
    } catch (error) {
        console.error('Update Product Error:', error);
        res.status(500).json({ 
            message: 'Erreur serveur lors de la modification du produit',
            error: error.message,
            details: error.errors
        });
    }
};

module.exports = {
    getProducts,
    addProduct,
    updateProduct
};
