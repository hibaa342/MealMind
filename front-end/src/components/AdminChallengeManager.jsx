/**
 * AdminChallengeManager.jsx
 *
 * Self-contained admin panel for managing Community Challenges.
 * Drop this component anywhere inside AdminDashboard.jsx, e.g.:
 *
 *   import AdminChallengeManager from '../components/AdminChallengeManager'
 *   ...
 *   <AdminChallengeManager />
 *
 * It does not depend on any other admin state — it fetches and manages
 * its own data via /api/community/admin/challenges (protected by the
 * existing `auth` + `admin` middleware on the backend).
 *
 * All changes are stored in MongoDB and are immediately visible to every
 * user on the Community → Challenges tab (no further action required).
 */

import React, { useState, useEffect, useCallback } from 'react'
import {
    adminFetchChallenges,
    adminCreateChallenge,
    adminUpdateChallenge,
    adminDeleteChallenge,
} from '../api/community'
import './AdminChallengeManager.css'

const emptyForm = {
    title: '',
    description: '',
    difficulty: 'Medium',
    reward: 50,
    icon: '',
    status: 'active',
    endDate: '',
}

const difficultyOptions = ['Easy', 'Medium', 'Hard']
const statusOptions = ['active', 'upcoming', 'completed']

export default function AdminChallengeManager() {
    const [challenges, setChallenges] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [actionError, setActionError] = useState(null)

    // Form state: null = closed, 'new' = creating, otherwise the challenge being edited
    const [editingId, setEditingId] = useState(null)
    const [form, setForm] = useState(emptyForm)
    const [saving, setSaving] = useState(false)
    const [deletingId, setDeletingId] = useState(null)

    const load = useCallback(() => {
        setLoading(true)
        setError(null)
        adminFetchChallenges()
            .then(({ challenges }) => setChallenges(challenges))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false))
    }, [])

    useEffect(() => { load() }, [load])

    const openCreateForm = () => {
        setForm(emptyForm)
        setEditingId('new')
        setActionError(null)
    }

    const openEditForm = (challenge) => {
        setForm({
            title: challenge.title,
            description: challenge.description,
            difficulty: challenge.difficulty,
            reward: challenge.reward,
            icon: challenge.icon,
            status: challenge.status,
            endDate: challenge.endDate ? challenge.endDate.slice(0, 10) : '',
        })
        setEditingId(challenge._id)
        setActionError(null)
    }

    const closeForm = () => {
        setEditingId(null)
        setForm(emptyForm)
        setActionError(null)
    }

    const handleFormChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.title.trim() || !form.description.trim()) {
            setActionError('Title and description are required.')
            return
        }
        setSaving(true)
        setActionError(null)
        try {
            const payload = {
                title: form.title.trim(),
                description: form.description.trim(),
                difficulty: form.difficulty,
                reward: Number(form.reward) || 0,
                icon: form.icon.trim() || '?',
                status: form.status,
                endDate: form.endDate || undefined,
            }

            if (editingId === 'new') {
                await adminCreateChallenge(payload)
            } else {
                await adminUpdateChallenge(editingId, payload)
            }

            closeForm()
            load()
        } catch (err) {
            setActionError(err.message)
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (challenge) => {
        const confirmed = window.confirm(
            `Delete "${challenge.title}"? This cannot be undone. Existing participation records will be removed.`
        )
        if (!confirmed) return

        setDeletingId(challenge._id)
        try {
            await adminDeleteChallenge(challenge._id)
            setChallenges((prev) => prev.filter((c) => c._id !== challenge._id))
        } catch (err) {
            setActionError(err.message)
        } finally {
            setDeletingId(null)
        }
    }

    /** Toggle active <-> completed directly from the table without opening the form */
    const handleToggleStatus = async (challenge) => {
        const nextStatus = challenge.status === 'active' ? 'completed' : 'active'
        try {
            await adminUpdateChallenge(challenge._id, { status: nextStatus })
            setChallenges((prev) =>
                prev.map((c) => (c._id === challenge._id ? { ...c, status: nextStatus } : c))
            )
        } catch (err) {
            setActionError(err.message)
        }
    }

    return (
        <div className="admin-challenges">
            <div className="admin-challenges__head">
                <div>
                    <h2>Community Challenges</h2>
                    <p>Create and manage the challenges shown on the Community page. Changes apply to all users immediately.</p>
                </div>
                <button type="button" className="admin-challenges__add-btn" onClick={openCreateForm}>
                    + New Challenge
                </button>
            </div>

            {actionError && (
                <div className="admin-challenges__error">{actionError}</div>
            )}

            {editingId && (
                <form className="admin-challenges__form" onSubmit={handleSubmit}>
                    <h3>{editingId === 'new' ? 'New Challenge' : 'Edit Challenge'}</h3>

                    <div className="admin-challenges__form-row">
                        <label>
                            Title
                            <input
                                type="text"
                                value={form.title}
                                onChange={(e) => handleFormChange('title', e.target.value)}
                                maxLength={80}
                                required
                            />
                        </label>
                        <label>
                            Icon label (1-2 chars)
                            <input
                                type="text"
                                value={form.icon}
                                onChange={(e) => handleFormChange('icon', e.target.value)}
                                maxLength={3}
                                placeholder="e.g. 5, BM, ZW"
                            />
                        </label>
                    </div>

                    <label className="admin-challenges__full">
                        Description
                        <textarea
                            value={form.description}
                            onChange={(e) => handleFormChange('description', e.target.value)}
                            rows={3}
                            maxLength={400}
                            required
                        />
                    </label>

                    <div className="admin-challenges__form-row">
                        <label>
                            Difficulty
                            <select
                                value={form.difficulty}
                                onChange={(e) => handleFormChange('difficulty', e.target.value)}
                            >
                                {difficultyOptions.map((d) => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </label>
                        <label>
                            Reward (XP)
                            <input
                                type="number"
                                min={0}
                                max={1000}
                                value={form.reward}
                                onChange={(e) => handleFormChange('reward', e.target.value)}
                            />
                        </label>
                        <label>
                            Status
                            <select
                                value={form.status}
                                onChange={(e) => handleFormChange('status', e.target.value)}
                            >
                                {statusOptions.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </label>
                        <label>
                            End date (optional)
                            <input
                                type="date"
                                value={form.endDate}
                                onChange={(e) => handleFormChange('endDate', e.target.value)}
                            />
                        </label>
                    </div>

                    <div className="admin-challenges__form-actions">
                        <button type="button" className="admin-challenges__cancel-btn" onClick={closeForm} disabled={saving}>
                            Cancel
                        </button>
                        <button type="submit" className="admin-challenges__save-btn" disabled={saving}>
                            {saving ? 'Saving…' : editingId === 'new' ? 'Create Challenge' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            )}

            {loading && <p className="admin-challenges__loading">Loading challenges…</p>}
            {error && <p className="admin-challenges__error">{error}</p>}

            {!loading && !error && challenges.length === 0 && (
                <p className="admin-challenges__empty">No challenges yet. Create the first one.</p>
            )}

            {!loading && !error && challenges.length > 0 && (
                <table className="admin-challenges__table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Difficulty</th>
                            <th>Reward</th>
                            <th>Status</th>
                            <th>Participants</th>
                            <th>Completions</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {challenges.map((c) => (
                            <tr key={c._id}>
                                <td>
                                    <strong>{c.icon}</strong> {c.title}
                                </td>
                                <td>{c.difficulty}</td>
                                <td>{c.reward} XP</td>
                                <td>
                                    <button
                                        type="button"
                                        className={`admin-challenges__status-badge admin-challenges__status-badge--${c.status}`}
                                        onClick={() => handleToggleStatus(c)}
                                        title="Click to toggle active/completed"
                                    >
                                        {c.status}
                                    </button>
                                </td>
                                <td>{c.participantsCount}</td>
                                <td>{c.completionsCount}</td>
                                <td className="admin-challenges__row-actions">
                                    <button type="button" onClick={() => openEditForm(c)}>Edit</button>
                                    <button
                                        type="button"
                                        className="admin-challenges__delete-btn"
                                        onClick={() => handleDelete(c)}
                                        disabled={deletingId === c._id}
                                    >
                                        {deletingId === c._id ? 'Deleting…' : 'Delete'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    )
}
