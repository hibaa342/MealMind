import React, { useState, useEffect, useCallback } from 'react'
import { getDisplayNameFromUser, getPreferredDisplayName, setPreferredDisplayName } from '../utils/userDisplay'

const PREFS_STORAGE_KEY = 'cookpal-food-preferences-v1'

const DIET_OPTIONS = [
  {
    id: 'meat',
    label: 'Viande',
    hint: 'Meat',
    image: 'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=240&q=80',
  },
  {
    id: 'soup',
    label: 'Soupe',
    hint: 'Soup',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=240&q=80',
  },
  {
    id: 'vegan',
    label: 'Végétalien',
    hint: 'Vegan',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=240&q=80',
  },
  {
    id: 'gluten-free',
    label: 'Sans gluten',
    hint: 'Gluten-Free',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=240&q=80',
  },
]

const ALLERGY_OPTIONS = [
  {
    id: 'wheat',
    label: 'Blé',
    hint: 'Wheat',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=240&q=80',
  },
  {
    id: 'dairy',
    label: 'Produits laitiers',
    hint: 'Dairy',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=240&q=80',
  },
  {
    id: 'peanuts',
    label: 'Arachides',
    hint: 'Peanuts',
    image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=240&q=80',
  },
  {
    id: 'eggs',
    label: 'Œufs',
    hint: 'Eggs',
    image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=240&q=80',
  },
]

const CUISINE_OPTIONS = [
  {
    id: 'american',
    label: 'Américaine',
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&q=80',
  },
  {
    id: 'italian',
    label: 'Italienne',
    image: 'https://images.unsplash.com/photo-1598866594230-e79c228a9e11?w=400&q=80',
  },
]

const savedRecipes = [
  { id: 1, title: 'Tajine de legumes', category: 'Marocain' },
  { id: 2, title: 'Poulet citron', category: 'Protein' },
  { id: 3, title: 'Bowl quinoa', category: 'Healthy' },
  { id: 4, title: 'Soupe lentilles', category: 'Comfort' },
]

function loadPrefs() {
  try {
    const raw = localStorage.getItem(PREFS_STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    return {
      diet: new Set(Array.isArray(data.diet) ? data.diet : []),
      allergies: new Set(Array.isArray(data.allergies) ? data.allergies : []),
      cuisines: new Set(Array.isArray(data.cuisines) ? data.cuisines : []),
    }
  } catch {
    return null
  }
}

function savePrefs(diet, allergies, cuisines) {
  try {
    localStorage.setItem(
      PREFS_STORAGE_KEY,
      JSON.stringify({
        diet: [...diet],
        allergies: [...allergies],
        cuisines: [...cuisines],
      })
    )
  } catch {
    /* ignore */
  }
}

const Profile = ({ user, onLogout }) => {
  const shownName = getPreferredDisplayName() || getDisplayNameFromUser(user)
  const initials = shownName ? shownName.charAt(0).toUpperCase() : 'C'

  const [preferInput, setPreferInput] = useState(() => getPreferredDisplayName())
  useEffect(() => {
    const sync = () => setPreferInput(getPreferredDisplayName())
    window.addEventListener('cookpal-display-name-changed', sync)
    return () => window.removeEventListener('cookpal-display-name-changed', sync)
  }, [])

  const [selectedDiet, setSelectedDiet] = useState(() => loadPrefs()?.diet ?? new Set(['meat', 'soup']))
  const [selectedAllergies, setSelectedAllergies] = useState(
    () => loadPrefs()?.allergies ?? new Set(['wheat', 'dairy'])
  )
  const [selectedCuisines, setSelectedCuisines] = useState(() => loadPrefs()?.cuisines ?? new Set())

  useEffect(() => {
    savePrefs(selectedDiet, selectedAllergies, selectedCuisines)
  }, [selectedDiet, selectedAllergies, selectedCuisines])

  const toggleInSet = useCallback((setter, id) => {
    setter((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const goals = ['Perte de poids', 'Muscle', 'Equilibre']

  return (
    <div className="cookpal-page cookpal-profile-page">
      <section className="cookpal-panel cookpal-profile-panel--hero">
        <div className="cookpal-profile-header">
          {user?.photo ? (
            <img src={user.photo} alt="" className="cookpal-profile-header__avatar" />
          ) : (
            <div className="cookpal-profile-header__avatar cookpal-profile-header__avatar--initial" aria-hidden>
              {initials}
            </div>
          )}
          <div className="cookpal-profile-header__main">
            <div className="cookpal-profile-header__title-row" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h1 className="cookpal-profile-header__name">{shownName}</h1>
              <button type="button" className="cookpal-profile-header__edit" onClick={() => {}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '4px' }}>
                  <path d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
                Edit Profile
              </button>
              <button type="button" className="cookpal-profile-header__icon-btn" aria-label="Settings" onClick={() => {}} style={{ background: 'transparent', width: 'auto', height: 'auto', padding: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" color="#6b7c8a">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
                </svg>
              </button>
            </div>
            <p className="cookpal-profile-header__tagline">Smarter meals, less waste.</p>
          </div>
        </div>
      </section>

      <section className="cookpal-panel cookpal-pref-section">
        <div className="cookpal-pref-section__head">
          <h2 className="cookpal-pref-section__title">Régime alimentaire</h2>
          <button type="button" className="cookpal-pref-section__manage">
            Ajouter et gérer
            <span className="cookpal-pref-section__plus" aria-hidden>
              +
            </span>
          </button>
        </div>
        <div className="cookpal-pref-grid">
          {DIET_OPTIONS.map((item) => {
            const selected = selectedDiet.has(item.id)
            return (
              <button
                key={item.id}
                type="button"
                className={`cookpal-pref-card ${selected ? 'cookpal-pref-card--selected' : ''}`}
                onClick={() => toggleInSet(setSelectedDiet, item.id)}
                aria-pressed={selected}
              >
                <span className="cookpal-pref-card__thumb-wrap">
                  <img src={item.image} alt="" className="cookpal-pref-card__thumb" loading="lazy" />
                </span>
                <span className="cookpal-pref-card__text">
                  {item.label} <span className="cookpal-pref-card__hint">({item.hint})</span>
                </span>
              </button>
            )
          })}
        </div>
      </section>

      <section className="cookpal-panel cookpal-pref-section">
        <div className="cookpal-pref-section__head">
          <h2 className="cookpal-pref-section__title">Allergies</h2>
          <button type="button" className="cookpal-pref-section__manage">
            Ajouter et gérer
            <span className="cookpal-pref-section__plus" aria-hidden>
              +
            </span>
          </button>
        </div>
        <div className="cookpal-pref-grid">
          {ALLERGY_OPTIONS.map((item) => {
            const selected = selectedAllergies.has(item.id)
            return (
              <button
                key={item.id}
                type="button"
                className={`cookpal-pref-card ${selected ? 'cookpal-pref-card--selected' : ''}`}
                onClick={() => toggleInSet(setSelectedAllergies, item.id)}
                aria-pressed={selected}
              >
                <span className="cookpal-pref-card__thumb-wrap">
                  <img src={item.image} alt="" className="cookpal-pref-card__thumb" loading="lazy" />
                </span>
                <span className="cookpal-pref-card__text">
                  {item.label} <span className="cookpal-pref-card__hint">({item.hint})</span>
                </span>
              </button>
            )
          })}
        </div>
      </section>

      <section className="cookpal-panel cookpal-pref-section">
        <div className="cookpal-pref-section__head">
          <h2 className="cookpal-pref-section__title">Cuisines</h2>
          <button type="button" className="cookpal-pref-section__manage">
            Ajouter et gérer
            <span className="cookpal-pref-section__plus" aria-hidden>
              +
            </span>
          </button>
        </div>
        <div className="cookpal-cuisine-grid">
          {CUISINE_OPTIONS.map((item) => {
            const selected = selectedCuisines.has(item.id)
            return (
              <button
                key={item.id}
                type="button"
                className={`cookpal-cuisine-card ${selected ? 'cookpal-cuisine-card--selected' : ''}`}
                onClick={() => toggleInSet(setSelectedCuisines, item.id)}
                aria-pressed={selected}
              >
                <span className="cookpal-cuisine-card__media">
                  <img src={item.image} alt="" className="cookpal-cuisine-card__img" loading="lazy" />
                </span>
                <span className="cookpal-cuisine-card__label">{item.label}</span>
              </button>
            )
          })}
        </div>
      </section>

      <section className="cookpal-panel">
        <h2 className="cookpal-subtitle">Objectifs</h2>
        <div className="cookpal-tag-list">
          {goals.map((item) => (
            <span key={item} className="cookpal-chip">
              {item}
            </span>
          ))}
        </div>
      </section>

      <section className="cookpal-panel">
        <h2 className="cookpal-subtitle">Recettes sauvegardees</h2>
        <div className="cookpal-mini-cards">
          {savedRecipes.map((recipe) => (
            <article className="cookpal-mini-card" key={recipe.id}>
              <h3>{recipe.title}</h3>
              <span>{recipe.category}</span>
            </article>
          ))}
        </div>
      </section>

      <button type="button" className="btn cookpal-logout-btn" onClick={onLogout}>
        Se deconnecter
      </button>

      <div className="cookpal-help-card">
        <h2>Settings</h2>
        <p>Account details</p>
        <div style={{ marginTop: 16 }}>
          <label htmlFor="cookpal-prefer-name" style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>
            Name in sidebar
          </label>
          <p style={{ margin: '0 0 8px 0', fontSize: '0.88rem', color: 'var(--cookpal-text-muted, #6b7c8a)' }}>
            Override the name shown top-right (e.g. if your account name is wrong). Leave empty to use your account name or email.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              id="cookpal-prefer-name"
              type="text"
              className="form-input-modern"
              style={{ flex: '1 1 200px', minWidth: 0, maxWidth: '100%' }}
              value={preferInput}
              onChange={(e) => setPreferInput(e.target.value)}
              placeholder={getDisplayNameFromUser(user)}
            />
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setPreferredDisplayName(preferInput)}
            >
              Save
            </button>
          </div>
        </div>
        {user ? (
          <>
            <p style={{ marginTop: 12 }}>
              <strong>Name</strong>
              <br />
              {user.name || '-'}
            </p>
            <p style={{ marginTop: 12 }}>
              <strong>Email</strong>
              <br />
              {user.email || '-'}
            </p>
            {user.title && (
              <p style={{ marginTop: 12 }}>
                <strong>Title</strong>
                <br />
                {user.title}
              </p>
            )}
          </>
        ) : (
          <p style={{ marginTop: 12 }}>No user information.</p>
        )}
      </div>
    </div>
  )
}

export default Profile
