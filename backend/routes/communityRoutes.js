const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const {
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
} = require('../controllers/CommunityController');

// ── Stats ──────────────────────────────────────────────────────────────────
router.get('/stats', auth, getStats);

// ── Members ──────────────────────────────────────────────────────────────────
router.get('/members', auth, getMembers);
router.get('/members/:id', auth, getMemberProfile);

// ── Follow system ─────────────────────────────────────────────────────────────
router.post('/follow/:id', auth, followUser);
router.delete('/follow/:id', auth, unfollowUser);

// ── Trending (Most Liked Recipes, derived from User.favorites[]) ──────────────
router.get('/trending', auth, getTrending);

// ── Challenges (user-facing) ──────────────────────────────────────────────────
router.get('/challenges', auth, getChallenges);
router.post('/challenges/:id/join', auth, joinChallenge);
router.delete('/challenges/:id/join', auth, leaveChallenge);
router.post('/challenges/:id/complete', auth, completeChallenge);
router.get('/challenges/my-xp', auth, getMyXP);

// ── Challenges (admin CRUD) ───────────────────────────────────────────────────
// Reuses the existing admin middleware from backend/middleware/admin.js
router.get('/admin/challenges', auth, admin, adminGetChallenges);
router.post('/admin/challenges', auth, admin, adminCreateChallenge);
router.put('/admin/challenges/:id', auth, admin, adminUpdateChallenge);
router.delete('/admin/challenges/:id', auth, admin, adminDeleteChallenge);

module.exports = router;
