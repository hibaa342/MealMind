const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    category: { type: String, default: 'other' }, // e.g. 'dairy', 'vegetable', 'meat'
    unit: { type: String, default: 'g' }           // e.g. 'g', 'ml', 'piece'
}, { timestamps: true });

module.exports = mongoose.model('Ingredient', ingredientSchema);