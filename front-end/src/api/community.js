/**
 * front-end/src/api/community.js
 *
 * All API calls for the Community page.
 * Uses the same getApiBase() + getAuthHeaders() pattern as the rest of the app.
 */

import { getApiBase, getAuthHeaders } from './client'

const base = () => `${getApiBase()}/api/community`
const headers = () => getAuthHeaders()

// ─── Stats ───────────────────────────────────────────────────────────────────

export async function fetchCommunityStats() {
    const res = await fetch(`${base()}/stats`, { headers: headers() })
    if (!res.ok) throw new Error('Failed to fetch community stats')
    return res.json()
}

// ─── Members ─────────────────────────────────────────────────────────────────

export async function fetchMembers() {
    const res = await fetch(`${base()}/members`, { headers: headers() })
    if (!res.ok) throw new Error('Failed to fetch members')
    return res.json()
}

export async function fetchMemberProfile(userId) {
    const res = await fetch(`${base()}/members/${userId}`, { headers: headers() })
    if (!res.ok) throw new Error('Failed to fetch member profile')
    return res.json()
}

// ─── Follow ──────────────────────────────────────────────────────────────────

export async function followUser(userId) {
    const res = await fetch(`${base()}/follow/${userId}`, {
        method: 'POST',
        headers: headers(),
    })
    if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || 'Failed to follow user')
    }
    return res.json()
}

export async function unfollowUser(userId) {
    const res = await fetch(`${base()}/follow/${userId}`, {
        method: 'DELETE',
        headers: headers(),
    })
    if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || 'Failed to unfollow user')
    }
    return res.json()
}

// ─── Trending (Most Liked Recipes) ────────────────────────────────────────────

/**
 * Returns the top liked recipes (by favorites count), highest first.
 * Backend already limits to 10 and sorts descending — no params needed.
 */
export async function fetchTrending() {
    const res = await fetch(`${base()}/trending`, { headers: headers() })
    if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || 'Failed to fetch trending recipes')
    }
    return res.json()
}

// ─── Challenges (user-facing) ──────────────────────────────────────────────────

export async function fetchChallenges() {
    const res = await fetch(`${base()}/challenges`, { headers: headers() })
    if (!res.ok) throw new Error('Failed to fetch challenges')
    return res.json()
}

export async function joinChallenge(challengeId) {
    const res = await fetch(`${base()}/challenges/${challengeId}/join`, {
        method: 'POST',
        headers: headers(),
    })
    if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || 'Failed to join challenge')
    }
    return res.json()
}

export async function leaveChallenge(challengeId) {
    const res = await fetch(`${base()}/challenges/${challengeId}/join`, {
        method: 'DELETE',
        headers: headers(),
    })
    if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || 'Failed to leave challenge')
    }
    return res.json()
}

export async function completeChallenge(challengeId) {
    const res = await fetch(`${base()}/challenges/${challengeId}/complete`, {
        method: 'POST',
        headers: headers(),
    })
    if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || 'Failed to complete challenge')
    }
    return res.json()
}

export async function fetchMyXP() {
    const res = await fetch(`${base()}/challenges/my-xp`, { headers: headers() })
    if (!res.ok) throw new Error('Failed to fetch XP')
    return res.json()
}

// ─── Challenges (admin CRUD) ───────────────────────────────────────────────────

export async function adminFetchChallenges() {
    const res = await fetch(`${base()}/admin/challenges`, { headers: headers() })
    if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || 'Failed to fetch challenges')
    }
    return res.json()
}

export async function adminCreateChallenge(payload) {
    // payload: { title, description, difficulty, reward, icon, status, startDate, endDate }
    const res = await fetch(`${base()}/admin/challenges`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers() },
        body: JSON.stringify(payload),
    })
    if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || 'Failed to create challenge')
    }
    return res.json()
}

export async function adminUpdateChallenge(challengeId, payload) {
    const res = await fetch(`${base()}/admin/challenges/${challengeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...headers() },
        body: JSON.stringify(payload),
    })
    if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || 'Failed to update challenge')
    }
    return res.json()
}

export async function adminDeleteChallenge(challengeId) {
    const res = await fetch(`${base()}/admin/challenges/${challengeId}`, {
        method: 'DELETE',
        headers: headers(),
    })
    if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || 'Failed to delete challenge')
    }
    return res.json()
}
