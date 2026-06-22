import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useOutletContext, Link } from 'react-router-dom'
import { addUserRecipe } from '../utils/userRecipes'
import {
  getScannedIngredients,
  getScannedRecipes,
} from '../utils/scannedIngredients'
import { fetchRecipesByIngredients, fetchMealDetail } from '../api/recipes'
import './Dashboard.css'

import imgKitchenDecor from '../assets/images/kitchen-decor.jpg'
import imgTacoSalad from '../assets/images/taco-salad.jpg'

// ---------------------------------------------------------------------------
// Fridge Recipe Detail Modal
// ---------------------------------------------------------------------------
function FridgeRecipeModal({ meal, onClose }) {
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!meal) return
    if (meal.isLocal && meal.localDetail) {
      setDetail(meal.localDetail)
      return
    }
    setLoading(true)
    fetchMealDetail(meal.id)
      .then((d) => setDetail(d))
      .catch(() => setDetail(null))
      .finally(() => setLoading(false))
  }, [meal])

  if (!meal) return null

  const ingredients = detail?.ingredients
    ? detail.ingredients
    : Array.from({ length: 20 }, (_, i) => {
        const name = detail?.[`strIngredient${i + 1}`]
        const measure = detail?.[`strMeasure${i + 1}`]
        return name?.trim() ? { name, measure: measure?.trim() } : null
      }).filter(Boolean)

  return (
    <div
      className="cookpal-modal-backdrop"
      style={{ zIndex: 1000 }}
      role="presentation"
      onClick={onClose}
    >
      <div
        className="cookpal-modal cookpal-panel"
        role="dialog"
        aria-labelledby="dash-fridge-meal-title"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 600, maxHeight: '90vh', overflow: 'auto', padding: 24 }}
      >
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 16,
            background: 'none', border: 'none', fontSize: 24, cursor: 'pointer',
          }}
          aria-label="Close"
        >
          ✕
        </button>

        <h2 id="dash-fridge-meal-title" className="cookpal-subtitle" style={{ marginTop: 0 }}>
          {meal.title}
        </h2>

        <img
          src={meal.image}
          alt={meal.title}
          style={{ width: '100%', height: 260, objectFit: 'cover', borderRadius: 12, marginBottom: 16 }}
        />

        {meal.matchedIngredients?.length > 0 && (
          <p style={{ marginBottom: 14, fontSize: '0.85rem', color: '#2d6a4f', fontWeight: 600 }}>
            ✅ Matches from your fridge: {meal.matchedIngredients.join(', ')}
          </p>
        )}

        {loading && <p style={{ color: '#5c7068' }}>Loading details…</p>}

        {!loading && detail && (
          <>
            <h3 style={{ marginBottom: 8 }}>Ingredients</h3>
            <ul style={{ marginLeft: 20, marginTop: 0, marginBottom: 18 }}>
              {ingredients.map((item, i) => (
                <li key={i} style={{ marginBottom: 5 }}>
                  {item.measure} {item.name}
                </li>
              ))}
            </ul>
            <h3 style={{ marginBottom: 8 }}>Instructions</h3>
            <p style={{ whiteSpace: 'pre-line', lineHeight: 1.65 }}>
              {detail.strInstructions}
            </p>
          </>
        )}

        {!loading && !detail && (
          <p style={{ color: '#5c7068' }}>Recipe details unavailable.</p>
        )}

        <button
          type="button"
          onClick={onClose}
          className="cookpal-modal__btn cookpal-modal__btn--primary"
          style={{ marginTop: 20, width: '100%' }}
        >
          Close
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Fresh‑from‑fridge recipe card (compact, clickable)
// ---------------------------------------------------------------------------
function FridgeRecipeCard({ recipe, onClick }) {
  return (
    <button
      type="button"
      className="snapcook-quick-card cookpal-recipe-select-btn"
      style={{ border: 'none', cursor: 'pointer', textAlign: 'left' }}
      onClick={() => onClick(recipe)}
    >
      <img
        src={recipe.image}
        alt=""
        className="snapcook-quick-card__img"
      />
      <span className="snapcook-quick-card__name">{recipe.title}</span>
      {recipe.matchedIngredients?.length > 0 && (
        <span className="snapcook-quick-card__time" style={{ fontSize: '0.72rem', color: '#2d6a4f' }}>
          {recipe.matchedIngredients.length} ingredient{recipe.matchedIngredients.length !== 1 ? 's' : ''} matched
        </span>
      )}
    </button>
  )
}

// ---------------------------------------------------------------------------
// "Fresh from your fridge" section
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// "Fresh from your fridge" section (with dropdown list)
// ---------------------------------------------------------------------------
function FreshFromFridge() {
  const navigate = useNavigate()
  const [ingredients, setIngredients] = useState(() => getScannedIngredients())
  const [recipes, setRecipes] = useState(() => getScannedRecipes())
  const [loading, setLoading] = useState(false)
  const [selectedRecipe, setSelectedRecipe] = useState(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  
  const dropdownRef = useRef(null)
  const lastKeyRef = useRef(null)

  // Auto-close dropdown when clicking anywhere outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadFridgeRecipes = useCallback(async (names) => {
    const key = [...names].sort().join('|')
    if (key === lastKeyRef.current) return
    lastKeyRef.current = key
    const cached = getScannedRecipes(names)
    if (cached.length > 0) {
      setRecipes(cached)
      return
    }
    if (names.length === 0) {
      setRecipes([])
      return
    }
    setLoading(true)
    try {
      const { recipes: fetched } = await fetchRecipesByIngredients(names)
      setRecipes(fetched)
    } catch {
      setRecipes([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const handleScanUpdate = () => {
      const newIngredients = getScannedIngredients()
      setIngredients(newIngredients)
      lastKeyRef.current = null
      setRecipes([])
      loadFridgeRecipes(newIngredients)
    }
    window.addEventListener('mealmind-scan-updated', handleScanUpdate)
    loadFridgeRecipes(ingredients)
    return () => window.removeEventListener('mealmind-scan-updated', handleScanUpdate)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const hasIngredients = ingredients.length > 0
  const hasRecipes = recipes.length > 0

  // Label helper logic: "Pepper, Egg +2 ▼"
  const getDropdownLabel = () => {
    if (ingredients.length === 0) return "0 Ingredients"
    const firstTwo = ingredients.slice(0, 2).map(i => i.charAt(0).toUpperCase() + i.slice(1))
    const remaining = ingredients.length - 2
    return remaining > 0 
      ? `${firstTwo.join(', ')} +${remaining} ▼`
      : `${firstTwo.join(', ')} ▼`
  }

  return (
    <>
      <section className="snapcook-section">
        <div className="snapcook-section__head">
          <h2 className="snapcook-section__title">Fresh from your fridge</h2>
          <Link to="/scanner" className="snapcook-section__link">
            Scan again
          </Link>
        </div>

        {/* --- Dropdown Container --- */}
        {hasIngredients && (
          <div className="dash-fridge-dropdown-container" ref={dropdownRef}>
            <button 
              type="button" 
              className="dash-fridge-dropdown-btn"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              aria-expanded={dropdownOpen}
            >
              🥬 {getDropdownLabel()}
            </button>

            {dropdownOpen && (
              <div className="dash-fridge-dropdown-menu">
                {ingredients.map((name) => (
                  <div key={name} className="dash-fridge-dropdown-item">
                    <span className="dash-fridge-dot">🟢</span>
                    <span className="dash-fridge-item-name">{name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* States */}
        {!hasIngredients && !loading && (
          <div className="snapcook-fridge-panel">
            <p className="snapcook-fridge-empty">
              No fridge scan yet.{' '}
              <Link to="/scanner" style={{ color: '#2d6a4f', fontWeight: 600 }}>
                Open the scanner
              </Link>{' '}
              to detect ingredients.
            </p>
          </div>
        )}

        {loading && (
          <div className="snapcook-fridge-panel">
            <p className="snapcook-fridge-empty">
              <span className="dash-fridge-spinner" aria-hidden /> Finding recipes…
            </p>
          </div>
        )}

        {!loading && hasIngredients && !hasRecipes && (
          <div className="snapcook-fridge-panel" style={{ marginTop: '14px' }}>
            <p className="snapcook-fridge-empty">
              No matching recipes. Try{' '}
              <Link to="/scanner" style={{ color: '#2d6a4f', fontWeight: 600 }}>
                scanning again
              </Link>.
            </p>
          </div>
        )}

        {!loading && hasRecipes && (
          <>
            <div className="snapcook-quick-grid">
              {recipes.slice(0, 4).map((recipe) => (
                <FridgeRecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onClick={setSelectedRecipe}
                />
              ))}
            </div>
            {recipes.length > 4 && (
              <button
                type="button"
                className="snapcook-section__link dash-fridge-see-more"
                onClick={() => navigate('/scanner')}
              >
                See all {recipes.length} suggestions →
              </button>
            )}
          </>
        )}
      </section>
      <FridgeRecipeModal meal={selectedRecipe} onClose={() => setSelectedRecipe(null)} />
    </>
  )
}
// ---------------------------------------------------------------------------
// Main Dashboard
// ---------------------------------------------------------------------------
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

          {/* Dynamic fridge-based recipe recommendations */}
          <FreshFromFridge />
        </>
      )}

      {/* Create Recipe Modal */}
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

      {/* Search result detail modal */}
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
