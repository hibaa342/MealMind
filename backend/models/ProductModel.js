const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Le titre est requis']
    },
    time: {
        type: String,
        required: [true, 'Le temps est requis']
    },
    categories: {
        type: String,
        required: [true, 'La catégorie est requise']
    },
    rating: {
        type: Number,
        default: 0
    },
    tags: {
        type: [String],
        default: []
    },
    image: {
        type: String,
        required: [true, 'L\'image est requise']
    },
    accent: {
        type: String,
        default: 'green'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
