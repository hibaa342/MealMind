import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import RecipeCard from '../components/RecipeCard'
import { getUserRecipes } from '../utils/userRecipes'
import { fetchRecipesByIngredients, fetchRecipeDetail } from '../api/recipes'
import { getScannedIngredients, saveScannedRecipes } from '../utils/scannedIngredients'
import MissingIngredientsPanel from '../components/MissingIngredientsPanel'
import './Recipes.css'

// ── Color accent cycling ──────────────────────────────────────────────────────
const ACCENT_COLORS = ['green', 'orange', 'pink', 'yellow', 'purple']
const getAccentColor = (index) => ACCENT_COLORS[index % ACCENT_COLORS.length]

// ── Per-category metadata ─────────────────────────────────────────────────────
const CATEGORY_META = {
  Beef:       { difficulty: 'Medium', calories: '520 kcal', time: '45 min' },
  Chicken:    { difficulty: 'Easy',   calories: '380 kcal', time: '35 min' },
  Seafood:    { difficulty: 'Medium', calories: '310 kcal', time: '25 min' },
  Breakfast:  { difficulty: 'Easy',   calories: '290 kcal', time: '15 min' },
  Vegetarian: { difficulty: 'Easy',   calories: '240 kcal', time: '30 min' },
  Pasta:      { difficulty: 'Easy',   calories: '420 kcal', time: '25 min' },
  Dessert:    { difficulty: 'Hard',   calories: '460 kcal', time: '50 min' },
  Side:       { difficulty: 'Easy',   calories: '180 kcal', time: '20 min' },
  Lamb:       { difficulty: 'Hard',   calories: '490 kcal', time: '60 min' },
  Pork:       { difficulty: 'Medium', calories: '430 kcal', time: '40 min' },
  Vegan:      { difficulty: 'Easy',   calories: '220 kcal', time: '25 min' },
  Goat:       { difficulty: 'Hard',   calories: '410 kcal', time: '55 min' },
}

const CATEGORIES = [
  'Beef', 'Chicken', 'Seafood', 'Breakfast',
  'Vegetarian', 'Pasta', 'Dessert', 'Side',
  'Lamb', 'Pork', 'Vegan', 'Goat',
  'Miscellaneous', 'Starter',
]
const PER_CATEGORY = 20

// ── Deterministic rating from meal ID ────────────────────────────────────────
// Produces a stable number in [4.0, 4.9] for any given ID string.
// The same meal always gets the same rating; no Math.random() involved.
function deterministicRating(id) {
  const str = String(id)
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0
  }
  return parseFloat((4.0 + (hash % 10) * 0.09).toFixed(1))
}

// ── Module-level catalog cache ────────────────────────────────────────────────
// Lives outside the component so it survives navigation (component unmount/remount).
// Populated on first load; reused on every subsequent visit during the same session.
let catalogCache = null
let catalogFetchPromise = null

const fetchCatalog = async () => {
  // If already cached, return immediately — zero network requests
  if (catalogCache) return catalogCache

  // If a fetch is already in flight (e.g. two components mounting simultaneously),
  // wait for the same promise instead of firing duplicate requests
  if (catalogFetchPromise) return catalogFetchPromise

  catalogFetchPromise = (async () => {
    const recipes = []
    const fetchedIds = new Set()

    for (const category of CATEGORIES) {
      try {
        const res = await fetch(
          `https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`
        )
        const data = await res.json()

        if (data.meals) {
          // Sort by meal ID (stable, deterministic) instead of random shuffle
          const sorted = [...data.meals].sort((a, b) =>
            a.idMeal.localeCompare(b.idMeal)
          )

          const meta = CATEGORY_META[category] || {
            difficulty: 'Medium',
            calories: 'N/A',
            time: '30 min',
          }

          let taken = 0
          for (const meal of sorted) {
            if (taken >= PER_CATEGORY) break
            if (fetchedIds.has(meal.idMeal)) continue

            recipes.push({
              id: meal.idMeal,
              title: meal.strMeal,
              image: meal.strMealThumb,
              time: meta.time,
              categories: category,
              category,
              difficulty: meta.difficulty,
              calories: meta.calories,
              // Deterministic rating — same value every time for this meal ID
              rating: deterministicRating(meal.idMeal),
              accent: getAccentColor(recipes.length),
            })
            fetchedIds.add(meal.idMeal)
            taken++
          }
        }
      } catch (err) {
        console.error(`Failed to fetch ${category} meals:`, err)
        // Continue with remaining categories; don't abort the whole catalog
      }
    }

    catalogCache = recipes
    catalogFetchPromise = null
    return recipes
  })()

  return catalogFetchPromise
}

// ── Component ─────────────────────────────────────────────────────────────────
const Recipes = () => {
  const location = useLocation()

  // Base catalog — loaded once, cached for the session
  const [recipes, setRecipes] = useState(() => catalogCache || [])
  const [loading, setLoading] = useState(() => !catalogCache)

  // AI scan recommendations
  const [scanRecipes, setScanRecipes] = useState([])
  const [scanIngredients, setScanIngredients] = useState(() => getScannedIngredients())
  const [scanLoading, setScanLoading] = useState(false)

  // User-created recipes (localStorage)
  const [userRecipes, setUserRecipes] = useState(() => getUserRecipes())

  // Favorites
  const [favorites, setFavorites] = useState([])
  const [userId, setUserId] = useState(null)

  // Detail modal
  const [selectedRecipeId, setSelectedRecipeId] = useState(null)
  const [recipeDetail, setRecipeDetail] = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [detailError, setDetailError] = useState('')

  // ── Load base catalog (uses cache after first load) ───────────────────────
  useEffect(() => {
    if (catalogCache) {
      // Already cached — set immediately, no loading state needed
      setRecipes(catalogCache)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)

    fetchCatalog().then((meals) => {
      if (!cancelled) {
        setRecipes(meals)
        setLoading(false)
      }
    }).catch((err) => {
      console.error('Error loading recipe catalog:', err)
      if (!cancelled) setLoading(false)
    })

    return () => { cancelled = true }
  }, [])

  // ── Favorites ─────────────────────────────────────────────────────────────
  const fetchFavorites = async (currentUserId) => {
    if (!currentUserId) return
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/favorites/${currentUserId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      )
      if (res.ok) {
        const data = await res.json()
        setFavorites(data.favorites || data || [])
      }
    } catch (err) {
      console.error('Error fetching favorites:', err)
    }
  }

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser)
        setUserId(user._id)
        if (user._id) fetchFavorites(user._id)
      } catch (err) {
        console.error('Error parsing user from localStorage:', err)
      }
    }
  }, [])

  // ── AI scan suggestions ───────────────────────────────────────────────────
  const refreshScanSuggestions = useCallback(async () => {
    const ingredients = getScannedIngredients()
    setScanIngredients(ingredients)
    if (ingredients.length === 0) {
      setScanRecipes([])
      return
    }
    setScanLoading(true)
    try {
      const { recipes: aiRecipes, needMoreIngredients } = await fetchRecipesByIngredients(ingredients)
      if (needMoreIngredients) {
        setScanRecipes([])
      } else {
        setScanRecipes(aiRecipes)
        saveScannedRecipes(aiRecipes, ingredients)
      }
    } catch (error) {
      console.error('Error loading scan suggestions:', error)
      setScanRecipes([])
    } finally {
      setScanLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshScanSuggestions()
    window.addEventListener('mealmind-scan-updated', refreshScanSuggestions)
    return () => window.removeEventListener('mealmind-scan-updated', refreshScanSuggestions)
  }, [refreshScanSuggestions])

  useEffect(() => {
    if (location.state?.fromScan) refreshScanSuggestions()
  }, [location.state, refreshScanSuggestions])

  // ── User-created recipes ──────────────────────────────────────────────────
  useEffect(() => {
    const sync = () => setUserRecipes(getUserRecipes())
    sync()
    window.addEventListener('cookpal-user-recipes-changed', sync)
    return () => window.removeEventListener('cookpal-user-recipes-changed', sync)
  }, [])

  // ── Combined list for the detail modal lookup ────────────────────────────
  // Scan recipes + full base catalog + user recipes.
  // We keep ALL base catalog recipes here so the modal can look up any of them.
  const allRecipes = useMemo(
    () => [...scanRecipes, ...recipes, ...userRecipes],
    [recipes, scanRecipes, userRecipes]
  )

  // ── "All recipes" grid — base catalog is ALWAYS complete ─────────────────
  // Scan recipes appear in their own section; they do NOT remove entries from
  // the base catalog grid below. User-created recipes are appended at the end.
  const scanIds = useMemo(() => new Set(scanRecipes.map((r) => r.id)), [scanRecipes])

  const catalogGrid = useMemo(
    () => [...recipes, ...userRecipes],
    [recipes, userRecipes]
  )

  // ── Detail modal ──────────────────────────────────────────────────────────
  const selectedRecipe = useMemo(
    () => allRecipes.find((r) => r.id === selectedRecipeId),
    [allRecipes, selectedRecipeId]
  )

  useEffect(() => {
    if (!selectedRecipeId) {
      setRecipeDetail(null)
      setDetailError('')
      return
    }

    const selected = allRecipes.find((r) => r.id === selectedRecipeId)
    if (!selected) {
      setRecipeDetail(null)
      setDetailError('Recipe not found.')
      return
    }

    let cancelled = false

    const loadDetail = async () => {
      setLoadingDetail(true)
      setDetailError('')
      setRecipeDetail(null)
      try {
        const detail = await fetchRecipeDetail(selected)
        if (cancelled) return
        if (detail) {
          setRecipeDetail(detail)
        } else {
          setDetailError('Could not load this recipe from TheMealDB. Try again or pick another meal.')
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Error fetching recipe detail:', error)
          setDetailError('Network error while loading recipe details.')
        }
      } finally {
        if (!cancelled) setLoadingDetail(false)
      }
    }

    loadDetail()
    return () => { cancelled = true }
  }, [selectedRecipeId]) // intentionally omit allRecipes — see note below
  // Note: allRecipes is excluded from the dep array deliberately.
  // Including it would re-fire the detail fetch every time scanRecipes updates,
  // which closes and reopens the modal mid-read. selectedRecipeId changing is
  // the only event that should trigger a new detail fetch.

  // ── Favorites helpers ─────────────────────────────────────────────────────
  const isFavorited = (recipeId) =>
    favorites.some((fav) => String(fav.id) === String(recipeId))

  const handleAddFavorite = async (recipeId, title, image) => {
    if (!userId) { alert('Please log in to add favorites'); return }
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/favorites/add/${userId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ recipeId, title, image }),
        }
      )
      if (res.ok) {
        const data = await res.json()
        setFavorites(data.favorites || [])
      }
    } catch (err) {
      console.error('Error adding favorite:', err)
    }
  }

  const handleRemoveFavorite = async (recipeId) => {
    if (!userId) return
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/favorites/${userId}/${recipeId}`,
        { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
      )
      if (res.ok) {
        const data = await res.json()
        setFavorites(data.favorites || [])
      }
    } catch (err) {
      console.error('Error removing favorite:', err)
    }
  }

  const toggleFavorite = (r) => {
    if (isFavorited(r.id)) {
      handleRemoveFavorite(r.id)
    } else {
      handleAddFavorite(r.id, r.title, r.image)
    }
  }

  // ── Skeleton loader ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="recipes-page">
        <div className="recipes-page__header">
          <div className="recipes-page__utensils" aria-hidden>
            <span /><span /><span /><span />
          </div>
          <h1 className="recipes-page__title">Explore recipes</h1>
          <p className="recipes-page__lead">Discovering delicious meals for you…</p>
        </div>
        <h2 className="recipes-page__section-title">All recipes</h2>
        <div className="recipes-page__grid">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="recipes-page__skeleton">
              <div className="recipes-page__skeleton-img" />
              <div className="recipes-page__skeleton-body">
                <div className="recipes-page__skeleton-line" />
                <div className="recipes-page__skeleton-line recipes-page__skeleton-line--short" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="recipes-page">
      <div className="recipes-page__header">
        <div className="recipes-page__utensils" aria-hidden>
          <span /><span /><span /><span />
        </div>
        <h1 className="recipes-page__title">Explore recipes</h1>
        <p className="recipes-page__lead">Discover dishes that match your tastes.</p>
      </div>

      {/* ── AI scan recommendations — shown above the base catalog ── */}
      {scanIngredients.length > 0 && (
        <section className="recipes-page__scan-section">
          <div className="recipes-page__scan-head">
            <h2 className="recipes-page__scan-title">From your fridge</h2>
            <p className="recipes-page__scan-sub">
              {scanIngredients.length >= 3
                ? `Recipes using at least 3 of: ${scanIngredients.join(', ')}`
                : `${scanIngredients.length} ingredient(s) detected — scan or add at least 3.`}
            </p>
          </div>
          {scanLoading && scanRecipes.length === 0 ? (
            <p className="recipes-page__scan-loading">Loading suggestions…</p>
          ) : scanRecipes.length > 0 ? (
            <div className="recipes-page__grid recipes-page__grid--scan">
              {scanRecipes.map((r) => (
                <div
                  key={`scan-${r.id}`}
                  className="recipes-page__card-wrapper"
                  onClick={() => setSelectedRecipeId(r.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setSelectedRecipeId(r.id)
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Open ${r.title}`}
                >
                  <RecipeCard
                    recipe={r}
                    isFavorited={isFavorited(r.id)}
                    onFavoriteToggle={() => toggleFavorite(r)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="recipes-page__scan-empty">
              No recipe uses at least 3 of these ingredients. Try scanning different items.
            </p>
          )}
        </section>
      )}

      {/* ── Base catalog — always complete, never filtered by scan results ── */}
      <h2 className="recipes-page__section-title">
        All recipes
        {catalogGrid.length > 0 && (
          <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#79877f', marginLeft: '10px' }}>
            {catalogGrid.length} recipes
          </span>
        )}
      </h2>

      <div className="recipes-page__grid">
        {catalogGrid.length > 0 ? (
          catalogGrid.map((r) => (
            <div
              key={r.id}
              className="recipes-page__card-wrapper"
              onClick={() => setSelectedRecipeId(r.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setSelectedRecipeId(r.id)
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={`Open ${r.title}`}
            >
              <RecipeCard
                recipe={r}
                isFavorited={isFavorited(r.id)}
                onFavoriteToggle={() => toggleFavorite(r)}
              />
            </div>
          ))
        ) : (
          <div className="recipes-page__empty">
            <p>No recipes found. Try again later.</p>
          </div>
        )}
      </div>

      {/* ── Detail modal ── */}
      {selectedRecipeId && selectedRecipe && (
        <div className="recipes-page__modal-overlay" onClick={() => setSelectedRecipeId(null)}>
          <section
            className="recipes-page__modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="recipes-page__modal-close"
              onClick={() => setSelectedRecipeId(null)}
              aria-label="Close"
            >
              ✕
            </button>

            <h2 className="recipes-page__modal-title">{selectedRecipe.title}</h2>

            <img
              src={selectedRecipe.image}
              alt={selectedRecipe.title}
              className="recipes-page__modal-image"
            />

            <div className="recipes-page__modal-meta">
              <div className="recipes-page__meta-item">
                <span className="recipes-page__meta-label">⏱️ Time</span>
                <p>{selectedRecipe.time}</p>
              </div>
              <div className="recipes-page__meta-item">
                <span className="recipes-page__meta-label">⭐ Rating</span>
                <p>
                  {selectedRecipe.rating != null
                    ? Number(selectedRecipe.rating).toFixed(1)
                    : 'N/A'}
                  /5
                </p>
              </div>
              <div className="recipes-page__meta-item">
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    toggleFavorite(selectedRecipe)
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    padding: '8px',
                  }}
                  aria-label={
                    isFavorited(selectedRecipeId)
                      ? 'Remove from favorites'
                      : 'Add to favorites'
                  }
                >
                  {isFavorited(selectedRecipeId) ? '❤️' : '🤍'}
                </button>
              </div>
            </div>

            {loadingDetail ? (
              <p className="recipes-page__modal-loading">Loading recipe details...</p>
            ) : recipeDetail ? (
              <>
                <div className="recipes-page__modal-section">
                  <h3 className="recipes-page__modal-heading">🥘 Ingredients</h3>
                  <ul className="recipes-page__ingredients-list">
                    {recipeDetail.ingredients
                      ? recipeDetail.ingredients.map((item, idx) => (
                          <li key={idx} className="recipes-page__ingredient-item">
                            {item.measure} {item.name}
                          </li>
                        ))
                      : Array.from({ length: 20 })
                          .map((_, idx) => {
                            const ingredient = recipeDetail[`strIngredient${idx + 1}`]
                            const measure = recipeDetail[`strMeasure${idx + 1}`]
                            return ingredient?.trim() ? (
                              <li key={idx} className="recipes-page__ingredient-item">
                                {measure?.trim() || ''} {ingredient}
                              </li>
                            ) : null
                          })
                          .filter(Boolean)}
                  </ul>
                </div>

                <div className="recipes-page__modal-section">
                  <h3 className="recipes-page__modal-heading">👨‍🍳 Instructions</h3>
                  <p className="recipes-page__instructions">
                    {recipeDetail.strInstructions}
                  </p>
                </div>

                {!String(selectedRecipeId).startsWith('user-') && (
                  <MissingIngredientsPanel
                    mealId={selectedRecipe.isLocal ? undefined : selectedRecipeId}
                    recipeDetail={recipeDetail}
                    recipeTitle={selectedRecipe.title}
                    fridgeIngredients={scanIngredients}
                  />
                )}
              </>
            ) : (
              <p className="recipes-page__modal-no-details">
                {detailError || 'Recipe details unavailable.'}
              </p>
            )}

            {!selectedRecipe?.isLocal &&
              !String(selectedRecipeId).startsWith('user-') &&
              recipeDetail && (
                <a
                  href={recipeDetail?.strSource || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="recipes-page__modal-btn"
                >
                  View Full Recipe
                </a>
              )}
          </section>
        </div>
      )}
    </div>
  )
}

export default Recipes
