import React, { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { isOnboardingComplete, markOnboardingComplete, userKey } from '../utils/onboardingStorage'
import './Onboarding.css'

const TOTAL = 4

const PREFERENCES_OPTIONS = [
  'Vegetarian',
  'Vegan',
  'Halal',
  'Kosher',
  'No Pork',
  'Pescatarian',
  'Omnivore',
]

const ALLERGIES_OPTIONS = ['Gluten', 'Lactose', 'Peanuts', 'Tree Nuts', 'Eggs', 'Soy', 'Fish', 'Shellfish']

const GOALS_OPTIONS = [
  'Lose Weight',
  'Eat Healthy',
  'Build Muscle',
  'Increase Energy',
  'Reduce Sugar',
  'Quick Cooking',
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
        <p className="onboarding__suggested">Suggested</p>

        <div className="onboarding__progress" aria-label={`Step ${step} of ${TOTAL}`}>
          <div className="onboarding__progress-track">
            <div className="onboarding__progress-fill" style={{ width: `${(step / TOTAL) * 100}%` }} />
          </div>
          <span className="onboarding__progress-label">
            {step} / {TOTAL}
          </span>
        </div>

        {step === 1 && (
          <section className="onboarding__step">
            <h1 className="onboarding__title">Welcome! What's your name?</h1>
            <label className="onboarding__label" htmlFor="onboarding-name">
              Your first name or nickname
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
            <h1 className="onboarding__title">Dietary Preferences</h1>
            <p className="onboarding__hint">Select everything that applies (vegetarian, halal, etc.).</p>
            <div className="onboarding__chips" role="group" aria-label="Dietary Preferences">
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
            <p className="onboarding__hint">Select the allergens to avoid.</p>
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
            <h1 className="onboarding__title">Goals</h1>
            <p className="onboarding__hint">What motivates you? (lose weight, eat healthy, etc.)</p>
            <div className="onboarding__chips" role="group" aria-label="Goals">
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
              Previous
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
              Next
            </button>
          ) : (
            <button type="button" className="onboarding__btn onboarding__btn--primary" onClick={handleFinish}>
              Finish
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default Onboarding
