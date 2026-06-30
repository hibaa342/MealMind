/**
 * seedCommunity.js
 *
 * Run once to populate initial challenges in MongoDB.
 * Usage: node backend/seedCommunity.js
 *
 * Safe to run multiple times — it checks for existing challenges
 * before inserting so you won't get duplicates.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/connectDb');
const Challenge = require('./models/Challenge');

const initialChallenges = [
    {
        title: '5 Ingredients Challenge',
        description: 'Create a delicious and complete meal using only 5 ingredients. Creativity is key!',
        difficulty: 'Medium',
        reward: 50,
        icon: '5',
        status: 'active',
        startDate: new Date(),
    },
    {
        title: 'Sugar-Free Dessert',
        description: 'Prepare a dessert without any refined sugar. Prove that healthy can be sweet!',
        difficulty: 'Hard',
        reward: 75,
        icon: 'DS',
        status: 'active',
        startDate: new Date(),
    },
    {
        title: 'Budget Master',
        description: 'Prepare a full 3-course meal for under 30 MAD. Flavor on a budget!',
        difficulty: 'Medium',
        reward: 60,
        icon: 'BM',
        status: 'active',
        startDate: new Date(),
    },
    {
        title: '15 Minutes or Less',
        description: 'Cook a complete, nutritious dinner in 15 minutes maximum. Speed chef mode!',
        difficulty: 'Easy',
        reward: 40,
        icon: '15',
        status: 'active',
        startDate: new Date(),
    },
    {
        title: 'Zero Waste Cook',
        description: 'Use every part of your ingredients — peels, stems, and all. No food goes to waste!',
        difficulty: 'Hard',
        reward: 80,
        icon: 'ZW',
        status: 'active',
        startDate: new Date(),
    },
    {
        title: 'One-Pan Wonder',
        description: 'Cook an entire meal using only a single pan or pot. Minimal cleanup, maximum flavor.',
        difficulty: 'Easy',
        reward: 35,
        icon: '1P',
        status: 'active',
        startDate: new Date(),
    },
];

async function seed() {
    await connectDB();

    let inserted = 0;
    for (const ch of initialChallenges) {
        const exists = await Challenge.findOne({ title: ch.title });
        if (!exists) {
            await Challenge.create(ch);
            console.log(`✅ Created: "${ch.title}"`);
            inserted++;
        } else {
            console.log(`⏭  Already exists: "${ch.title}"`);
        }
    }

    console.log(`\nDone. ${inserted} new challenge(s) inserted.`);
    await mongoose.disconnect();
    process.exit(0);
}

seed().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
});
