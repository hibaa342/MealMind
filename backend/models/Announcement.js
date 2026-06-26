const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required']
    },
    message: {
        type: String,
        required: [true, 'Message is required']
    },
    location: {
        type: String,
        enum: ['dashboard', 'homepage'],
        default: 'dashboard'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Announcement', announcementSchema);