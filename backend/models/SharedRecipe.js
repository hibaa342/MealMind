const mongoose = require('mongoose');

/**
 * SharedRecipe — a recipe that a user has explicitly shared to the community.
 *
 * A recipe can originate from:
 *  - TheMealDB (external API) → store the mealdb ID + title + image
 *  - A user-created recipe (id starts with "user-") → store title + image
 *
 * Likes and saves are arrays of User ObjectIds so we can:
 *  1. Count them accurately (no double-counting)
 *  2. Know whether the current viewer has already liked/saved
 */
const sharedRecipeSchema = new mongoose.Schema(
    {
        // The user who shared this recipe
        sharedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        // Original recipe data (from TheMealDB or user-created)
        externalId: {
            // TheMealDB idMeal, or the "user-xxx" string for user-created recipes
            type: String,
            default: ''
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        image: {
            // URL to the recipe image
            type: String,
            default: ''
        },
        category: {
            type: String,
            default: 'Other'
        },
        // Short description / note the sharer added
        note: {
            type: String,
            default: '',
            maxlength: 300
        },

        // Social interactions
        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        ],
        saves: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        ]
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('SharedRecipe', sharedRecipeSchema);
