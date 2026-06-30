const User = require('../models/UserModels');
const SharedRecipe = require('../models/SharedRecipe');
const Challenge = require('../models/Challenge');
const mongoose = require('mongoose');

// ─── Helpers ────────────────────────────────────────────────────────────────

function publicUser(user, currentUserId) {
    return {
        _id: user._id,
        name: user.name,
        surname: user.surname,
        bio: user.bio || '',
        avatar: user.avatar || '',
        city: user.city || '',
        followersCount: (user.followers || []).length,
        followingCount: (user.following || []).length,
        isFollowedByMe: currentUserId
            ? (user.followers || []).some(
                  (id) => id.toString() === currentUserId.toString()
              )
            : false,
        createdAt: user.createdAt,
    };
}

// ─── Community Members ───────────────────────────────────────────────────────

const getMembers = async (req, res) => {
    try {
        const currentUserId = req.user?.id;

        const users = await User.find({ isActive: true })
            .select('-password -email -favorites -notificationSettings -budgetLimit -diet -allergies -cuisines -goals')
            .lean();

        const recipeCounts = await SharedRecipe.aggregate([
            { $group: { _id: '$sharedBy', count: { $sum: 1 } } }
        ]);
        const recipeCountMap = {};
        for (const r of recipeCounts) {
            recipeCountMap[r._id.toString()] = r.count;
        }

        const members = users.map((u) => ({
            ...publicUser(u, currentUserId),
            sharedRecipesCount: recipeCountMap[u._id.toString()] || 0,
        }));

        members.sort((a, b) => b.followersCount - a.followersCount);

        res.json({ members });
    } catch (err) {
        console.error('[community] getMembers error:', err);
        res.status(500).json({ message: 'Server error fetching members' });
    }
};

const getMemberProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUserId = req.user?.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        const user = await User.findById(id)
            .select('-password -email -favorites -notificationSettings -budgetLimit')
            .lean();

        if (!user || !user.isActive) {
            return res.status(404).json({ message: 'User not found' });
        }

        const sharedRecipes = await SharedRecipe.find({ sharedBy: id })
            .sort({ createdAt: -1 })
            .lean();

        const profile = {
            ...publicUser(user, currentUserId),
            sharedRecipes: sharedRecipes.map((r) => ({
                _id: r._id,
                title: r.title,
                image: r.image,
                category: r.category,
                note: r.note,
                likesCount: r.likes.length,
                savesCount: r.saves.length,
                createdAt: r.createdAt,
            })),
        };

        res.json(profile);
    } catch (err) {
        console.error('[community] getMemberProfile error:', err);
        res.status(500).json({ message: 'Server error fetching profile' });
    }
};

// ─── Follow System ───────────────────────────────────────────────────────────

const followUser = async (req, res) => {
    try {
        const targetId = req.params.id;
        const meId = req.user.id;

        if (targetId === meId) {
            return res.status(400).json({ message: 'You cannot follow yourself' });
        }

        if (!mongoose.Types.ObjectId.isValid(targetId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        const target = await User.findById(targetId);
        if (!target || !target.isActive) {
            return res.status(404).json({ message: 'User not found' });
        }

        const alreadyFollowing = target.followers.some(
            (id) => id.toString() === meId
        );
        if (alreadyFollowing) {
            return res.status(400).json({ message: 'Already following this user' });
        }

        await User.findByIdAndUpdate(targetId, { $addToSet: { followers: meId } });
        await User.findByIdAndUpdate(meId, { $addToSet: { following: targetId } });

        const updatedTarget = await User.findById(targetId).select('followers following').lean();

        res.json({
            message: 'Now following',
            followersCount: updatedTarget.followers.length,
        });
    } catch (err) {
        console.error('[community] followUser error:', err);
        res.status(500).json({ message: 'Server error following user' });
    }
};

const unfollowUser = async (req, res) => {
    try {
        const targetId = req.params.id;
        const meId = req.user.id;

        if (!mongoose.Types.ObjectId.isValid(targetId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        await User.findByIdAndUpdate(targetId, { $pull: { followers: meId } });
        await User.findByIdAndUpdate(meId, { $pull: { following: targetId } });

        const updatedTarget = await User.findById(targetId).select('followers').lean();

        res.json({
            message: 'Unfollowed',
            followersCount: updatedTarget ? updatedTarget.followers.length : 0,
        });
    } catch (err) {
        console.error('[community] unfollowUser error:', err);
        res.status(500).json({ message: 'Server error unfollowing user' });
    }
};

// ─── Trending (Most Liked Recipes) ───────────────────────────────────────────

/**
 * GET /api/community/trending
 *
 * "Liked" in this app means a recipe is present in a user's favorites
 * (user.favorites[]), populated by the existing Favorites feature
 * (POST /api/users/favorites/add/:userId). There is no separate "Shared
 * Recipe" concept in active use — Trending must read from real data.
 *
 * Logic:
 *   1. Unwind every user's favorites array into individual (recipeId, title, image) rows.
 *   2. Group by recipe id, counting how many users favorited it (= likeCount).
 *   3. Keep only recipes with at least 1 like.
 *   4. Sort by likeCount descending.
 *   5. Return up to 10 — naturally returns fewer if fewer exist, and will
 *      keep returning exactly the top 10 as the userbase grows, with no
 *      hardcoded thresholds or fixed list sizes.
 */
const getTrending = async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit) || 10, 10);

        const recipes = await User.aggregate([
            { $unwind: '$favorites' },
            {
                $group: {
                    _id: '$favorites.id',
                    title: { $first: '$favorites.title' },
                    image: { $first: '$favorites.image' },
                    likeCount: { $sum: 1 },
                    // most recent time any user favorited this recipe — used as a tiebreaker only
                    lastLikedAt: { $max: '$favorites.addedAt' },
                }
            },
            { $match: { likeCount: { $gt: 0 } } },
            { $sort: { likeCount: -1, lastLikedAt: -1 } },
            { $limit: limit },
        ]);

        const mapped = recipes.map((r) => ({
            id: r._id,
            title: r.title || 'Untitled recipe',
            image: r.image || '',
            likeCount: r.likeCount,
        }));

        res.json({ recipes: mapped });
    } catch (err) {
        console.error('[community] getTrending error:', err);
        res.status(500).json({ message: 'Server error fetching trending recipes' });
    }
};

// ─── Challenges (user-facing) ─────────────────────────────────────────────────

const getChallenges = async (req, res) => {
    try {
        const currentUserId = req.user?.id;

        const challenges = await Challenge.find({ status: { $in: ['active', 'upcoming'] } })
            .sort({ createdAt: -1 })
            .lean();

        const mapped = challenges.map((c) => ({
            _id: c._id,
            title: c.title,
            description: c.description,
            difficulty: c.difficulty,
            reward: c.reward,
            icon: c.icon,
            status: c.status,
            startDate: c.startDate,
            endDate: c.endDate,
            participantsCount: (c.participants || []).length,
            completionsCount: (c.completions || []).length,
            joinedByMe: currentUserId
                ? (c.participants || []).some((id) => id.toString() === currentUserId.toString())
                : false,
            completedByMe: currentUserId
                ? (c.completions || []).some((id) => id.toString() === currentUserId.toString())
                : false,
        }));

        res.json({ challenges: mapped });
    } catch (err) {
        console.error('[community] getChallenges error:', err);
        res.status(500).json({ message: 'Server error fetching challenges' });
    }
};

const joinChallenge = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid challenge ID' });
        }

        const challenge = await Challenge.findById(id);
        if (!challenge) return res.status(404).json({ message: 'Challenge not found' });
        if (challenge.status !== 'active') {
            return res.status(400).json({ message: 'This challenge is not active' });
        }

        const alreadyJoined = challenge.participants.some((uid) => uid.toString() === userId);
        if (alreadyJoined) {
            return res.status(400).json({ message: 'Already joined this challenge' });
        }

        challenge.participants.push(userId);
        await challenge.save();

        res.json({ message: 'Joined challenge', participantsCount: challenge.participants.length });
    } catch (err) {
        console.error('[community] joinChallenge error:', err);
        res.status(500).json({ message: 'Server error joining challenge' });
    }
};

const leaveChallenge = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid challenge ID' });
        }

        await Challenge.findByIdAndUpdate(id, {
            $pull: { participants: userId, completions: userId }
        });

        const updated = await Challenge.findById(id).select('participants').lean();

        res.json({
            message: 'Left challenge',
            participantsCount: updated ? updated.participants.length : 0,
        });
    } catch (err) {
        console.error('[community] leaveChallenge error:', err);
        res.status(500).json({ message: 'Server error leaving challenge' });
    }
};

const completeChallenge = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid challenge ID' });
        }

        const challenge = await Challenge.findById(id);
        if (!challenge) return res.status(404).json({ message: 'Challenge not found' });

        const alreadyCompleted = challenge.completions.some((uid) => uid.toString() === userId);
        if (alreadyCompleted) {
            return res.status(400).json({ message: 'Already completed' });
        }

        const alreadyJoined = challenge.participants.some((uid) => uid.toString() === userId);
        if (!alreadyJoined) challenge.participants.push(userId);
        challenge.completions.push(userId);
        await challenge.save();

        res.json({
            message: 'Challenge completed',
            reward: challenge.reward,
            completionsCount: challenge.completions.length,
        });
    } catch (err) {
        console.error('[community] completeChallenge error:', err);
        res.status(500).json({ message: 'Server error completing challenge' });
    }
};

/**
 * GET /api/community/challenges/my-xp
 * Returns the current user's real XP, level, and completed challenge count,
 * calculated from actual completions stored in MongoDB.
 */
const getMyXP = async (req, res) => {
    try {
        const userId = req.user.id;

        // Find all challenges where this user is in completions[], get their rewards
        const completedChallenges = await Challenge.find({
            completions: userId
        }).select('reward title _id').lean();

        // Find joined-but-not-completed challenges
        const joinedChallenges = await Challenge.find({
            participants: userId,
            completions: { $ne: userId }
        }).select('_id').lean();

        const totalXP = completedChallenges.reduce((sum, c) => sum + (c.reward || 0), 0);
        const completedCount = completedChallenges.length;
        const joinedCount = joinedChallenges.length;

        // Level thresholds: every 200 XP = 1 level, starting at level 1
        const LEVEL_XP = 200;
        const level = Math.floor(totalXP / LEVEL_XP) + 1;
        const xpIntoCurrentLevel = totalXP % LEVEL_XP;
        const progressPercent = Math.round((xpIntoCurrentLevel / LEVEL_XP) * 100);

        const levelNames = ['Beginner', 'Cook', 'Chef', 'Expert Chef', 'Master Chef', 'Legend'];
        const levelName = levelNames[Math.min(level - 1, levelNames.length - 1)];

        res.json({
            totalXP,
            level,
            levelName,
            xpIntoCurrentLevel,
            xpForNextLevel: LEVEL_XP,
            progressPercent,
            completedCount,
            joinedCount,
            completedChallenges: completedChallenges.map(c => ({
                _id: c._id,
                title: c.title,
                reward: c.reward,
            })),
        });
    } catch (err) {
        console.error('[community] getMyXP error:', err);
        res.status(500).json({ message: 'Server error fetching XP' });
    }
};

// ─── Challenges Admin CRUD ────────────────────────────────────────────────────

/**
 * GET /api/community/admin/challenges
 * Returns ALL challenges (all statuses) for admin management.
 */
const adminGetChallenges = async (req, res) => {
    try {
        const challenges = await Challenge.find({})
            .sort({ createdAt: -1 })
            .lean();

        const mapped = challenges.map((c) => ({
            _id: c._id,
            title: c.title,
            description: c.description,
            difficulty: c.difficulty,
            reward: c.reward,
            icon: c.icon,
            status: c.status,
            startDate: c.startDate,
            endDate: c.endDate,
            participantsCount: (c.participants || []).length,
            completionsCount: (c.completions || []).length,
            createdAt: c.createdAt,
        }));

        res.json({ challenges: mapped });
    } catch (err) {
        console.error('[community] adminGetChallenges error:', err);
        res.status(500).json({ message: 'Server error fetching challenges' });
    }
};

/**
 * POST /api/community/admin/challenges
 * Create a new challenge.
 */
const adminCreateChallenge = async (req, res) => {
    try {
        const { title, description, difficulty, reward, icon, status, startDate, endDate } = req.body;

        if (!title || !description) {
            return res.status(400).json({ message: 'Title and description are required' });
        }

        const challenge = await Challenge.create({
            title: title.trim(),
            description: description.trim(),
            difficulty: difficulty || 'Medium',
            reward: Number(reward) || 50,
            icon: (icon || '?').trim(),
            status: status || 'active',
            startDate: startDate ? new Date(startDate) : new Date(),
            endDate: endDate ? new Date(endDate) : undefined,
            createdBy: req.user.id,
        });

        res.status(201).json({ message: 'Challenge created', challenge });
    } catch (err) {
        console.error('[community] adminCreateChallenge error:', err);
        res.status(500).json({ message: 'Server error creating challenge' });
    }
};

/**
 * PUT /api/community/admin/challenges/:id
 * Update an existing challenge (does not touch participants/completions).
 */
const adminUpdateChallenge = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid challenge ID' });
        }

        const allowed = ['title', 'description', 'difficulty', 'reward', 'icon', 'status', 'startDate', 'endDate'];
        const updates = {};
        for (const key of allowed) {
            if (req.body[key] !== undefined) {
                updates[key] = key === 'reward' ? Number(req.body[key]) : req.body[key];
            }
        }

        const challenge = await Challenge.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true, runValidators: true }
        ).lean();

        if (!challenge) return res.status(404).json({ message: 'Challenge not found' });

        res.json({ message: 'Challenge updated', challenge });
    } catch (err) {
        console.error('[community] adminUpdateChallenge error:', err);
        res.status(500).json({ message: 'Server error updating challenge' });
    }
};

/**
 * DELETE /api/community/admin/challenges/:id
 * Permanently delete a challenge.
 */
const adminDeleteChallenge = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid challenge ID' });
        }

        const challenge = await Challenge.findByIdAndDelete(id);
        if (!challenge) return res.status(404).json({ message: 'Challenge not found' });

        res.json({ message: 'Challenge deleted' });
    } catch (err) {
        console.error('[community] adminDeleteChallenge error:', err);
        res.status(500).json({ message: 'Server error deleting challenge' });
    }
};

// ─── Community Stats ─────────────────────────────────────────────────────────

const getStats = async (req, res) => {
    try {
        const [members, sharedRecipes, activeChallenges] = await Promise.all([
            User.countDocuments({ isActive: true }),
            SharedRecipe.countDocuments(),
            Challenge.countDocuments({ status: 'active' }),
        ]);

        const likesAgg = await SharedRecipe.aggregate([
            { $project: { count: { $size: '$likes' } } },
            { $group: { _id: null, total: { $sum: '$count' } } }
        ]);
        const totalLikes = likesAgg[0]?.total || 0;

        res.json({ members, sharedRecipes, activeChallenges, totalLikes });
    } catch (err) {
        console.error('[community] getStats error:', err);
        res.status(500).json({ message: 'Server error fetching stats' });
    }
};

module.exports = {
    getMembers,
    getMemberProfile,
    followUser,
    unfollowUser,
    getTrending,
    getChallenges,
    joinChallenge,
    leaveChallenge,
    completeChallenge,
    getMyXP,
    adminGetChallenges,
    adminCreateChallenge,
    adminUpdateChallenge,
    adminDeleteChallenge,
    getStats,
};
