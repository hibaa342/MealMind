require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/connectDb');
const Product = require('./models/ProductModel');
const User = require('./models/UserModels');
const bcrypt = require('bcryptjs');

const seed = async () => {
    await connectDB();

    await Product.deleteMany({});
    await User.deleteMany({});

    const salt = await bcrypt.genSalt(10);
    const user = await User.create({
        name: 'Test', surname: 'User',
        email: 'test@mealmind.com',
        password: await bcrypt.hash('password123', salt)
    });

    await Product.insertMany([
        { user: user._id, title: 'Pasta Carbonara', time: '20 min', categories: 'Italian', rating: 4.5, tags: ['pasta', 'egg'], image: 'https://via.placeholder.com/300', accent: 'orange' },
        { user: user._id, title: 'Salade Marocaine', time: '10 min', categories: 'Moroccan', rating: 4.8, tags: ['healthy', 'vegan'], image: 'https://via.placeholder.com/300', accent: 'green' },
        { user: user._id, title: 'Poulet Rôti', time: '45 min', categories: 'French', rating: 4.2, tags: ['chicken', 'oven'], image: 'https://via.placeholder.com/300', accent: 'red' },
    ]);

    console.log(' Seeded: 1 user + 3 recipes');
    console.log(' Login with: test@mealmind.com / password123');
    process.exit();
};

seed();