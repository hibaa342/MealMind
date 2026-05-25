const User = require('../models/UserModels');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @desc    Enregistrer un nouvel utilisateur
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const body = req.body || {};
        let { name, surname, birthDate, city, email, password } = body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Veuillez remplir tous les champs' });
        }

        // Normalisation de l'email
        const normalizedEmail = email.toLowerCase().trim();

        // Vérifier si l'utilisateur existe déjà
        const userExists = await User.findOne({ email: normalizedEmail });
        if (userExists) {
            return res.status(400).json({ message: 'L\'utilisateur existe déjà' });
        }

        // Hashage du mot de passe
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Créer l'utilisateur
        const user = await User.create({
            name,
            surname,
            birthDate,
            city,
            email: normalizedEmail,
            password: hashedPassword
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                surname: user.surname,
                email: user.email,
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ message: 'Données utilisateur invalides' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur lors de l\'inscription' });
    }
};

// @desc    Authentifier un utilisateur & obtenir un token
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const body = req.body || {};
        const { email, password } = body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Veuillez fournir un email et un mot de passe' });
        }

        // Normalisation de l'email pour correspondre au stockage en base
        const normalizedEmail = email.toLowerCase().trim();

        // Trouver l'utilisateur par email
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            console.log(`[AUTH] Échec: Utilisateur non trouvé (${normalizedEmail})`);
            return res.status(401).json({ message: 'Email ou mot de passe invalide' });
        }

        // DEBUG: Si vous venez de migrer le code, vérifiez si le MDP en base est hashé
        if (!user.password.startsWith('$2')) {
            console.warn(`[AUTH] Alerte: Le mot de passe en base pour ${normalizedEmail} n'est pas hashé correctement !`);
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            console.log(`[AUTH] Succès: Connexion réussie pour ${normalizedEmail}`);
            res.json({
                _id: user._id,
                name: user.name,
                surname: user.surname,
                email: user.email,
                token: generateToken(user._id)
            });
        } else {
            console.log(`[AUTH] Échec: Mot de passe incorrect pour ${normalizedEmail}`);
            res.status(401).json({ message: 'Email ou mot de passe invalide' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur lors de la connexion' });
    }
};

// Générer un JWT
const generateToken = (id) => {
    // Convertir l'ObjectId en string pour éviter les erreurs de payload
    const userId = id.toString();
    return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'your_jwt_secret', {
        expiresIn: '30d',
    });
};

// @desc    Ajouter une recette aux favoris
// @route   POST /api/users/favorites/add
// @access  Private
const addFavorite = async (req, res) => {
    try {
        const { userId } = req.params;
        const { recipeId, title, image } = req.body;

        if (!userId || !recipeId) {
            return res.status(400).json({ message: 'userId et recipeId sont requis' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        // Check if recipe is already in favorites
        const alreadyExists = user.favorites.some(fav => fav.id === recipeId);
        if (alreadyExists) {
            return res.status(400).json({ message: 'Cette recette est déjà dans les favoris' });
        }

        user.favorites.push({
            id: recipeId,
            title: title,
            image: image,
            addedAt: new Date()
        });

        await user.save();
        res.json({ message: 'Recette ajoutée aux favoris', favorites: user.favorites });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur lors de l\'ajout aux favoris' });
    }
};

// @desc    Supprimer une recette des favoris
// @route   DELETE /api/users/favorites/:userId/:recipeId
// @access  Private
const removeFavorite = async (req, res) => {
    try {
        const { userId, recipeId } = req.params;

        if (!userId || !recipeId) {
            return res.status(400).json({ message: 'userId et recipeId sont requis' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        user.favorites = user.favorites.filter(fav => fav.id !== recipeId);
        await user.save();

        res.json({ message: 'Recette supprimée des favoris', favorites: user.favorites });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur lors de la suppression' });
    }
};

// @desc    Récupérer les favoris d'un utilisateur
// @route   GET /api/users/favorites/:userId
// @access  Private
const getFavorites = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ message: 'userId est requis' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        res.json({ favorites: user.favorites });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur lors de la récupération des favoris' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    addFavorite,
    removeFavorite,
    getFavorites
};
