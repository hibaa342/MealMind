import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useOutletContext, Link } from 'react-router-dom'
import {
  getScannedIngredients,
  getScannedRecipes,
} from '../utils/scannedIngredients'
import { fetchRecipesByIngredients, fetchMealDetail } from '../api/recipes'
import './Dashboard.css'

import imgKitchenDecor from '../assets/images/kitchen-decor.jpg'

const CATEGORIES = [
  'Beef', 'Chicken', 'Seafood', 'Breakfast', 'Vegetarian',
  'Pasta', 'Dessert', 'Side', 'Lamb', 'Pork', 'Vegan', 'Miscellaneous',
]

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
// Fresh-from-fridge recipe card
// ---------------------------------------------------------------------------
function FridgeRecipeCard({ recipe, onClick }) {
  return (
    <button
      type="button"
      className="snapcook-quick-card cookpal-recipe-select-btn"
      style={{ border: 'none', cursor: 'pointer', textAlign: 'left' }}
      onClick={() => onClick(recipe)}
    >
      <img src={recipe.image} alt="" className="snapcook-quick-card__img" />
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
function FreshFromFridge() {
  const navigate = useNavigate()
  const [ingredients, setIngredients] = useState(() => getScannedIngredients())
  const [recipes, setRecipes] = useState(() => getScannedRecipes())
  const [loading, setLoading] = useState(false)
  const [selectedRecipe, setSelectedRecipe] = useState(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const lastKeyRef = useRef(null)

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
    if (cached.length > 0) { setRecipes(cached); return }
    if (names.length === 0) { setRecipes([]); return }
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

  const getDropdownLabel = () => {
    if (ingredients.length === 0) return '0 Ingredients'
    const firstTwo = ingredients.slice(0, 2).map(i => i.charAt(0).toUpperCase() + i.slice(1))
    const remaining = ingredients.length - 2
    return remaining > 0 ? `${firstTwo.join(', ')} +${remaining} ▼` : `${firstTwo.join(', ')} ▼`
  }

  return (
    <>
      <section className="snapcook-section">
        <div className="snapcook-section__head">
          <h2 className="snapcook-section__title">Fresh from your fridge</h2>
          <Link to="/scanner" className="snapcook-section__link">Scan again</Link>
        </div>

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

        {!hasIngredients && !loading && (
          <div className="snapcook-fridge-panel">
            <p className="snapcook-fridge-empty">
              No fridge scan yet.{' '}
              <Link to="/scanner" style={{ color: '#2d6a4f', fontWeight: 600 }}>Open the scanner</Link>{' '}
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
              <Link to="/scanner" style={{ color: '#2d6a4f', fontWeight: 600 }}>scanning again</Link>.
            </p>
          </div>
        )}

        {!loading && hasRecipes && (
          <>
            <div className="snapcook-quick-grid">
              {recipes.slice(0, 4).map((recipe) => (
                <FridgeRecipeCard key={recipe.id} recipe={recipe} onClick={setSelectedRecipe} />
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
// Ingredient row for the create form
// ---------------------------------------------------------------------------
function IngredientRow({ ingredient, index, onChange, onRemove }) {
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
      <input
        className="cookpal-modal__input"
        style={{ flex: '0 0 120px', marginBottom: 0 }}
        placeholder="Amount"
        value={ingredient.amount}
        onChange={(e) => onChange(index, 'amount', e.target.value)}
      />
      <input
        className="cookpal-modal__input"
        style={{ flex: 1, marginBottom: 0 }}
        placeholder="Ingredient name"
        value={ingredient.name}
        onChange={(e) => onChange(index, 'name', e.target.value)}
      />
      <button
        type="button"
        onClick={() => onRemove(index)}
        aria-label="Remove ingredient"
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#b42343', fontSize: '1.1rem', padding: '4px 8px', flexShrink: 0,
        }}
      >
        ✕
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Dashboard
// ---------------------------------------------------------------------------
const Dashboard = () => {
  const navigate = useNavigate()
  const { voice } = useOutletContext() || {}

  // ── Create recipe modal state ──────────────────────────────────────────────
  const [createOpen, setCreateOpen] = useState(false)
  const [recipeTitle, setRecipeTitle] = useState('')
  const [recipeDescription, setRecipeDescription] = useState('')
  const [recipeTime, setRecipeTime] = useState('30 min')
  const [recipeCategory, setRecipeCategory] = useState('')
  const [recipeInstructions, setRecipeInstructions] = useState('')
  const [recipeRating, setRecipeRating] = useState('')
  const [recipeTags, setRecipeTags] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [ingredients, setIngredients] = useState([{ amount: '', name: '' }])
  const [submitLoading, setSubmitLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState(false)

  // ── Search state ───────────────────────────────────────────────────────────
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
    isRecording || isTranscribing ? transcription || searchQuery : searchQuery

  // ── Reset create form ──────────────────────────────────────────────────────
  const closeCreate = useCallback(() => {
    setCreateOpen(false)
    setRecipeTitle('')
    setRecipeDescription('')
    setRecipeTime('30 min')
    setRecipeCategory('')
    setRecipeInstructions('')
    setRecipeRating('')
    setRecipeTags('')
    setImageFile(null)
    setImagePreview(null)
    setIngredients([{ amount: '', name: '' }])
    setSubmitError('')
    setSubmitSuccess(false)
    setSubmitLoading(false)
  }, [])

  useEffect(() => {
    if (!createOpen) return
    const onKey = (e) => { if (e.key === 'Escape') closeCreate() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [createOpen, closeCreate])

  // ── Search ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults(null); return }
    const delay = setTimeout(() => {
      setIsSearching(true)
      fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${searchQuery}`)
        .then((res) => res.json())
        .then((data) => { setSearchResults(data.meals || []); setIsSearching(false) })
        .catch(() => { setSearchResults([]); setIsSearching(false) })
    }, 500)
    return () => clearTimeout(delay)
  }, [searchQuery])

  // ── Image file selection ───────────────────────────────────────────────────
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setImagePreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  // ── Ingredients list helpers ───────────────────────────────────────────────
  const handleIngredientChange = (index, field, value) => {
    setIngredients((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    )
  }
  const addIngredient = () => setIngredients((prev) => [...prev, { amount: '', name: '' }])
  const removeIngredient = (index) =>
    setIngredients((prev) => prev.filter((_, i) => i !== index))

  // ── Submit to backend ──────────────────────────────────────────────────────
  const submitRecipe = async () => {
    const title = recipeTitle.trim()
    if (!title) { setSubmitError('Please enter a recipe title.'); return }
    if (!recipeCategory) { setSubmitError('Please select a category.'); return }
    if (!imageFile) { setSubmitError('Please select an image for the recipe.'); return }

    setSubmitLoading(true)
    setSubmitError('')

    try {
      const token = localStorage.getItem('token')
      const formData = new FormData()
      formData.append('title', title)
      formData.append('description', recipeDescription.trim())
      formData.append('time', recipeTime.trim() || '30 min')
      formData.append('categories', recipeCategory)
      formData.append('instructions', recipeInstructions.trim())
      formData.append('rating', recipeRating ? String(recipeRating) : '0')
      formData.append('tags', recipeTags.trim())
      formData.append('accent', 'green')
      formData.append(
        'ingredients',
        JSON.stringify(ingredients.filter((ing) => ing.name.trim()))
      )
      formData.append('image', imageFile)

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products`, {
        method: 'POST',
        headers: { 'x-auth-token': token },
        body: formData,
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || `Server error (${res.status})`)
      }

      setSubmitSuccess(true)
    } catch (err) {
      setSubmitError(err.message || 'Could not save the recipe. Please try again.')
    } finally {
      setSubmitLoading(false)
    }
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
              isTranscribing ? 'Transcription in progress'
                : isRecording ? 'Stop and transcribe'
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
        <button
          type="button"
          className="snapcook-dashboard__recipe-btn"
          onClick={() => setCreateOpen(true)}
        >
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
            {searchResults && searchResults.length === 0 && !isSearching && (
              <p>No recipes found.</p>
            )}
            {searchResults && searchResults.map((meal) => (
              <button
                key={meal.idMeal}
                type="button"
                onClick={() => setSelectedMeal(meal)}
                className="snapcook-quick-card cookpal-recipe-select-btn"
                style={{ border: 'none', cursor: 'pointer' }}
              >
                <img src={`${meal.strMealThumb}/preview`} alt="" className="snapcook-quick-card__img" />
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
              <Link to="/scanner" className="snapcook-hero__cta">Open scanner</Link>
            </div>
            <div className="snapcook-hero__art" aria-hidden>
              <img src={imgKitchenDecor} alt="" />
            </div>
          </section>
          <FreshFromFridge />
        </>
      )}

      {/* ── Create Recipe Modal ─────────────────────────────────────────── */}
      {createOpen && (
        <div className="cookpal-modal-backdrop" role="presentation" onClick={closeCreate}>
          <div
            className="cookpal-modal cookpal-panel"
            role="dialog"
            aria-labelledby="cookpal-create-recipe-title"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 620, maxHeight: '92vh', overflowY: 'auto' }}
          >
            <h2 id="cookpal-create-recipe-title" className="cookpal-subtitle" style={{ marginTop: 0 }}>
              Share a Recipe
            </h2>
            <p style={{ fontSize: '0.83rem', color: '#79877f', marginTop: -8, marginBottom: 20 }}>
              Your recipe will be reviewed by an admin before appearing in the catalog.
            </p>

            {submitSuccess ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <p style={{ fontSize: '2rem', marginBottom: 12 }}>✅</p>
                <h3 style={{ color: '#2d6a4f', marginBottom: 8 }}>Recipe submitted!</h3>
                <p style={{ color: '#5c7068', marginBottom: 24, fontSize: '0.9rem' }}>
                  It is now pending admin review. Once approved, it will appear in the Recipes catalog.
                </p>
                <button
                  type="button"
                  className="cookpal-modal__btn cookpal-modal__btn--primary"
                  onClick={closeCreate}
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                {/* Title */}
                <label className="cookpal-modal__label" htmlFor="cp-title">Title *</label>
                <input
                  id="cp-title"
                  className="cookpal-modal__input"
                  value={recipeTitle}
                  onChange={(e) => setRecipeTitle(e.target.value)}
                  placeholder="e.g. Sunday Roast Chicken"
                />

                {/* Description */}
                <label className="cookpal-modal__label" htmlFor="cp-desc">Description</label>
                <textarea
                  id="cp-desc"
                  className="cookpal-modal__input"
                  value={recipeDescription}
                  onChange={(e) => setRecipeDescription(e.target.value)}
                  placeholder="A short description of the dish…"
                  rows={2}
                  style={{ resize: 'vertical' }}
                />

                {/* Time + Category row */}
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <label className="cookpal-modal__label" htmlFor="cp-time">Cooking Time *</label>
                    <input
                      id="cp-time"
                      className="cookpal-modal__input"
                      value={recipeTime}
                      onChange={(e) => setRecipeTime(e.target.value)}
                      placeholder="e.g. 45 min"
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="cookpal-modal__label" htmlFor="cp-cat">Category *</label>
                    <select
                      id="cp-cat"
                      className="cookpal-modal__input"
                      value={recipeCategory}
                      onChange={(e) => setRecipeCategory(e.target.value)}
                      style={{ cursor: 'pointer' }}
                    >
                      <option value="">Select…</option>
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Image upload */}
                <label className="cookpal-modal__label">Recipe Image *</label>
                <div
                  style={{
                    border: '2px dashed #b7d5c4',
                    borderRadius: 10,
                    padding: '16px',
                    textAlign: 'center',
                    marginBottom: 16,
                    background: imagePreview ? 'transparent' : '#f6fbf8',
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                  onClick={() => document.getElementById('cp-img-upload').click()}
                >
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{ width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 8 }}
                    />
                  ) : (
                    <p style={{ color: '#79877f', margin: 0, fontSize: '0.88rem' }}>
                      📷 Click to select an image
                    </p>
                  )}
                  <input
                    id="cp-img-upload"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleImageChange}
                  />
                </div>
                {imageFile && (
                  <p style={{ fontSize: '0.78rem', color: '#2d6a4f', marginTop: -10, marginBottom: 12 }}>
                    ✓ {imageFile.name}
                  </p>
                )}

                {/* Ingredients */}
                <label className="cookpal-modal__label">Ingredients</label>
                {ingredients.map((ing, idx) => (
                  <IngredientRow
                    key={idx}
                    ingredient={ing}
                    index={idx}
                    onChange={handleIngredientChange}
                    onRemove={removeIngredient}
                  />
                ))}
                <button
                  type="button"
                  onClick={addIngredient}
                  style={{
                    background: 'none', border: '1.5px dashed #b7d5c4',
                    borderRadius: 8, padding: '6px 14px', cursor: 'pointer',
                    color: '#2d6a4f', fontSize: '0.85rem', marginBottom: 16, width: '100%',
                  }}
                >
                  + Add ingredient
                </button>

                {/* Instructions */}
                <label className="cookpal-modal__label" htmlFor="cp-instructions">Instructions</label>
                <textarea
                  id="cp-instructions"
                  className="cookpal-modal__input"
                  value={recipeInstructions}
                  onChange={(e) => setRecipeInstructions(e.target.value)}
                  placeholder="Step-by-step preparation…"
                  rows={5}
                  style={{ resize: 'vertical' }}
                />

                {/* Rating + Tags row */}
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ flex: '0 0 120px' }}>
                    <label className="cookpal-modal__label" htmlFor="cp-rating">Rating (1–5)</label>
                    <input
                      id="cp-rating"
                      className="cookpal-modal__input"
                      type="number"
                      min="1"
                      max="5"
                      step="0.1"
                      value={recipeRating}
                      onChange={(e) => setRecipeRating(e.target.value)}
                      placeholder="4.5"
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="cookpal-modal__label" htmlFor="cp-tags">Tags (comma-separated)</label>
                    <input
                      id="cp-tags"
                      className="cookpal-modal__input"
                      value={recipeTags}
                      onChange={(e) => setRecipeTags(e.target.value)}
                      placeholder="healthy, quick, oven…"
                    />
                  </div>
                </div>

                {submitError && (
                  <p style={{ color: '#b42343', fontSize: '0.85rem', margin: '8px 0' }}>
                    {submitError}
                  </p>
                )}

                <div className="cookpal-modal__actions">
                  <button
                    type="button"
                    className="cookpal-modal__btn cookpal-modal__btn--ghost"
                    onClick={closeCreate}
                    disabled={submitLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="cookpal-modal__btn cookpal-modal__btn--primary"
                    onClick={submitRecipe}
                    disabled={submitLoading}
                  >
                    {submitLoading ? 'Submitting…' : 'Submit Recipe'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Search result detail modal ──────────────────────────────────── */}
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
                position: 'absolute', top: '16px', right: '16px',
                background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer',
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
