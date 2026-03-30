import React, { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { isOnboardingComplete, markOnboardingComplete, userKey } from '../utils/onboardingStorage'
import './Onboarding.css'

const TOTAL = 4

const PREFERENCES_OPTIONS = [
  'Végétarien',
  'Végan',
  'Halal',
  'Casher',
  'Sans porc',
  'Pescétarien',
  'Omnivore',
]

const ALLERGIES_OPTIONS = ['Gluten', 'Lactose', 'Arachides', 'Fruits à coque', 'Œufs', 'Soja', 'Poisson', 'Crustacés']

const GOALS_OPTIONS = [
  'Perdre du poids',
  'Manger équilibré',
  'Prendre du muscle',
  "Gain d'énergie",
  'Réduire le sucre',
  'Cuisine rapide',
]

function toggleInList(list, item) {
  if (list.includes(item)) return list.filter((x) => x !== item)
  return [...list, item]
}

const Onboarding = ({ user, onComplete }) => {
  const navigate = useNavigate()
  const uid = userKey(user)

  const [step, setStep] = useState(1)
  const [name, setName] = useState(user?.name || '')
  const [preferences, setPreferences] = useState([])
  const [allergies, setAllergies] = useState([])
  const [goals, setGoals] = useState([])

  if (!user || !uid) {
    return <Navigate to="/login" replace />
  }

  if (isOnboardingComplete(user)) {
    return <Navigate to="/dashboard" replace />
  }

  const goNext = () => setStep((s) => Math.min(TOTAL, s + 1))
  const goPrev = () => setStep((s) => Math.max(1, s - 1))

  const handleFinish = () => {
    const trimmed = name.trim()
    const updatedUser = {
      ...user,
      name: trimmed || user.name || 'Chef',
      dietPreferences: preferences,
      allergies,
      goals,
    }
    markOnboardingComplete(updatedUser)
    onComplete(updatedUser)
    navigate('/dashboard', { replace: true })
  }

  const canProceed = () => {
    if (step === 1) return name.trim().length > 0
    return true
  }

  return (
    <div className="onboarding">
      <div className="onboarding__panel">
        <p className="onboarding__suggested">Suggéré</p>

        <div className="onboarding__progress" aria-label={`Étape ${step} sur ${TOTAL}`}>
          <div className="onboarding__progress-track">
            <div className="onboarding__progress-fill" style={{ width: `${(step / TOTAL) * 100}%` }} />
          </div>
          <span className="onboarding__progress-label">
            {step} / {TOTAL}
          </span>
        </div>

        {step === 1 && (
          <section className="onboarding__step">
            <h1 className="onboarding__title">Bienvenue ! Comment tu t’appelles ?</h1>
            <label className="onboarding__label" htmlFor="onboarding-name">
              Ton prénom ou pseudo
            </label>
            <input
              id="onboarding-name"
              className="onboarding__input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex. Alex"
              autoComplete="name"
              autoFocus
            />
          </section>
        )}

        {step === 2 && (
          <section className="onboarding__step">
            <h1 className="onboarding__title">Préférences alimentaires</h1>
            <p className="onboarding__hint">Choisis tout ce qui s’applique (végétarien, halal…).</p>
            <div className="onboarding__chips" role="group" aria-label="Préférences alimentaires">
              {PREFERENCES_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  className={`onboarding__chip ${preferences.includes(opt) ? 'onboarding__chip--active' : ''}`}
                  onClick={() => setPreferences((p) => toggleInList(p, opt))}
                >
                  {opt}
                </button>
              ))}
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="onboarding__step">
            <h1 className="onboarding__title">Allergies</h1>
            <p className="onboarding__hint">Sélectionne les allergènes à éviter.</p>
            <div className="onboarding__chips" role="group" aria-label="Allergies">
              {ALLERGIES_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  className={`onboarding__chip ${allergies.includes(opt) ? 'onboarding__chip--active' : ''}`}
                  onClick={() => setAllergies((a) => toggleInList(a, opt))}
                >
                  {opt}
                </button>
              ))}
            </div>
          </section>
        )}

        {step === 4 && (
          <section className="onboarding__step">
            <h1 className="onboarding__title">Objectifs</h1>
            <p className="onboarding__hint">Qu’est-ce qui te motive ? (perdre du poids, manger équilibré…)</p>
            <div className="onboarding__chips" role="group" aria-label="Objectifs">
              {GOALS_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  className={`onboarding__chip ${goals.includes(opt) ? 'onboarding__chip--active' : ''}`}
                  onClick={() => setGoals((g) => toggleInList(g, opt))}
                >
                  {opt}
                </button>
              ))}
            </div>
          </section>
        )}

        <div className="onboarding__actions">
          {step > 1 && (
            <button type="button" className="onboarding__btn onboarding__btn--ghost" onClick={goPrev}>
              Précédent
            </button>
          )}
          <div className="onboarding__actions-spacer" />
          {step < TOTAL ? (
            <button
              type="button"
              className="onboarding__btn onboarding__btn--primary"
              onClick={goNext}
              disabled={!canProceed()}
            >
              Suivant
            </button>
          ) : (
            <button type="button" className="onboarding__btn onboarding__btn--primary" onClick={handleFinish}>
              Terminer
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default Onboarding
