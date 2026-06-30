const mongoose = require('mongoose');

/**
 * Challenge — a cooking challenge created by an admin and shown to all users.
 *
 * Participation is stored directly on this document:
 *  - participants: users who joined
 *  - completions:  users who marked it complete
 *
 * This keeps queries simple: one document fetch gives all counts.
 */
const challengeSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            required: true
        },
        difficulty: {
            type: String,
            enum: ['Easy', 'Medium', 'Hard'],
            default: 'Medium'
        },
        // XP reward for completing the challenge
        reward: {
            type: Number,
            default: 50
        },
        // Icon: short text label shown in the UI (e.g. "5", "BM", "15")
        icon: {
            type: String,
            default: '?'
        },
        startDate: {
            type: Date,
            default: Date.now
        },
        endDate: {
            type: Date
        },
        status: {
            type: String,
            enum: ['active', 'completed', 'upcoming'],
            default: 'active'
        },

        // Social participation — arrays of User ObjectIds
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        ],
        completions: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        ],

        // Who created this challenge (admin)
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Challenge', challengeSchema);
