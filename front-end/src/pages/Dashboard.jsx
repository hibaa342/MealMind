import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, useOutletContext, Link } from 'react-router-dom'
import { addUserRecipe } from '../utils/userRecipes'

import imgGrocery from '../assets/images/grocery_1777065653499.png'

const QUICK_RECIPES = [
  {
    title: 'Taco salad bowl',
    time: '15 min',
    img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop',
  },
  {
    title: 'Tomato soup',
    time: '25 min',
    img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=200&h=200&fit=crop',
  },
  {
    title: 'Mushroom soup',
    time: '20 min',
    img: 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=200&h=200&fit=crop',
  },
  {
    title: 'Lentil soup',
    time: '35 min',
    img: 'https://images.unsplash.com/photo-1599021411243-2042c9ce2edc?w=200&h=200&fit=crop',
  },
]

const FRIDGE_FRESH = [
  { name: 'Tomatoes', kcal: '200 kcal', tag: 'Healthy', img: 'https://images.unsplash.com/photo-1592841200221-6907f3103098?w=160&h=160&fit=crop' },
  { name: 'Spinach', kcal: '45 kcal', tag: 'Greens', img: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=160&h=160&fit=crop' },
  { name: 'Avocado', kcal: '320 kcal', tag: 'Healthy fats', img: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=160&h=160&fit=crop' },
  { name: 'Carrots', kcal: '90 kcal', tag: 'Fiber', img: 'https://images.unsplash.com/photo-1445282768818-728615cc910a?w=160&h=160&fit=crop' },
]

const Dashboard = () => {
  const navigate = useNavigate()
  const { voice } = useOutletContext() || {}

  const [createOpen, setCreateOpen] = useState(false)
  const [recipeTitle, setRecipeTitle] = useState('')
  const [recipeTime, setRecipeTime] = useState('30 min')
  const [recipeCategories, setRecipeCategories] = useState('')
  const [recipeImage, setRecipeImage] = useState(
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=480&h=280&fit=crop'
  )

  const toggleRecording = () => voice?.toggleRecording?.()
  const playRecording = () => voice?.playRecording?.()
  const isRecording = voice?.isRecording
  const voiceNote = voice?.voiceNote

  const closeCreate = useCallback(() => {
    setCreateOpen(false)
    setRecipeTitle('')
    setRecipeTime('30 min')
    setRecipeCategories('')
    setRecipeImage('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=480&h=280&fit=crop')
  }, [])

  useEffect(() => {
    if (!createOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') closeCreate()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [createOpen, closeCreate])

  const submitRecipe = () => {
    const title = recipeTitle.trim()
    if (!title) return
    addUserRecipe({
      title,
      time: recipeTime.trim() || '30 min',
      categories: recipeCategories.trim() || 'My recipes',
      rating: 4,
      tags: ['Home'],
      image: recipeImage.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=480&h=280&fit=crop',
      accent: 'green',
    })
    closeCreate()
    navigate('/recipes')
  }

  return (
    <div className="cookpal-home cookpal-home--grocio">
      <div className="grocio-search-row">
        <div className="cookpal-search grocio-search">
          <span className="cookpal-search__icon" aria-hidden>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
          </span>
          <input
            type="search"
            className="cookpal-search__input"
            placeholder="Search recipes, ingredients…"
            aria-label="Search"
          />
          <button
            type="button"
            className={`cookpal-search__mic ${isRecording ? 'cookpal-search__mic--recording' : ''}`}
            onClick={toggleRecording}
            aria-label={isRecording ? 'Stop recording' : 'Start voice recording'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          </button>
          <button type="button" className="cookpal-search__ai" onClick={playRecording} aria-label="Play recording" title="Play last recording">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--grocio-green)" strokeWidth="1.75">
              <polygon points="5 3 19 12 5 21 5 3" fill="var(--grocio-green)" stroke="none" />
            </svg>
          </button>
        </div>
        <button type="button" className="grocio-pill-btn" onClick={() => setCreateOpen(true)}>
          + Recipe
        </button>
      </div>

      {voiceNote && (
        <p className="cookpal-voice-hint grocio-hint" role="status">
          {voiceNote}
        </p>
      )}

      <section className="grocio-hero-card" aria-label="Your fridge">
        <div className="grocio-hero-card__img" style={{ backgroundImage: `url(${imgGrocery})` }} />
        <div className="grocio-hero-card__overlay">
          <span className="grocio-hero-card__badge">Live inventory</span>
          <h2 className="grocio-hero-card__title">What&apos;s in your fridge</h2>
          <p className="grocio-hero-card__sub">Tap scanner to update stock and cut waste.</p>
          <Link to="/scanner" className="grocio-hero-card__cta">
            Open scanner
          </Link>
        </div>
      </section>

      <Link to="/recipes" className="grocio-suggest-card">
        <div
          className="grocio-suggest-card__thumb"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1512058564366-18510be2db9a?w=200&h=200&fit=crop)',
          }}
        />
        <div className="grocio-suggest-card__body">
          <h3 className="grocio-suggest-card__title">Veggie stir fry</h3>
          <div className="grocio-suggest-card__meta">
            <span>270 kcal</span>
            <span className="grocio-tag">Healthy</span>
            <span className="grocio-tag">Low fat</span>
          </div>
          <p className="grocio-suggest-card__foot">8 ingredients · matches your fridge</p>
        </div>
      </Link>

      <section className="grocio-section">
        <div className="grocio-section__head">
          <h2 className="grocio-section__title">Quick recipes</h2>
          <Link to="/recipes" className="grocio-section__link">
            See all
          </Link>
        </div>
        <div className="grocio-quick-grid">
          {QUICK_RECIPES.map((r) => (
            <Link key={r.title} to="/recipes" className="grocio-quick-tile">
              <div className="grocio-quick-tile__img" style={{ backgroundImage: `url(${r.img})` }} />
              <div className="grocio-quick-tile__text">
                <span className="grocio-quick-tile__name">{r.title}</span>
                <span className="grocio-quick-tile__time">{r.time}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="grocio-section">
        <div className="grocio-section__head">
          <h2 className="grocio-section__title">Fresh from your fridge</h2>
        </div>
        <div className="grocio-fresh-scroll">
          {FRIDGE_FRESH.map((item) => (
            <div key={item.name} className="grocio-fresh-card">
              <div className="grocio-fresh-card__img" style={{ backgroundImage: `url(${item.img})` }} />
              <div className="grocio-fresh-card__body">
                <strong>{item.name}</strong>
                <span className="grocio-fresh-card__kcal">{item.kcal}</span>
                <span className="grocio-tag grocio-tag--mint">{item.tag}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grocio-budget grocio-budget--soft">
        <div className="grocio-budget__text">
          Weekly budget <strong>$210</strong>
          <span className="grocio-budget__target">Target $200</span>
        </div>
        <div className="grocio-budget__bar">
          <div className="grocio-budget__fill" style={{ width: '92%' }} />
        </div>
      </section>

      {createOpen && (
        <div className="cookpal-modal-backdrop" role="presentation" onClick={closeCreate}>
          <div
            className="cookpal-modal cookpal-panel"
            role="dialog"
            aria-labelledby="cookpal-create-recipe-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="cookpal-create-recipe-title" className="cookpal-subtitle" style={{ marginTop: 0 }}>
              New recipe
            </h2>
            <label className="cookpal-modal__label" htmlFor="cookpal-recipe-title">
              Title
            </label>
            <input
              id="cookpal-recipe-title"
              className="cookpal-modal__input"
              value={recipeTitle}
              onChange={(e) => setRecipeTitle(e.target.value)}
              placeholder="e.g. Sunday roast"
            />
            <label className="cookpal-modal__label" htmlFor="cookpal-recipe-time">
              Time
            </label>
            <input
              id="cookpal-recipe-time"
              className="cookpal-modal__input"
              value={recipeTime}
              onChange={(e) => setRecipeTime(e.target.value)}
              placeholder="30 min"
            />
            <label className="cookpal-modal__label" htmlFor="cookpal-recipe-cat">
              Categories
            </label>
            <input
              id="cookpal-recipe-cat"
              className="cookpal-modal__input"
              value={recipeCategories}
              onChange={(e) => setRecipeCategories(e.target.value)}
              placeholder="Dinner, Comfort…"
            />
            <label className="cookpal-modal__label" htmlFor="cookpal-recipe-img">
              Image URL (optional)
            </label>
            <input
              id="cookpal-recipe-img"
              className="cookpal-modal__input"
              value={recipeImage}
              onChange={(e) => setRecipeImage(e.target.value)}
              placeholder="https://…"
            />
            <div className="cookpal-modal__actions">
              <button type="button" className="cookpal-modal__btn cookpal-modal__btn--ghost" onClick={closeCreate}>
                Cancel
              </button>
              <button type="button" className="cookpal-modal__btn cookpal-modal__btn--primary" onClick={submitRecipe}>
                Save recipe
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
