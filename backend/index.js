require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/connectDb');
const userRoutes = require('./routes/UserRoutes');
const productRoutes = require('./routes/ProductRoutes');

const app = express();

// Middleware
app.use(cors());
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Connexion à la base de données
connectDB();

// Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);

// Error Handler
app.use((err, req, res, next) => {
    console.error('Error stack:', err.stack);
    console.error('Error message:', err.message);
    res.status(500).json({ 
        message: 'Erreur interne du serveur', 
        error: err.message 
    });
});

const port = 5000;

app.listen(port, () => {
    console.log('Server is running on port ' + port);
});
