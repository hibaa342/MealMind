const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    title: {
        type: String,
        required: [true, 'Le titre est requis']
    },
    description: {
        type: String,
        default: ''
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
    },
    ingredients: {
        type: [
            {
                amount: { type: String, default: '' },
                name:   { type: String, default: '' },
            }
        ],
        default: []
    },
    instructions: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
