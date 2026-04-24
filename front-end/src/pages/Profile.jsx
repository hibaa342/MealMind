import React, { useState, useEffect } from 'react'
import { getDisplayNameFromUser, getPreferredDisplayName, setPreferredDisplayName } from '../utils/userDisplay'

const savedRecipes = [
  { id: 1, title: 'Tajine de legumes', category: 'Marocain' },
  { id: 2, title: 'Poulet citron', category: 'Protein' },
  { id: 3, title: 'Bowl quinoa', category: 'Healthy' },
  { id: 4, title: 'Soupe lentilles', category: 'Comfort' },
]

const Profile = ({ user, onLogout }) => {
  const shownName = getPreferredDisplayName() || getDisplayNameFromUser(user)
  const initials = shownName ? shownName.charAt(0).toUpperCase() : 'C'

  const [preferInput, setPreferInput] = useState(() => getPreferredDisplayName())
  useEffect(() => {
    const sync = () => setPreferInput(getPreferredDisplayName())
    window.addEventListener('cookpal-display-name-changed', sync)
    return () => window.removeEventListener('cookpal-display-name-changed', sync)
  }, [])
  const foodPreferences = ['Vegetarien', 'Sans gluten', 'Halal', 'Vegan']
  const allergies = ['Gluten', 'Lactose', 'Noix']
  const goals = ['Perte de poids', 'Muscle', 'Equilibre']

  return (
    <div className="cookpal-page cookpal-profile-page">
      <h1 className="cookpal-page__title">Profil</h1>
      <p className="cookpal-page__lead">Informations personnelles et preferences.</p>

      <section className="cookpal-panel">
        <div className="cookpal-profile-hero">
          {user?.photo ? (
            <img src={user.photo} alt={shownName} className="cookpal-profile-hero__avatar" />
          ) : (
            <div className="cookpal-profile-hero__avatar cookpal-profile-hero__avatar--initial">{initials}</div>
          )}

          <div>
            <h2>{shownName}</h2>
            <p>{user?.email || '—'}</p>
          </div>
          <button type="button" className="btn btn-primary cookpal-profile-hero__edit">
            Modifier le profil
          </button>
        </div>
      </section>

      <section className="cookpal-panel">
        <h2 className="cookpal-subtitle">Preferences alimentaires</h2>
        <div className="cookpal-tag-list">
          {foodPreferences.map((item) => (
            <span key={item} className="cookpal-chip">
              {item}
            </span>
          ))}
        </div>
      </section>

      <section className="cookpal-panel">
        <h2 className="cookpal-subtitle">Allergies</h2>
        <div className="cookpal-tag-list">
          {allergies.map((item) => (
            <span key={item} className="cookpal-chip">
              {item}
            </span>
          ))}
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
              {user.name || '—'}
            </p>
            <p style={{ marginTop: 12 }}>
              <strong>Email</strong>
              <br />
              {user.email || '—'}
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
