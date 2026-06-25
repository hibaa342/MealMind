import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { ALLERGY_OPTIONS, CUISINE_OPTIONS, DIET_OPTIONS, GOAL_OPTIONS, labelForId } from '../constants/profileOptions'
import { getDisplayNameFromUser } from '../utils/userDisplay'
import './Profile.css'

const GOAL_ICON_MAP = {
  'weight-loss': '🔥',
  'muscle': '💪',
  'balance': '🥗',
  'reduce-waste': '♻️',
  'eat-healthier': '🌱',
  'save-money': '💰',
  'quick-meals': '⚡',
}

const CUISINE_OPTION_ITEMS = CUISINE_OPTIONS.map((label) => ({ id: label, label }))

const optionItems = (options) => options.map((option) => (
  typeof option === 'string' ? { id: option, label: option } : option
))

const mergeCustomOptions = (baseOptions, selectedIds = []) => {
  const knownIds = new Set(baseOptions.map((option) => option.id))
  const customItems = selectedIds
    .filter((id) => !knownIds.has(id))
    .map((id) => ({ id, label: id }))

  return [...baseOptions, ...customItems]
}

const savedRecipes = [
  { id: 1, title: 'Tajine de legumes', category: 'Moroccan' },
  { id: 2, title: 'Poulet citron', category: 'Protein' },
  { id: 3, title: 'Bowl quinoa', category: 'Healthy' },
  { id: 4, title: 'Soupe lentilles', category: 'Comfort' },
]

const allDietItems = optionItems(DIET_OPTIONS)
const allAllergyItems = optionItems(ALLERGY_OPTIONS)
const allGoalItems = GOAL_OPTIONS.map((goal) => ({
  ...goal,
}))

const Profile = ({ user, onLogout }) => {
  const { profile, topRecipes, loading, updateProfile, error, displayName, setProfile } = useUser()
  const rawDisplayName = displayName || getDisplayNameFromUser(user)
  const shownName = rawDisplayName
  const initials = rawDisplayName ? rawDisplayName.charAt(0).toUpperCase() : 'C'

  const [displayNameOverride, setDisplayNameOverride] = useState('')
  const [addModal, setAddModal] = useState({ open: false, group: 'cuisines', value: '' })
  const [recipePage, setRecipePage] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const accountSectionRef = useRef(null)
  const displayNameInputRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!profile) return
    setDisplayNameOverride(profile.nameSidebarOverride ?? '')
  }, [profile])

  useEffect(() => {
    setRecipePage(0)
  }, [topRecipes])

  const saveProfile = useCallback(
    async (updates) => {
      setIsSaving(true)
      setSaveMessage('')
      try {
        await updateProfile(updates)
        setSaveMessage('Saved successfully')
      } catch (err) {
        setSaveMessage('Unable to save changes')
      } finally {
        setIsSaving(false)
      }
    },
    [updateProfile]
  )

  const currentDietSet = useMemo(() => new Set(profile?.diet ?? []), [profile?.diet])
  const currentAllergiesSet = useMemo(() => new Set(profile?.allergies ?? []), [profile?.allergies])
  const currentCuisinesSet = useMemo(() => new Set(profile?.cuisines ?? []), [profile?.cuisines])
  const currentGoalsSet = useMemo(() => new Set(profile?.goals ?? []), [profile?.goals])

  const toggleProfileArrayValue = useCallback(
    async (fieldName, value, currentValues = []) => {
      const normalized = Array.isArray(currentValues) ? currentValues : []
      const nextValues = normalized.includes(value)
        ? normalized.filter((item) => item !== value)
        : [...normalized, value]

      // Optimistic UI update
      const prev = profile
      try {
        if (profile) setProfile({ ...profile, [fieldName]: nextValues })
        await saveProfile({ [fieldName]: nextValues })
      } catch (err) {
        // revert on failure
        if (prev) setProfile(prev)
        throw err
      }
    },
    [saveProfile, profile, setProfile]
  )

  const handleToggleDiet = (id) => toggleProfileArrayValue('diet', id, profile?.diet)
  const handleToggleAllergy = (id) => toggleProfileArrayValue('allergies', id, profile?.allergies)
  const handleToggleCuisine = (id) => toggleProfileArrayValue('cuisines', id, profile?.cuisines)
  const handleToggleGoal = (id) => toggleProfileArrayValue('goals', id, profile?.goals)

  const handleSaveDisplayName = async () => {
    await saveProfile({ nameSidebarOverride: displayNameOverride })
    setTimeout(() => setSaveMessage(''), 3000)
  }

  const handleEditProfile = () => {
    if (accountSectionRef.current) {
      accountSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
      // focus the input shortly after scrolling
      setTimeout(() => {
        displayNameInputRef.current?.focus()
      }, 220)
    }
  }

  const handleOpenAdd = (group) => setAddModal({ open: true, group, value: '' })
  const handleCloseAdd = () => setAddModal((prev) => ({ ...prev, open: false, value: '' }))

  const handleSubmitAdd = async () => {
    const trimmed = addModal.value.trim()
    if (!trimmed || !profile) return

    const currentValues = profile[addModal.group] ?? []
    if (currentValues.includes(trimmed)) {
      handleCloseAdd()
      return
    }

    const nextValues = [...currentValues, trimmed]
    // optimistic update: show immediately in UI
    const prev = profile
    try {
      if (profile) setProfile({ ...profile, [addModal.group]: nextValues })
      await saveProfile({ [addModal.group]: nextValues })
    } catch (err) {
      if (prev) setProfile(prev)
    } finally {
      handleCloseAdd()
    }
  }

  const allCuisineItems = useMemo(
    () => mergeCustomOptions(CUISINE_OPTION_ITEMS, profile?.cuisines),
    [profile?.cuisines]
  )

  /* --- New UI components (local) --- */
  const MultiSelect = ({ label, items, selectedSet, onToggle }) => {
    const [open, setOpen] = useState(false)
    return (
      <div className="multi-select">
        <div className="multi-select__header">
          <strong>{label}</strong>
          <button type="button" className="profile-icon-btn" onClick={() => setOpen((s) => !s)} aria-expanded={open}>
            {open ? '▴' : '▾'}
          </button>
        </div>
        <div className="multi-select__tags">
          {Array.from(selectedSet).map((id) => (
            <span key={id} className="profile-pill profile-pill--active">{labelForId(DIET_OPTIONS, id)}</span>
          ))}
        </div>
        {open && (
          <div className="multi-select__dropdown">
            {items.map((it) => {
              const selected = selectedSet.has(it.id)
              return (
                <button key={it.id} type="button" className={`multi-select__item ${selected ? 'selected' : ''}`} onClick={() => onToggle(it.id)}>
                  <span className="multi-select__check">{selected ? '✓' : '○'}</span>
                  <span>{it.label}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  const SearchableSelect = ({ label, items, selectedSet, onToggle, placeholder = 'Search...' }) => {
    const [query, setQuery] = useState('')
    const filtered = items.filter((it) => it.label.toLowerCase().includes(query.toLowerCase()))
    return (
      <div className="searchable-select">
        <div className="searchable-select__header">
          <strong>{label}</strong>
          <input className="searchable-select__input" placeholder={placeholder} value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="searchable-select__list">
          {filtered.map((it) => {
            const selected = selectedSet.has(it.id)
            return (
              <button key={it.id} type="button" className={`searchable-select__item ${selected ? 'selected' : ''}`} onClick={() => onToggle(it.id)}>
                <span className="searchable-select__check">{selected ? '✓' : '○'}</span>
                <span>{it.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  const AutocompleteCuisines = ({ items, selectedSet, onToggle, onAdd }) => {
    const [value, setValue] = useState('')
    const suggestions = items.filter((it) => it.label.toLowerCase().includes(value.toLowerCase())).slice(0, 8)
    const submit = async () => {
      const trimmed = value.trim()
      if (!trimmed) return
      if (selectedSet.has(trimmed)) { setValue(''); return }
      // If suggestion exists, toggle it; otherwise add as custom cuisine
      if (items.some((it) => it.id === trimmed)) {
        onToggle(trimmed)
      } else {
        // Add custom cuisine to profile immediately
        const next = [...(profile?.cuisines ?? []), trimmed]
        const prev = profile
        try {
          if (profile) setProfile({ ...profile, cuisines: next })
          await saveProfile({ cuisines: next })
        } catch (err) {
          if (prev) setProfile(prev)
        }
      }
      setValue('')
    }
    return (
      <div className="autocomplete-cuisines">
        <div className="autocomplete-cuisines__row">
          <input className="form-input-modern" placeholder="Add or search cuisines" value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} />
          <button type="button" className="profile-btn profile-btn--secondary" onClick={submit}>Add</button>
        </div>
        {value && suggestions.length > 0 && (
          <div className="autocomplete-cuisines__suggestions">
            {suggestions.map((s) => (
              <button key={s.id} type="button" className="autocomplete-cuisines__suggestion" onClick={() => { onToggle(s.id); setValue('') }}>
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  const currentSelection = useMemo(
    () => ({
      Diet: (profile?.diet ?? []).map((id) => labelForId(DIET_OPTIONS, id)),
      Allergies: (profile?.allergies ?? []).map((id) => labelForId(ALLERGY_OPTIONS, id)),
      Cuisines: profile?.cuisines ?? [],
      Goals: (profile?.goals ?? []).map((id) => labelForId(GOAL_OPTIONS, id)),
    }),
    [profile]
  )

  const recipesList = topRecipes?.length ? topRecipes : savedRecipes
  const pageCount = Math.max(1, Math.ceil(recipesList.length / 4))
  const recipePageItems = recipesList.slice(recipePage * 4, recipePage * 4 + 4)

  // Show loading state
  if (loading) {
    return (
      <div className="cookpal-page cookpal-profile-page">
        <div className="profile-page-content">
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show error state
  if (error && !profile) {
    return (
      <div className="cookpal-page cookpal-profile-page">
        <div className="profile-page-content">
          <div style={{ padding: '2rem', textAlign: 'center', color: '#d53f3f' }}>
            <p>Unable to load profile: {error}</p>
          </div>
        </div>
      </div>
    )
  }

  // Show blank state if no profile data
  if (!profile) {
    return (
      <div className="cookpal-page cookpal-profile-page">
        <div className="profile-page-content">
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <p>No profile data available</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="cookpal-page cookpal-profile-page">
      <div className="profile-page-content">
        <section className="profile-card profile-card--header">
          <div className="profile-card__hero">
            <div className="profile-avatar" aria-hidden>
              {initials}
            </div>
            <div className="profile-card__title-block">
              <p className="profile-card__eyebrow">Smarter meals, less waste.</p>
              <h1 className="profile-card__name">{shownName}</h1>
              <p className="profile-card__meta">Joined July 2024</p>
            </div>
          </div>
            <div className="profile-card__actions">
              <button type="button" className="profile-btn profile-btn--primary" onClick={handleEditProfile}>Edit Profile</button>
          </div>
        </section>

        <div className="profile-layout-grid">
          <main className="profile-main">
            <section className="profile-card profile-card--section">
              <div className="profile-section-header">
                <div>
                  <h2>Dietary Preferences</h2>
                  <p className="profile-section__hint">Selected diets are shown as active chips.</p>
                </div>
              </div>
                <div className="profile-pill-list">
                  <MultiSelect label="Diets" items={allDietItems} selectedSet={currentDietSet} onToggle={handleToggleDiet} />
                </div>
            </section>

            <section className="profile-card profile-card--section">
              <div className="profile-section-header">
                <div>
                  <h2>Allergies</h2>
                  <p className="profile-section__hint">Avoid the allergens that matter most.</p>
                </div>
              </div>
              <div className="profile-pill-list">
                <SearchableSelect label="Allergies" items={allAllergyItems} selectedSet={currentAllergiesSet} onToggle={handleToggleAllergy} placeholder="Filter allergies" />
              </div>
            </section>

            <section className="profile-card profile-card--section">
              <div className="profile-section-header">
                <div>
                  <h2>Cuisines</h2>
                  <p className="profile-section__hint">Tap to save your favorite cuisine styles.</p>
                </div>
              </div>
              <div className="profile-pill-list">
                <AutocompleteCuisines items={allCuisineItems} selectedSet={currentCuisinesSet} onToggle={handleToggleCuisine} />
              </div>
            </section>

            <section className="profile-card profile-card--section">
              <div className="profile-section-header">
                <div>
                  <h2>Goals</h2>
                  <p className="profile-section__hint">Track the goals that keep your meals on target.</p>
                </div>
              </div>
              <div className="profile-goal-grid">
                {allGoalItems.map((goal) => {
                  const selected = currentGoalsSet.has(goal.id)
                  return (
                    <button
                      key={goal.id}
                      type="button"
                      className={`profile-goal-card ${selected ? 'profile-goal-card--selected' : ''}`}
                      onClick={() => handleToggleGoal(goal.id)}
                      aria-pressed={selected}
                    >
                      <span className="profile-goal-card__label">
                        {goal.label}
                      </span>
                      <span className="profile-goal-card__action">+</span>
                    </button>
                  )
                })}
              </div>
            </section>

            <section className="profile-card profile-card--section saved-recipes-section">
              <div className="saved-recipes-header">
                <div>
                  <h2>Saved Recipes</h2>
                  <p className="profile-section__hint">Quick access to your meal ideas.</p>
                </div>
                <div className="saved-recipes-controls">
                  <button
                    type="button"
                    className="icon-button"
                    aria-label="Previous"
                    onClick={() => setRecipePage((current) => Math.max(0, current - 1))}
                    disabled={recipePage === 0}
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    className="icon-button"
                    aria-label="Next"
                    onClick={() => setRecipePage((current) => Math.min(pageCount - 1, current + 1))}
                    disabled={recipePage >= pageCount - 1}
                  >
                    ›
                  </button>
                </div>
              </div>
              <div className="saved-recipes-row">
                {recipePageItems.map((recipe) => (
                  <article key={recipe.id} className="saved-recipe-card">
                    <div className="saved-recipe-card__badge">{recipe.category}</div>
                    <h3 className="saved-recipe-card__title">{recipe.title}</h3>
                  </article>
                ))}
              </div>
              <button
                type="button"
                className="profile-link-btn"
                onClick={() => navigate('/recipes')}
                disabled={!recipesList.length}
              >
                Show More
              </button>
            </section>

            <section className="profile-card profile-card--settings">
              <div className="profile-section-header">
                <div>
                  <h2>Account</h2>
                  <p className="profile-section__hint">Adjust display name and review your account details.</p>
                </div>
              </div>
              <div className="profile-settings-row" ref={accountSectionRef}>
                <label htmlFor="cookpal-prefer-name">Sidebar custom name</label>
                <div className="profile-settings-input-row">
                  <input
                    id="cookpal-prefer-name"
                    type="text"
                    className="form-input-modern"
                    value={displayNameOverride}
                    onChange={(e) => setDisplayNameOverride(e.target.value)}
                    placeholder={getDisplayNameFromUser(user)}
                    ref={displayNameInputRef}
                  />
                  <button type="button" className="profile-btn profile-btn--secondary" onClick={handleSaveDisplayName} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
              {saveMessage && <p className="profile-section__hint">{saveMessage}</p>}
              {error && <p className="profile-section__hint" style={{ color: '#d53f3f' }}>{error}</p>}
              <div className="profile-settings-info">
                <div>
                  <span>Name</span>
                  <strong>{profile?.name || user?.name || '-'}</strong>
                </div>
                <div>
                  <span>Email</span>
                  <strong>{profile?.email || user?.email || '-'}</strong>
                </div>
              </div>
            </section>

            <button type="button" className="profile-logout-btn" onClick={onLogout}>
              Log Out Account
            </button>
          </main>
        </div>

        {addModal.open && (
          <div className="cookpal-modal-backdrop" role="presentation" onClick={handleCloseAdd}>
            <div className="cookpal-modal cookpal-panel" role="dialog" aria-labelledby="add-pref-title" onClick={(e) => e.stopPropagation()}>
              <h2 id="add-pref-title" className="cookpal-subtitle">Add {addModal.group}</h2>
              <label className="cookpal-modal__label" htmlFor="add-pref-input">Name</label>
              <input
                id="add-pref-input"
                className="cookpal-modal__input"
                value={addModal.value}
                onChange={(e) => setAddModal((prev) => ({ ...prev, value: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmitAdd()}
                placeholder={`e.g. ${addModal.group === 'goals' ? 'Save Money' : 'Italian'}`}
                autoFocus
              />
              <div className="cookpal-modal__actions">
                <button type="button" className="cookpal-modal__btn cookpal-modal__btn--ghost" onClick={handleCloseAdd}>Cancel</button>
                <button type="button" className="cookpal-modal__btn cookpal-modal__btn--primary" onClick={handleSubmitAdd}>Add</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile
