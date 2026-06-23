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
        password: await bcrypt.hash('password123', salt),
        role: 'user'
    });

    const admin = await User.create({
        name: 'System', surname: 'Admin',
        email: 'admin@mealmind.com',
        password: await bcrypt.hash('adminpassword123', salt),
        role: 'admin'
    });

    await Product.insertMany([
        { user: user._id, title: 'Pasta Carbonara', time: '20 min', categories: 'Italian', rating: 4.5, tags: ['pasta', 'egg'], image: 'https://placehold.co/300x300?text=Pasta', accent: 'orange' },
        { user: user._id, title: 'Salade Marocaine', time: '10 min', categories: 'Moroccan', rating: 4.8, tags: ['healthy', 'vegan'], image: 'https://placehold.co/300x300?text=Salade', accent: 'green' },
        { user: user._id, title: 'Poulet Rôti', time: '45 min', categories: 'French', rating: 4.2, tags: ['chicken', 'oven'], image: 'https://placehold.co/300x300?text=Poulet', accent: 'red' },    
    ]);

    console.log(' Seeded: 1 user + 1 admin + 3 recipes');
    console.log(' User Login: test@mealmind.com / password123');
    console.log(' Admin Login: admin@mealmind.com / adminpassword123');
    process.exit();
};

seed();