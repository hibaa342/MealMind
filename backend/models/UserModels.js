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
    },
    budgetLimit: {
        type: Number,
        default: 500
    },
    favorites: {
        type: Array,
        default: []
    },
    diet: {
        type: [String],
        default: []
    },
    allergies: {
        type: [String],
        default: []
    },
    cuisines: {
        type: [String],
        default: []
    },
    goals: {
        type: [String],
        default: []
    },
    nameSidebarOverride: {
        type: String,
        default: ''
    },
    onboarded: {
        type: Boolean,
        default: false
    },
    notificationSettings: {
        pauseAll: { type: Boolean, default: false },
        quietMode: {
            enabled: { type: Boolean, default: false },
            start: { type: String, default: "22:00" },
            end: { type: String, default: "08:00" }
        },
        categories: {
            budgetAlerts: { type: Boolean, default: true },
            mealReminders: { type: Boolean, default: true },
            communityActivity: { type: Boolean, default: true },
            newRecipes: { type: Boolean, default: true }
        }
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
