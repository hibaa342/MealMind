const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Le nom est requis']
    },
    surname: {
        type: String,
        required: [true, 'Le prénom est requis']
    },
    birthDate: {
        type: Date
    },
    city: {
        type: String
    },
    email: {
        type: String,
        required: [true, 'L\'email est requis'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Le mot de passe est requis'],
        minlength: 6
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
