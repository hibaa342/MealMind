import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import RecipeCard from '../components/RecipeCard'
import { getUserRecipes } from '../utils/userRecipes'
import { fetchRecipesByIngredients, fetchRecipeDetail } from '../api/recipes'
import { getScannedIngredients, saveScannedRecipes } from '../utils/scannedIngredients'
import MissingIngredientsPanel from '../components/MissingIngredientsPanel'
import './Recipes.css'

// ── Constants ─────────────────────────────────────────────────────────────────
const ACCENT_COLORS = ['green', 'orange', 'pink', 'yellow', 'purple']
const getAccentColor = (index) => ACCENT_COLORS[index % ACCENT_COLORS.length]

const CATEGORY_META = {
  Beef:          { difficulty: 'Medium', calories: '520 kcal', time: '45 min' },
  Chicken:       { difficulty: 'Easy',   calories: '380 kcal', time: '35 min' },
  Seafood:       { difficulty: 'Medium', calories: '310 kcal', time: '25 min' },
  Breakfast:     { difficulty: 'Easy',   calories: '290 kcal', time: '15 min' },
  Vegetarian:    { difficulty: 'Easy',   calories: '240 kcal', time: '30 min' },
  Pasta:         { difficulty: 'Easy',   calories: '420 kcal', time: '25 min' },
  Dessert:       { difficulty: 'Hard',   calories: '460 kcal', time: '50 min' },
  Side:          { difficulty: 'Easy',   calories: '180 kcal', time: '20 min' },
  Lamb:          { difficulty: 'Hard',   calories: '490 kcal', time: '60 min' },
  Pork:          { difficulty: 'Medium', calories: '430 kcal', time: '40 min' },
  Vegan:         { difficulty: 'Easy',   calories: '220 kcal', time: '25 min' },
  Miscellaneous: { difficulty: 'Medium', calories: '350 kcal', time: '35 min' },
}

const CATEGORIES = Object.keys(CATEGORY_META)
const PER_CATEGORY = 8
const SESSION_KEY = 'mealmind_catalog_v1'

// ── Deterministic rating from meal ID (no Math.random) ───────────────────────
function deterministicRating(id) {
  const str = String(id)
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0
  }
  return parseFloat((4.0 + (hash % 10) * 0.09).toFixed(1))
}

// ── sessionStorage cache helpers ──────────────────────────────────────────────
// sessionStorage survives React navigation (component unmount/remount) because
// it is tied to the browser tab, not the JS module. A hard refresh (F5) clears
// it, which is the desired behaviour — it forces a fresh fetch with no
// stale-cache risk. Module-level variables reset on refresh anyway, so they
// provided no benefit over sessionStorage for this use case.
function readCache() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    // Invalidate if the data shape is wrong (e.g. from an older version)
    if (!Array.isArray(parsed) || parsed.length === 0) return null
    return parsed
  } catch {
    return null
  }
}

function writeCache(data) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(data))
  } catch {
    // sessionStorage quota exceeded — silently skip caching
  }
}

// ── Fetch a single category with retry ───────────────────────────────────────
// TheMealDB's free tier rate-limits burst requests. On a refresh, the browser
// has recent connections to the same host, so some requests get throttled.
// We retry once after a short delay before giving up on that category.
async function fetchCategoryWithRetry(category, attempt = 0) {
  try {
    const res = await fetch(
      `https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`
    )
    if (!res.ok) {
      if (attempt === 0) {
        // Wait 800 ms then retry once
        await new Promise((r) => setTimeout(r, 800))
        return fetchCategoryWithRetry(category, 1)
      }
      return []
    }
    const data = await res.json()
    return data.meals || []
  } catch (err) {
    if (attempt === 0) {
      await new Promise((r) => setTimeout(r, 800))
      return fetchCategoryWithRetry(category, 1)
    }
    console.error(`Failed to fetch ${category} after retry:`, err)
    return []
  }
}

// ── Build catalog from TheMealDB ──────────────────────────────────────────────
async function buildCatalog() {
  const recipes = []
  const seenIds = new Set()

  // Fetch all categories concurrently — much faster than sequential
  const results = await Promise.allSettled(
    CATEGORIES.map((cat) => fetchCategoryWithRetry(cat))
  )

  results.forEach((result, idx) => {
    const category = CATEGORIES[idx]
    const meals = result.status === 'fulfilled' ? result.value : []
    const meta = CATEGORY_META[category] || { difficulty: 'Medium', calories: 'N/A', time: '30 min' }

    // Sort by ID for deterministic order — no Math.random shuffle
    const sorted = [...meals].sort((a, b) => a.idMeal.localeCompare(b.idMeal))

    let taken = 0
    for (const meal of sorted) {
      if (taken >= PER_CATEGORY) break
      if (seenIds.has(meal.idMeal)) continue
      recipes.push({
        id: meal.idMeal,
        title: meal.strMeal,
        image: meal.strMealThumb,
        time: meta.time,
        categories: category,
        category,
        difficulty: meta.difficulty,
        calories: meta.calories,
        rating: deterministicRating(meal.idMeal),
        accent: getAccentColor(recipes.length),
      })
      seenIds.add(meal.idMeal)
      taken++
    }
  })

  return recipes
}

// ── In-flight promise deduplication ──────────────────────────────────────────
// If two things trigger a fetch simultaneously (e.g. StrictMode double-mount),
// they share the same promise instead of firing duplicate network requests.
let catalogPromise = null

async function getCatalog() {
  const cached = readCache()
  if (cached) return cached

  if (!catalogPromise) {
    catalogPromise = buildCatalog().then((data) => {
      writeCache(data)
      catalogPromise = null
      return data
    }).catch((err) => {
      catalogPromise = null
      throw err
    })
  }

  return catalogPromise
}

// ── Component ─────────────────────────────────────────────────────────────────
const Recipes = () => {
  const location = useLocation()

  // Initialise from sessionStorage immediately — zero flash on navigation
  const [recipes, setRecipes] = useState(() => readCache() || [])
  const [loading, setLoading] = useState(() => !readCache())

  // Approved user-created recipes from MongoDB
  const [myApproved, setMyApproved] = useState([])

  // AI scan recommendations
  const [scanRecipes, setScanRecipes] = useState([])
  const [scanIngredients, setScanIngredients] = useState(() => getScannedIngredients())
  const [scanLoading, setScanLoading] = useState(false)

  // User-created recipes (localStorage — legacy, kept for backward compat)
  const [userRecipes, setUserRecipes] = useState(() => getUserRecipes())

  // Favorites
  const [favorites, setFavorites] = useState([])
  const [userId, setUserId] = useState(null)

  // Detail modal
  const [selectedRecipeId, setSelectedRecipeId] = useState(null)
  const [recipeDetail, setRecipeDetail] = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [detailError, setDetailError] = useState('')

  // ── Load base catalog ─────────────────────────────────────────────────────
  useEffect(() => {
    const cached = readCache()
    if (cached) {
      setRecipes(cached)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)

    getCatalog()
      .then((meals) => {
        if (!cancelled) {
          setRecipes(meals)
          setLoading(false)
        }
      })
      .catch((err) => {
        console.error('Error loading recipe catalog:', err)
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [])

  // ── Load approved user recipes from MongoDB ───────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return

    fetch(`${import.meta.env.VITE_API_URL}/api/products/mine/approved`, {
      headers: { 'x-auth-token': token },
    })
      .then((res) => {
        if (!res.ok) return []
        return res.json()
      })
      .then((data) => {
        if (!Array.isArray(data)) return
        // Normalise MongoDB product shape to match TheMealDB recipe shape
        setMyApproved(
          data.map((p) => ({
            id: p._id,
            title: p.title,
            image: p.image,
            time: p.time,
            categories: p.categories,
            category: p.categories,
            difficulty: 'Custom',
            calories: 'N/A',
            rating: p.rating || 4.0,
            accent: p.accent || 'green',
            instructions: p.instructions || '',
            ingredients: p.ingredients || [],
            isUserCreated: true,
          }))
        )
      })
      .catch((err) => console.error('Error fetching approved recipes:', err))
  }, [])

  // ── Favorites ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (!storedUser) return
    try {
      const user = JSON.parse(storedUser)
      setUserId(user._id)
      if (!user._id) return
      const token = localStorage.getItem('token')
      fetch(`${import.meta.env.VITE_API_URL}/api/users/favorites/${user._id}`, {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      })
        .then((res) => res.ok ? res.json() : null)
        .then((data) => { if (data) setFavorites(data.favorites || data || []) })
        .catch((err) => console.error('Error fetching favorites:', err))
    } catch (err) {
      console.error('Error parsing user:', err)
    }
  }, [])

  // ── AI scan suggestions ───────────────────────────────────────────────────
  const refreshScanSuggestions = useCallback(async () => {
    const ingredients = getScannedIngredients()
    setScanIngredients(ingredients)
    if (ingredients.length === 0) { setScanRecipes([]); return }
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

  // ── User-created recipes (localStorage legacy) ────────────────────────────
  useEffect(() => {
    const sync = () => setUserRecipes(getUserRecipes())
    sync()
    window.addEventListener('cookpal-user-recipes-changed', sync)
    return () => window.removeEventListener('cookpal-user-recipes-changed', sync)
  }, [])

  // ── All recipes for modal lookup ──────────────────────────────────────────
  const allRecipes = useMemo(
    () => [...scanRecipes, ...recipes, ...myApproved, ...userRecipes],
    [recipes, scanRecipes, myApproved, userRecipes]
  )

  // ── Catalog grid — base catalog + approved user recipes + localStorage legacy
  // Base catalog is NEVER filtered by scan results.
  // Approved MongoDB recipes appear at the top of the grid, clearly the user's own.
  const catalogGrid = useMemo(
    () => [...myApproved, ...recipes, ...userRecipes],
    [recipes, myApproved, userRecipes]
  )

  // ── Detail modal ──────────────────────────────────────────────────────────
  const selectedRecipe = useMemo(
    () => allRecipes.find((r) => r.id === selectedRecipeId),
    [allRecipes, selectedRecipeId]
  )

  useEffect(() => {
    if (!selectedRecipeId) { setRecipeDetail(null); setDetailError(''); return }
    const selected = allRecipes.find((r) => r.id === selectedRecipeId)
    if (!selected) { setRecipeDetail(null); setDetailError('Recipe not found.'); return }

    // User-created recipes already have their detail inline
    if (selected.isUserCreated) {
      setRecipeDetail({
        strInstructions: selected.instructions || 'No instructions provided.',
        ingredients: selected.ingredients || [],
      })
      setDetailError('')
      return
    }

    let cancelled = false
    setLoadingDetail(true)
    setDetailError('')
    setRecipeDetail(null)

    fetchRecipeDetail(selected)
      .then((detail) => {
        if (cancelled) return
        if (detail) setRecipeDetail(detail)
        else setDetailError('Could not load this recipe. Try again or pick another meal.')
      })
      .catch((error) => {
        if (!cancelled) {
          console.error('Error fetching recipe detail:', error)
          setDetailError('Network error while loading recipe details.')
        }
      })
      .finally(() => { if (!cancelled) setLoadingDetail(false) })

    return () => { cancelled = true }
  }, [selectedRecipeId]) // eslint-disable-line react-hooks/exhaustive-deps

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
      if (res.ok) { const data = await res.json(); setFavorites(data.favorites || []) }
    } catch (err) { console.error('Error adding favorite:', err) }
  }

  const handleRemoveFavorite = async (recipeId) => {
    if (!userId) return
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/favorites/${userId}/${recipeId}`,
        { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
      )
      if (res.ok) { const data = await res.json(); setFavorites(data.favorites || []) }
    } catch (err) { console.error('Error removing favorite:', err) }
  }

  const toggleFavorite = (r) => {
    if (isFavorited(r.id)) handleRemoveFavorite(r.id)
    else handleAddFavorite(r.id, r.title, r.image)
  }

  // ── Skeleton loader ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="recipes-page">
        <div className="recipes-page__header">
          <div className="recipes-page__utensils" aria-hidden><span /><span /><span /><span /></div>
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
        <div className="recipes-page__utensils" aria-hidden><span /><span /><span /><span /></div>
        <h1 className="recipes-page__title">Explore recipes</h1>
        <p className="recipes-page__lead">Discover dishes that match your tastes.</p>
      </div>

      {/* ── AI scan recommendations ── */}
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
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedRecipeId(r.id) } }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Open ${r.title}`}
                >
                  <RecipeCard recipe={r} isFavorited={isFavorited(r.id)} onFavoriteToggle={() => toggleFavorite(r)} />
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

      {/* ── My approved recipes — shown before the main catalog ── */}
      {myApproved.length > 0 && (
        <section style={{ marginBottom: 24 }}>
          <h2 className="recipes-page__section-title">
            My Recipes
            <span style={{ fontSize: '0.82rem', fontWeight: 500, color: '#2d6a4f', marginLeft: 10 }}>
              ✅ Approved
            </span>
          </h2>
          <div className="recipes-page__grid">
            {myApproved.map((r) => (
              <div
                key={`approved-${r.id}`}
                className="recipes-page__card-wrapper"
                onClick={() => setSelectedRecipeId(r.id)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedRecipeId(r.id) } }}
                role="button"
                tabIndex={0}
                aria-label={`Open ${r.title}`}
              >
                <RecipeCard recipe={r} isFavorited={isFavorited(r.id)} onFavoriteToggle={() => toggleFavorite(r)} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Base catalog ── */}
      <h2 className="recipes-page__section-title">
        All recipes
        {catalogGrid.length > 0 && (
          <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#79877f', marginLeft: 10 }}>
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
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedRecipeId(r.id) } }}
              role="button"
              tabIndex={0}
              aria-label={`Open ${r.title}`}
            >
              <RecipeCard recipe={r} isFavorited={isFavorited(r.id)} onFavoriteToggle={() => toggleFavorite(r)} />
            </div>
          ))
        ) : (
          <div className="recipes-page__empty"><p>No recipes found. Try again later.</p></div>
        )}
      </div>

      {/* ── Detail modal ── */}
      {selectedRecipeId && selectedRecipe && (
        <div className="recipes-page__modal-overlay" onClick={() => setSelectedRecipeId(null)}>
          <section className="recipes-page__modal-content" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="recipes-page__modal-close" onClick={() => setSelectedRecipeId(null)} aria-label="Close">✕</button>

            <h2 className="recipes-page__modal-title">{selectedRecipe.title}</h2>
            <img src={selectedRecipe.image} alt={selectedRecipe.title} className="recipes-page__modal-image" />

            <div className="recipes-page__modal-meta">
              <div className="recipes-page__meta-item">
                <span className="recipes-page__meta-label">⏱️ Time</span>
                <p>{selectedRecipe.time}</p>
              </div>
              <div className="recipes-page__meta-item">
                <span className="recipes-page__meta-label">⭐ Rating</span>
                <p>{selectedRecipe.rating != null ? Number(selectedRecipe.rating).toFixed(1) : 'N/A'}/5</p>
              </div>
              <div className="recipes-page__meta-item">
                <button
                  onClick={(e) => { e.preventDefault(); toggleFavorite(selectedRecipe) }}
                  style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', padding: '8px' }}
                  aria-label={isFavorited(selectedRecipeId) ? 'Remove from favorites' : 'Add to favorites'}
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
                            {item.measure || item.amount} {item.name}
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
                  <p className="recipes-page__instructions">{recipeDetail.strInstructions}</p>
                </div>

                {!selectedRecipe.isUserCreated && !String(selectedRecipeId).startsWith('user-') && (
                  <MissingIngredientsPanel
                    mealId={selectedRecipeId}
                    recipeDetail={recipeDetail}
                    recipeTitle={selectedRecipe.title}
                    fridgeIngredients={scanIngredients}
                  />
                )}
              </>
            ) : (
              <p className="recipes-page__modal-no-details">{detailError || 'Recipe details unavailable.'}</p>
            )}

            {!selectedRecipe.isUserCreated && !String(selectedRecipeId).startsWith('user-') && recipeDetail && (
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
