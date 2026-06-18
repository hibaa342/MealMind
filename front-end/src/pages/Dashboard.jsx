import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, useOutletContext, Link } from 'react-router-dom'
import { addUserRecipe } from '../utils/userRecipes'
import './Dashboard.css'

import imgKitchenDecor from '../assets/images/kitchen-decor.jpg'
import imgVeggieStirfry from '../assets/images/veggie-stirfry.jpg'
import imgTacoSalad from '../assets/images/taco-salad.jpg'
import imgTomatoSoup from '../assets/images/tomato-soup.jpg'
import imgFreshEggs from '../assets/images/fresh-eggs.jpg'
import imgFreshSpinach from '../assets/images/fresh-spinach.jpg'
import imgChickenBreast from '../assets/images/chicken-breast.jpg'
import imgGreekYogurt from '../assets/images/greek-yogurt.jpg'
import imgCheddarCheese from '../assets/images/cheddar-cheese.jpg'
import imgBellPeppers from '../assets/images/bell-peppers.jpg'
import imgSalad from '../assets/images/salad_1777065578678.png'

const QUICK_RECIPES = [
  { title: 'Taco salad bowl', time: '15 min', img: imgTacoSalad },
  { title: 'Tomato soup', time: '25 min', img: imgTomatoSoup },
  { title: 'Veggie stir fry', time: '20 min', img: imgVeggieStirfry },
  { title: 'Garden salad', time: '10 min', img: imgSalad },
]

/** Placeholder inventory until AI detection is wired up */
const FRIDGE_INVENTORY = [
  { id: 'eggs', name: 'Organic Eggs', quantity: '8 eggs', daysLeft: 5, img: imgFreshEggs },
  { id: 'spinach', name: 'Baby Spinach', quantity: '200g', daysLeft: 4, img: imgFreshSpinach },
  { id: 'chicken', name: 'Chicken Breast', quantity: '450g', daysLeft: 3, img: imgChickenBreast },
  { id: 'yogurt', name: 'Greek Yogurt', quantity: '500ml', daysLeft: 2, img: imgGreekYogurt },
  { id: 'cheese', name: 'Cheddar Cheese', quantity: '120g', daysLeft: 1, img: imgCheddarCheese },
  { id: 'peppers', name: 'Bell Peppers', quantity: '3 peppers', daysLeft: 5, img: imgBellPeppers },
]

function daysLeftLabel(days) {
  if (days <= 0) return 'Use today'
  if (days === 1) return '1 day left'
  return `${days} days left`
}

const Dashboard = () => {
  const navigate = useNavigate()
  const { voice } = useOutletContext() || {}

  const [createOpen, setCreateOpen] = useState(false)
  const [recipeTitle, setRecipeTitle] = useState('')
  const [recipeTime, setRecipeTime] = useState('30 min')
  const [recipeCategories, setRecipeCategories] = useState('')
  const [recipeImage, setRecipeImage] = useState(imgTacoSalad)

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [isSearching, setIsSearching] = useState(false)
  const [selectedMeal, setSelectedMeal] = useState(null)

  const [fridgeItems] = useState(FRIDGE_INVENTORY)

  const isRecording = Boolean(voice?.isRecording)
  const isTranscribing = Boolean(voice?.isTranscribing)
  const voiceNote = voice?.voiceNote
  const transcription = voice?.transcription ?? ''
  const micBusy = isRecording || isTranscribing
  const [voiceError, setVoiceError] = useState(null)

  const handleMicClick = () => {
    if (!voice?.toggleRecording) {
      setVoiceError('Voice search is unavailable. Refresh the page or use Chrome/Edge.')
      return
    }
    setVoiceError(null)
    voice.toggleRecording()
  }

  // Keep search field in sync with speech / Whisper output (live + final)
  useEffect(() => {
    const text = transcription?.trim()
    if (text) setSearchQuery(text)
  }, [transcription])

  useEffect(() => {
    if (!isRecording && !isTranscribing && transcription?.trim()) {
      setSearchQuery(transcription.trim())
    }
  }, [isRecording, isTranscribing, transcription])

  const searchInputValue =
    isRecording || isTranscribing
      ? transcription || searchQuery
      : searchQuery

  const closeCreate = useCallback(() => {
    setCreateOpen(false)
    setRecipeTitle('')
    setRecipeTime('30 min')
    setRecipeCategories('')
    setRecipeImage(imgTacoSalad)
  }, [])

  useEffect(() => {
    if (!createOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') closeCreate()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [createOpen, closeCreate])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null)
      return
    }

    const delayDebounceFn = setTimeout(() => {
      setIsSearching(true)
      fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${searchQuery}`)
        .then((res) => res.json())
        .then((data) => {
          setSearchResults(data.meals || [])
          setIsSearching(false)
        })
        .catch((err) => {
          console.error('Search error:', err)
          setSearchResults([])
          setIsSearching(false)
        })
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery])

  const submitRecipe = () => {
    const title = recipeTitle.trim()
    if (!title) return
    addUserRecipe({
      title,
      time: recipeTime.trim() || '30 min',
      categories: recipeCategories.trim() || 'My recipes',
      rating: 4,
      tags: ['Home'],
      image: typeof recipeImage === 'string' ? recipeImage : imgTacoSalad,
      accent: 'green',
    })
    closeCreate()
    navigate('/recipes')
  }

  const showDashboardContent = !searchQuery.trim()

  return (
    <div className="snapcook-dashboard">
      <div className="snapcook-dashboard__search-row">
        <div className="cookpal-search snapcook-dashboard__search">
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
            value={searchInputValue}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            type="button"
            className={`cookpal-search__mic ${micBusy ? 'cookpal-search__mic--recording' : ''}`}
            onClick={handleMicClick}
            disabled={isTranscribing}
            aria-label={
              isTranscribing
                ? 'Transcription in progress'
                : isRecording
                  ? 'Stop and transcribe'
                  : 'Dictate a search'
            }
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          </button>
        </div>
        <button type="button" className="snapcook-dashboard__recipe-btn" onClick={() => setCreateOpen(true)}>
          + Recipe
        </button>
      </div>

      {(voiceNote || voiceError) && (
        <p className="cookpal-voice-hint" role="status" style={{ marginBottom: 14 }}>
          {voiceError || voiceNote}
        </p>
      )}

      {searchQuery.trim() && (
        <section className="snapcook-section">
          <div className="snapcook-section__head">
            <h2 className="snapcook-section__title">
              {isSearching ? 'Searching…' : `Search results for "${searchQuery}"`}
            </h2>
          </div>
          <div className="snapcook-quick-grid">
            {searchResults && searchResults.length === 0 && !isSearching && <p>No recipes found.</p>}
            {searchResults &&
              searchResults.map((meal) => (
                <button
                  key={meal.idMeal}
                  type="button"
                  onClick={() => setSelectedMeal(meal)}
                  className="snapcook-quick-card cookpal-recipe-select-btn"
                  style={{ border: 'none', cursor: 'pointer' }}
                >
                  <img
                    src={`${meal.strMealThumb}/preview`}
                    alt=""
                    className="snapcook-quick-card__img"
                  />
                  <span className="snapcook-quick-card__name">{meal.strMeal}</span>
                  <span className="snapcook-quick-card__time">{meal.strArea}</span>
                </button>
              ))}
          </div>
        </section>
      )}

      {showDashboardContent && (
        <>
          <section className="snapcook-hero" aria-label="Live inventory">
            <div className="snapcook-hero__content">
              <span className="snapcook-hero__badge">Live inventory</span>
              <h2 className="snapcook-hero__title">What&apos;s in your fridge</h2>
              <p className="snapcook-hero__sub">Tap scanner to update stock and cut waste.</p>
              <Link to="/scanner" className="snapcook-hero__cta">
                Open scanner
              </Link>
            </div>
            <div className="snapcook-hero__art" aria-hidden>
              <img src={imgKitchenDecor} alt="" />
            </div>
          </section>

          <Link to="/recipes" className="snapcook-featured">
            <img src={imgVeggieStirfry} alt="" className="snapcook-featured__thumb" />
            <div className="snapcook-featured__body">
              <h3 className="snapcook-featured__title">Veggie stir fry</h3>
              <div className="snapcook-featured__meta">
                <span className="snapcook-featured__kcal">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <path d="M12 2c1 4 4 6 4 10a4 4 0 0 1-8 0c0-4 3-6 4-10z" />
                  </svg>
                  270 kcal
                </span>
                <span className="snapcook-pill">Healthy</span>
                <span className="snapcook-pill">Low fat</span>
              </div>
              <p className="snapcook-featured__foot">8 ingredients · matches your fridge</p>
            </div>
          </Link>

          <section className="snapcook-section">
            <div className="snapcook-section__head">
              <h2 className="snapcook-section__title">Quick recipes</h2>
              <Link to="/recipes" className="snapcook-section__link">
                See all
              </Link>
            </div>
            <div className="snapcook-quick-grid">
              {QUICK_RECIPES.map((r, i) => (
                <Link key={`${r.title}-${i}`} to="/recipes" className="snapcook-quick-card">
                  <img src={r.img} alt="" className="snapcook-quick-card__img" />
                  <span className="snapcook-quick-card__name">{r.title}</span>
                  <span className="snapcook-quick-card__time">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 7v5l3 2" />
                    </svg>
                    {r.time}
                  </span>
                </Link>
              ))}
            </div>
          </section>

          <section className="snapcook-section">
            <div className="snapcook-section__head">
              <h2 className="snapcook-section__title">Fresh from your fridge</h2>
              <Link to="/scanner" className="snapcook-section__link">
                Scan again
              </Link>
            </div>
            <div className="snapcook-fridge-panel" role="list" aria-label="Detected ingredients">
              {fridgeItems.length === 0 ? (
                <p className="snapcook-fridge-empty">
                  No ingredients yet. Use the scanner to detect what&apos;s in your fridge.
                </p>
              ) : (
                fridgeItems.map((item) => (
                  <div key={item.id} className="snapcook-fridge-item" role="listitem">
                    <img src={item.img} alt="" className="snapcook-fridge-item__thumb" />
                    <div className="snapcook-fridge-item__info">
                      <span className="snapcook-fridge-item__name">{item.name}</span>
                      <span className="snapcook-fridge-item__qty">{item.quantity}</span>
                    </div>
                    <span
                      className={`snapcook-fridge-item__badge${
                        item.daysLeft <= 1 ? ' snapcook-fridge-item__badge--urgent' : ''
                      }`}
                    >
                      {daysLeftLabel(item.daysLeft)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>
        </>
      )}

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
              value={typeof recipeImage === 'string' ? recipeImage : ''}
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

      {selectedMeal && (
        <div
          className="cookpal-modal-backdrop"
          style={{ zIndex: 1000 }}
          role="presentation"
          onClick={() => setSelectedMeal(null)}
        >
          <div
            className="cookpal-modal cookpal-panel"
            role="dialog"
            aria-labelledby="cookpal-meal-title"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '600px', maxHeight: '90vh', overflow: 'auto', padding: '24px' }}
          >
            <button
              type="button"
              onClick={() => setSelectedMeal(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
              }}
              aria-label="Close"
            >
              ✕
            </button>
            <h2 id="cookpal-meal-title" className="cookpal-subtitle" style={{ marginTop: 0 }}>
              {selectedMeal.strMeal}
            </h2>
            <img
              src={selectedMeal.strMealThumb}
              alt={selectedMeal.strMeal}
              style={{ width: '100%', height: '280px', objectFit: 'cover', borderRadius: '6px', marginBottom: '16px' }}
            />
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ marginBottom: 8 }}>Ingredients</h3>
              <ul style={{ marginLeft: '20px', marginTop: 0 }}>
                {Array.from({ length: 20 }).map((_, i) => {
                  const ing = selectedMeal[`strIngredient${i + 1}`]
                  const measure = selectedMeal[`strMeasure${i + 1}`]
                  if (ing && ing.trim()) {
                    return (
                      <li key={i} style={{ marginBottom: 6 }}>
                        {measure} {ing}
                      </li>
                    )
                  }
                  return null
                })}
              </ul>
            </div>
            <div>
              <h3 style={{ marginBottom: 8 }}>Instructions</h3>
              <p style={{ whiteSpace: 'pre-line', lineHeight: '1.6' }}>{selectedMeal.strInstructions}</p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedMeal(null)}
              className="cookpal-modal__btn cookpal-modal__btn--primary"
              style={{ marginTop: '20px', width: '100%' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
