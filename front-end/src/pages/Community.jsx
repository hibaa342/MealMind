/**
 * Community.jsx  — fully live, database-driven community page.
 *
 * All data comes from MongoDB via /api/community/* endpoints.
 * No hardcoded users, recipes, or challenges remain.
 *
 * Tabs:
 *   Members   → all registered users, follow/unfollow, click → profile modal
 *   Trending  → shared recipes sorted by likes/saves/recent, like/save toggles
 *   Challenges → real challenges from DB, join/leave/complete
 *
 * Stats bar at the bottom → real counts from the database.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useUser } from '../context/UserContext'
import {
    fetchCommunityStats,
    fetchMembers,
    fetchMemberProfile,
    followUser,
    unfollowUser,
    fetchTrending,
    fetchChallenges,
    joinChallenge,
    leaveChallenge,
    completeChallenge,
    fetchMyXP,
} from '../api/community'
import './Community.css'

// ─── Small pure helpers ───────────────────────────────────────────────────────

/** Generate 2-letter initials from a user object */
function initials(user) {
    const n = (user?.name || '').trim()
    const s = (user?.surname || '').trim()
    if (n && s) return (n[0] + s[0]).toUpperCase()
    if (n) return n.slice(0, 2).toUpperCase()
    return '??'
}

/** Render an avatar: real image if available, else initials */
function Avatar({ user, size = 'md', className = '' }) {
    const sizeClass = size === 'lg' ? 'community-avatar--large' : ''
    if (user?.avatar) {
        return (
            <img
                src={user.avatar}
                alt={`${user.name} avatar`}
                className={`community-avatar community-avatar--img ${sizeClass} ${className}`}
            />
        )
    }
    return (
        <span className={`community-avatar ${sizeClass} ${className}`} aria-hidden>
            {initials(user)}
        </span>
    )
}

const difficultyClass = {
    Easy: 'community-chip--easy',
    Medium: 'community-chip--medium',
    Hard: 'community-chip--hard',
}

const tabs = [
    { id: 'members', label: 'Members' },
    { id: 'trending', label: 'Trending' },
    { id: 'challenges', label: 'Challenges' },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Skeleton card shown while data is loading */
function SkeletonCard({ count = 4 }) {
    return Array.from({ length: count }).map((_, i) => (
        <div key={i} className="community-skeleton-card" aria-hidden />
    ))
}

/** Inline error with retry button */
function InlineError({ message, onRetry }) {
    return (
        <div className="community-error">
            <p>{message}</p>
            {onRetry && (
                <button type="button" className="community-secondary-btn" onClick={onRetry}>
                    Retry
                </button>
            )}
        </div>
    )
}

// ─── Profile Modal ────────────────────────────────────────────────────────────

function ProfileModal({ userId, currentUserId, onClose, onFollowToggle }) {
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [actionLoading, setActionLoading] = useState(false)

    useEffect(() => {
        let cancelled = false
        setLoading(true)
        setError(null)
        fetchMemberProfile(userId)
            .then((data) => { if (!cancelled) setProfile(data) })
            .catch((err) => { if (!cancelled) setError(err.message) })
            .finally(() => { if (!cancelled) setLoading(false) })
        return () => { cancelled = true }
    }, [userId])

    const handleFollowToggle = async () => {
        if (!profile || actionLoading) return
        setActionLoading(true)
        try {
            let result
            if (profile.isFollowedByMe) {
                result = await unfollowUser(profile._id)
            } else {
                result = await followUser(profile._id)
            }
            setProfile((prev) => ({
                ...prev,
                isFollowedByMe: !prev.isFollowedByMe,
                followersCount: result.followersCount,
            }))
            onFollowToggle?.()
        } catch (err) {
            console.error(err)
        } finally {
            setActionLoading(false)
        }
    }

    // Close on Escape
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose() }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [onClose])

    return (
        <div className="community-modal-backdrop" onClick={onClose} role="dialog" aria-modal>
            <div
                className="community-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    type="button"
                    className="community-modal__close"
                    onClick={onClose}
                    aria-label="Close profile"
                >
                    ✕
                </button>

                {loading && (
                    <div className="community-modal__loading">
                        <div className="community-spinner" />
                        <p>Loading profile…</p>
                    </div>
                )}

                {error && (
                    <InlineError message={error} onRetry={() => {
                        setError(null)
                        fetchMemberProfile(userId)
                            .then(setProfile)
                            .catch((e) => setError(e.message))
                    }} />
                )}

                {profile && !loading && (
                    <>
                        <div className="community-modal__head">
                            <Avatar user={profile} size="lg" />
                            <div>
                                <h2>{profile.name} {profile.surname}</h2>
                                {profile.city && <p className="community-modal__city">📍 {profile.city}</p>}
                                {profile.bio && <p className="community-modal__bio">{profile.bio}</p>}
                            </div>
                        </div>

                        <div className="community-modal__counters">
                            <div>
                                <strong>{profile.followersCount}</strong>
                                <span>Followers</span>
                            </div>
                            <div>
                                <strong>{profile.followingCount}</strong>
                                <span>Following</span>
                            </div>
                            <div>
                                <strong>{profile.sharedRecipes?.length ?? 0}</strong>
                                <span>Recipes</span>
                            </div>
                        </div>

                        {/* Don't show follow button on your own profile */}
                        {profile._id?.toString() !== currentUserId?.toString() && (
                            <button
                                type="button"
                                className={`community-primary-btn community-modal__follow-btn${profile.isFollowedByMe ? ' community-modal__follow-btn--active' : ''}`}
                                onClick={handleFollowToggle}
                                disabled={actionLoading}
                            >
                                {actionLoading
                                    ? '…'
                                    : profile.isFollowedByMe
                                        ? 'Unfollow'
                                        : 'Follow'}
                            </button>
                        )}

                        {profile.sharedRecipes?.length > 0 && (
                            <div className="community-modal__recipes">
                                <h3>Shared Recipes</h3>
                                <div className="community-modal__recipe-list">
                                    {profile.sharedRecipes.map((r) => (
                                        <div key={r._id} className="community-modal__recipe-item">
                                            {r.image && (
                                                <img
                                                    src={r.image}
                                                    alt={r.title}
                                                    className="community-modal__recipe-img"
                                                />
                                            )}
                                            <div>
                                                <strong>{r.title}</strong>
                                                <small>♥ {r.likesCount} · 🔖 {r.savesCount}</small>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {profile.createdAt && (
                            <p className="community-modal__joined">
                                Member since {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </p>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

// ─── Members Tab ──────────────────────────────────────────────────────────────

function MembersTab({ currentUserId, onToast }) {
    const [members, setMembers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [selectedUserId, setSelectedUserId] = useState(null)
    const [actionLoading, setActionLoading] = useState({}) // { [userId]: bool }
    const [search, setSearch] = useState('')

    const load = useCallback(() => {
        setLoading(true)
        setError(null)
        fetchMembers()
            .then(({ members }) => setMembers(members))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false))
    }, [])

    useEffect(() => { load() }, [load])

    const handleFollowToggle = async (member) => {
        if (actionLoading[member._id]) return
        setActionLoading((prev) => ({ ...prev, [member._id]: true }))
        try {
            let result
            if (member.isFollowedByMe) {
                result = await unfollowUser(member._id)
            } else {
                result = await followUser(member._id)
            }
            // Note: no success toast here by design — follow/unfollow is silent.
            setMembers((prev) =>
                prev.map((m) =>
                    m._id === member._id
                        ? { ...m, isFollowedByMe: !m.isFollowedByMe, followersCount: result.followersCount }
                        : m
                )
            )
        } catch (err) {
            onToast(err.message)
        } finally {
            setActionLoading((prev) => ({ ...prev, [member._id]: false }))
        }
    }

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase()
        if (!q) return members
        return members.filter(
            (m) =>
                m.name.toLowerCase().includes(q) ||
                m.surname.toLowerCase().includes(q) ||
                (m.bio || '').toLowerCase().includes(q)
        )
    }, [members, search])

    return (
        <>
            {selectedUserId && (
                <ProfileModal
                    userId={selectedUserId}
                    currentUserId={currentUserId}
                    onClose={() => setSelectedUserId(null)}
                    onFollowToggle={load}
                />
            )}

            <section className="community-panel">
                <div className="community-section-head">
                    <div>
                        <h2>Community Members</h2>
                        <p>Discover everyone in the MealMind community.</p>
                    </div>
                    <input
                        type="search"
                        className="community-search"
                        placeholder="Search members…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        aria-label="Search members"
                    />
                </div>

                {loading && (
                    <div className="community-chef-list">
                        <SkeletonCard count={6} />
                    </div>
                )}
                {error && <InlineError message={error} onRetry={load} />}

                {!loading && !error && filtered.length === 0 && (
                    <p className="community-empty">
                        {search ? 'No members match your search.' : 'No members yet. Be the first!'}
                    </p>
                )}

                {!loading && !error && filtered.length > 0 && (
                    <div className="community-chef-list">
                        {filtered.map((member) => {
                            const isMe = member._id?.toString() === currentUserId?.toString()
                            return (
                                <article key={member._id} className="community-chef-card">
                                    <button
                                        type="button"
                                        className="community-chef-card__main"
                                        onClick={() => setSelectedUserId(member._id)}
                                    >
                                        <Avatar user={member} />
                                        <span>
                                            <strong>
                                                {member.name} {member.surname}
                                                {isMe && <em className="community-you-badge"> (you)</em>}
                                            </strong>
                                            <small>
                                                {member.bio || (member.city ? `📍 ${member.city}` : 'MealMind member')}
                                            </small>
                                        </span>
                                    </button>
                                    <div className="community-chef-card__foot">
                                        <span>
                                            {member.followersCount} follower{member.followersCount !== 1 ? 's' : ''}
                                            {member.sharedRecipesCount > 0 && (
                                                <> · {member.sharedRecipesCount} recipe{member.sharedRecipesCount !== 1 ? 's' : ''}</>
                                            )}
                                        </span>
                                        {!isMe && (
                                            <button
                                                type="button"
                                                className={`community-mini-btn${member.isFollowedByMe ? ' community-mini-btn--active' : ''}`}
                                                onClick={() => handleFollowToggle(member)}
                                                disabled={!!actionLoading[member._id]}
                                            >
                                                {actionLoading[member._id]
                                                    ? '…'
                                                    : member.isFollowedByMe
                                                        ? 'Following'
                                                        : 'Follow'}
                                            </button>
                                        )}
                                    </div>
                                </article>
                            )
                        })}
                    </div>
                )}
            </section>
        </>
    )
}

// ─── Trending Tab ─────────────────────────────────────────────────────────────

function TrendingTab() {
    const [recipes, setRecipes] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const load = useCallback(() => {
        setLoading(true)
        setError(null)
        fetchTrending()
            .then(({ recipes }) => setRecipes(recipes))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false))
    }, [])

    useEffect(() => { load() }, [load])

    return (
        <section className="community-panel">
            <div className="community-section-head">
                <div>
                    <h2>Trending Recipes</h2>
                    <p>The most liked recipes in the community right now.</p>
                </div>
            </div>

            {loading && (
                <div className="community-recipe-list">
                    <SkeletonCard count={4} />
                </div>
            )}
            {error && <InlineError message={error} onRetry={load} />}

            {!loading && !error && recipes.length === 0 && (
                <div className="community-empty-trending">
                    <p>No liked recipes yet.</p>
                    <p className="community-empty-sub">
                        Head to your Recipes page and add a recipe to your favorites to see it here!
                    </p>
                </div>
            )}

            {!loading && !error && recipes.length > 0 && (
                <div className="community-recipe-list">
                    {recipes.map((recipe, index) => (
                        <article key={recipe.id} className="community-recipe-card">
                            <div className="community-recipe-card__info">
                                <span className="community-chip">#{index + 1}</span>
                                <h3>{recipe.title}</h3>
                            </div>
                            {recipe.image && (
                                <img
                                    src={recipe.image}
                                    alt={recipe.title}
                                    className="community-recipe-card__img"
                                />
                            )}
                            <div className="community-recipe-actions">
                                <span className="community-action-btn community-action-btn--active" aria-label={`${recipe.likeCount} likes`}>
                                    ♥ {recipe.likeCount}
                                </span>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    )
}

// ─── Challenges Tab ───────────────────────────────────────────────────────────

function ChallengesTab({ onToast }) {
    const [challenges, setChallenges] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [actionLoading, setActionLoading] = useState({})
    const [xp, setXp] = useState(null)
    const [xpLoading, setXpLoading] = useState(true)

    const load = useCallback(() => {
        setLoading(true)
        setError(null)
        fetchChallenges()
            .then(({ challenges }) => setChallenges(challenges))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false))
    }, [])

    const loadXP = useCallback(() => {
        setXpLoading(true)
        fetchMyXP()
            .then((data) => setXp(data))
            .catch(() => {}) // XP bar is non-critical, fail silently
            .finally(() => setXpLoading(false))
    }, [])

    useEffect(() => { load() }, [load])
    useEffect(() => { loadXP() }, [loadXP])

    const handleJoinLeave = async (challenge) => {
        const key = challenge._id + '_join'
        if (actionLoading[key]) return
        setActionLoading((prev) => ({ ...prev, [key]: true }))
        try {
            let result
            if (challenge.joinedByMe) {
                result = await leaveChallenge(challenge._id)
                onToast(`Left challenge: "${challenge.title}".`)
                setChallenges((prev) =>
                    prev.map((c) =>
                        c._id === challenge._id
                            ? { ...c, joinedByMe: false, completedByMe: false, participantsCount: result.participantsCount }
                            : c
                    )
                )
            } else {
                result = await joinChallenge(challenge._id)
                onToast(`Joined! +${challenge.reward} XP possible.`)
                setChallenges((prev) =>
                    prev.map((c) =>
                        c._id === challenge._id
                            ? { ...c, joinedByMe: true, participantsCount: result.participantsCount }
                            : c
                    )
                )
            }
        } catch (err) {
            onToast(err.message)
        } finally {
            setActionLoading((prev) => ({ ...prev, [key]: false }))
        }
    }

    const handleComplete = async (challenge) => {
        const key = challenge._id + '_complete'
        if (actionLoading[key]) return
        setActionLoading((prev) => ({ ...prev, [key]: true }))
        try {
            const result = await completeChallenge(challenge._id)
            onToast(`🎉 "${challenge.title}" completed! +${result.reward} XP`)
            setChallenges((prev) =>
                prev.map((c) =>
                    c._id === challenge._id
                        ? { ...c, joinedByMe: true, completedByMe: true, completionsCount: result.completionsCount }
                        : c
                )
            )
            loadXP() // refresh XP bar with the real, newly-stored completion
        } catch (err) {
            onToast(err.message)
        } finally {
            setActionLoading((prev) => ({ ...prev, [key]: false }))
        }
    }

    return (
        <section className="community-panel">
            <div className="community-section-head">
                <div>
                    <h2>Culinary Challenges</h2>
                    <p>Take on challenges and earn community experience.</p>
                </div>
            </div>

            {/* XP / Progress bar — real values from MongoDB completions */}
            {!xpLoading && xp && (
                <div className="community-xp-bar">
                    <div className="community-xp-bar__top">
                        <div className="community-xp-bar__level">
                            <strong>Level {xp.level}</strong>
                            <span>{xp.levelName}</span>
                        </div>
                        <div className="community-xp-bar__counts">
                            <span>{xp.totalXP} XP total</span>
                            <span>{xp.completedCount} challenge{xp.completedCount !== 1 ? 's' : ''} completed</span>
                        </div>
                    </div>
                    <div className="community-xp-bar__track" role="progressbar" aria-valuenow={xp.progressPercent} aria-valuemin={0} aria-valuemax={100}>
                        <div
                            className="community-xp-bar__fill"
                            style={{ width: `${xp.progressPercent}%` }}
                        />
                    </div>
                    <p className="community-xp-bar__hint">
                        {xp.xpIntoCurrentLevel} / {xp.xpForNextLevel} XP to level {xp.level + 1}
                    </p>
                </div>
            )}
            {xpLoading && <div className="community-xp-bar community-xp-bar--loading" aria-hidden />}

            {loading && (
                <div className="community-challenge-grid">
                    <SkeletonCard count={4} />
                </div>
            )}
            {error && <InlineError message={error} onRetry={load} />}

            {!loading && !error && challenges.length === 0 && (
                <p className="community-empty">No active challenges right now. Check back soon!</p>
            )}

            {!loading && !error && challenges.length > 0 && (
                <div className="community-challenge-grid">
                    {challenges.map((challenge) => (
                        <article key={challenge._id} className="community-challenge-card">
                            <div className="community-challenge-card__top">
                                <span className="community-challenge-icon">{challenge.icon}</span>
                                <span className={`community-chip ${difficultyClass[challenge.difficulty] || ''}`}>
                                    {challenge.difficulty}
                                </span>
                            </div>
                            <h3>{challenge.title}</h3>
                            <p>{challenge.description}</p>
                            <div className="community-challenge-meta">
                                <span>{challenge.participantsCount} participant{challenge.participantsCount !== 1 ? 's' : ''}</span>
                                <span>{challenge.reward} XP</span>
                            </div>
                            {challenge.endDate && (
                                <p className="community-challenge-deadline">
                                    Ends {new Date(challenge.endDate).toLocaleDateString()}
                                </p>
                            )}
                            <div className="community-card-actions">
                                <button
                                    type="button"
                                    className={`community-secondary-btn${challenge.joinedByMe ? ' community-secondary-btn--active' : ''}`}
                                    onClick={() => handleJoinLeave(challenge)}
                                    disabled={!!actionLoading[challenge._id + '_join']}
                                >
                                    {actionLoading[challenge._id + '_join']
                                        ? '…'
                                        : challenge.joinedByMe
                                            ? 'Leave'
                                            : 'Join'}
                                </button>
                                <button
                                    type="button"
                                    className="community-primary-btn"
                                    onClick={() => handleComplete(challenge)}
                                    disabled={challenge.completedByMe || !!actionLoading[challenge._id + '_complete']}
                                >
                                    {challenge.completedByMe
                                        ? '✓ Completed'
                                        : actionLoading[challenge._id + '_complete']
                                            ? '…'
                                            : 'Mark Complete'}
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    )
}

// ─── Main Community Page ──────────────────────────────────────────────────────

const Community = () => {
    const { profile } = useUser()
    const currentUserId = profile?._id

    const [activeTab, setActiveTab] = useState('members')
    const [toast, setToast] = useState('Welcome to the community.')
    const [stats, setStats] = useState({ members: 0, sharedRecipes: 0, activeChallenges: 0, totalLikes: 0 })

    const showToast = useCallback((msg) => {
        setToast(msg)
    }, [])

    // Load community-wide stats on mount
    useEffect(() => {
        fetchCommunityStats()
            .then((data) => setStats(data))
            .catch(() => {}) // silently fail — stats are non-critical
    }, [])

    const statsBar = [
        { value: stats.members.toLocaleString(), label: 'Members' },
        { value: stats.sharedRecipes.toLocaleString(), label: 'Shared Recipes' },
        { value: stats.activeChallenges.toLocaleString(), label: 'Active Challenges' },
        { value: stats.totalLikes.toLocaleString(), label: 'Total Likes' },
    ]

    return (
        <div className="community-page">
            <header className="community-header">
                <div>
                    <h1 className="community-title">Community</h1>
                    <p className="community-lead">
                        Connect, share, and cook with fellow MealMind members.
                    </p>
                </div>
                <div className="community-status" role="status" aria-live="polite">
                    {toast}
                </div>
            </header>

            <nav className="community-tabs" aria-label="Community sections">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        className={`community-tab${activeTab === tab.id ? ' community-tab--active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>

            {activeTab === 'members' && (
                <MembersTab currentUserId={currentUserId} onToast={showToast} />
            )}
            {activeTab === 'trending' && (
                <TrendingTab />
            )}
            {activeTab === 'challenges' && (
                <ChallengesTab onToast={showToast} />
            )}

            <section className="community-stats" aria-label="Community statistics">
                {statsBar.map((stat) => (
                    <div key={stat.label}>
                        <strong>{stat.value}</strong>
                        <span>{stat.label}</span>
                    </div>
                ))}
            </section>
        </div>
    )
}

export default Community
