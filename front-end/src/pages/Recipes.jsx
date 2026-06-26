import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import RecipeCard from '../components/RecipeCard'
import { getUserRecipes } from '../utils/userRecipes'
import { fetchRecipesByIngredients, fetchRecipeDetail } from '../api/recipes'
import { getScannedIngredients, saveScannedRecipes } from '../utils/scannedIngredients'
import MissingIngredientsPanel from '../components/MissingIngredientsPanel'
import './Recipes.css'

// Color accent cycling for recipes
const ACCENT_COLORS = ['green', 'orange', 'pink', 'yellow', 'purple']

// Helper to cycle through accent colors
const getAccentColor = (index) => ACCENT_COLORS[index % ACCENT_COLORS.length]

// Difficulty and calorie estimates per category
const CATEGORY_META = {
  Beef:       { difficulty: 'Medium', calories: '520 kcal' },
  Chicken:    { difficulty: 'Easy',   calories: '380 kcal' },
  Seafood:    { difficulty: 'Medium', calories: '310 kcal' },
  Breakfast:  { difficulty: 'Easy',   calories: '290 kcal' },
  Vegetarian: { difficulty: 'Easy',   calories: '240 kcal' },
  Pasta:      { difficulty: 'Easy',   calories: '420 kcal' },
  Dessert:    { difficulty: 'Hard',   calories: '460 kcal' },
  Side:       { difficulty: 'Easy',   calories: '180 kcal' },
  Lamb:       { difficulty: 'Hard',   calories: '490 kcal' },
  Pork:       { difficulty: 'Medium', calories: '430 kcal' },
}

// Estimated cooking times per category
const CATEGORY_TIMES = {
  Beef:       '45 min',
  Chicken:    '35 min',
  Seafood:    '25 min',
  Breakfast:  '15 min',
  Vegetarian: '30 min',
  Pasta:      '25 min',
  Dessert:    '50 min',
  Side:       '20 min',
  Lamb:       '60 min',
  Pork:       '40 min',
}

// Helper to fetch recipes from TheMealDB — fetches up to 20 recipes across 8 categories
const fetchTheMealDBRecipes = async () => {
  try {
    const recipes = []
    const fetchedIds = new Set()

    const categories = [
      'Beef', 'Chicken', 'Seafood', 'Breakfast',
      'Vegetarian', 'Pasta', 'Dessert', 'Side'
    ]
    const PER_CATEGORY = 3
    const MAX_RECIPES = 20

    for (const category of categories) {
      if (recipes.length >= MAX_RECIPES) break
      try {
        const res = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`)
        const data = await res.json()
        if (data.meals) {
          // Shuffle slightly to get variety
          const shuffled = [...data.meals].sort(() => Math.random() - 0.5)
          for (const meal of shuffled.slice(0, PER_CATEGORY)) {
            if (!fetchedIds.has(meal.idMeal) && recipes.length < MAX_RECIPES) {
              const meta = CATEGORY_META[category] || { difficulty: 'Medium', calories: 'N/A' }
              recipes.push({
                id: meal.idMeal,
                title: meal.strMeal,
                image: meal.strMealThumb,
                time: CATEGORY_TIMES[category] || '30 min',
                categories: category,
                category,
                difficulty: meta.difficulty,
                calories: meta.calories,
                rating: parseFloat((4.0 + Math.random() * 0.9).toFixed(1)),
                accent: getAccentColor(recipes.length),
              })
              fetchedIds.add(meal.idMeal)
            }
          }
        }
      } catch (err) {
        console.error(`Failed to fetch ${category} meals:`, err)
      }
    }

    return recipes
  } catch (error) {
    console.error('Failed to fetch recipes from TheMealDB:', error)
    return []
  }
}

const Recipes = () => {
  const location = useLocation()
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [scanRecipes, setScanRecipes] = useState([])
  const [scanIngredients, setScanIngredients] = useState(() => getScannedIngredients())
  const [scanLoading, setScanLoading] = useState(false)
  const [userRecipes, setUserRecipes] = useState(() => getUserRecipes())
  const [favorites, setFavorites] = useState([])
  const [userId, setUserId] = useState(null)

  // Fetch user favorites from backend using native FETCH and a direct ID parameter
  const fetchFavorites = async (currentUserId) => {
    if (!currentUserId) return
    try {
      const token = localStorage.getItem('token') 
      
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/favorites/${currentUserId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (res.ok) {
        const data = await res.json()
        // Handles both plain arrays or object-wrapped payloads safely
        setFavorites(data.favorites || data || [])
      } else {
        console.error('Failed to fetch favorites, status:', res.status)
      }
    } catch (err) {
      console.error("Error fetching favorites:", err)
    }
  }

  // Get userId from localStorage and immediately feed it to your fetch call
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser)
        setUserId(user._id)
        
        if (user._id) {
          fetchFavorites(user._id)
        }
      } catch (err) {
        console.error('Error parsing user from localStorage:', err)
      }
    }
  }, [])

  const refreshScanSuggestions = useCallback(async () => {
    const ingredients = getScannedIngredients()
    setScanIngredients(ingredients)
    if (ingredients.length === 0) {
      setScanRecipes([])
      return
    }

    setScanLoading(true)
    try {
      const { recipes, needMoreIngredients } = await fetchRecipesByIngredients(ingredients)
      setScanRecipes(recipes)
      saveScannedRecipes(recipes, ingredients)
      if (needMoreIngredients) {
        setScanRecipes([])
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
    const onScanUpdate = () => refreshScanSuggestions()
    window.addEventListener('mealmind-scan-updated', onScanUpdate)
    return () => window.removeEventListener('mealmind-scan-updated', onScanUpdate)
  }, [refreshScanSuggestions])

  useEffect(() => {
    if (location.state?.fromScan) {
      refreshScanSuggestions()
    }
  }, [location.state, refreshScanSuggestions])

  // Fetch recipes from TheMealDB on mount
  useEffect(() => {
    const loadRecipes = async () => {
      try {
        setLoading(true)
        const meals = await fetchTheMealDBRecipes()
        setRecipes(meals)
      } catch (error) {
        console.error('Error loading recipes:', error)
        setRecipes([])
      } finally {
        setLoading(false)
      }
    }
    loadRecipes()
  }, [])

  useEffect(() => {
    const sync = () => setUserRecipes(getUserRecipes())
    sync()
    window.addEventListener('cookpal-user-recipes-changed', sync)
    return () => window.removeEventListener('cookpal-user-recipes-changed', sync)
  }, [])

  const samples = useMemo(() => {
    const scanIds = new Set(scanRecipes.map((r) => r.id))
    const general = recipes.filter((r) => !scanIds.has(r.id))
    return [...scanRecipes, ...general, ...userRecipes]
  }, [recipes, scanRecipes, userRecipes])

  const scanIds = useMemo(() => new Set(scanRecipes.map((r) => r.id)), [scanRecipes])

  const [selectedRecipeId, setSelectedRecipeId] = useState(null)
  const selectedRecipe = samples.find((r) => r.id === selectedRecipeId)
  const [recipeDetail, setRecipeDetail] = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [detailError, setDetailError] = useState('')

  // Fetch detailed recipe info when a recipe is selected
  useEffect(() => {
    if (!selectedRecipeId) {
      setRecipeDetail(null)
      setDetailError('')
      return
    }

    const selected = samples.find((r) => r.id === selectedRecipeId)
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
    return () => {
      cancelled = true
    }
  }, [selectedRecipeId, samples])

  // Handle adding favorite with complete authorization headers
  const handleAddFavorite = async (recipeId, title, image) => {
    if (!userId) {
      alert('Please log in to add favorites')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/favorites/add/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          recipeId,
          title,
          image,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setFavorites(data.favorites || [])
      } else {
        const error = await res.json()
        console.error('Error adding favorite:', error.message)
      }
    } catch (err) {
      console.error('Error adding favorite:', err)
    }
  }

  // Handle removing favorite with complete authorization headers
  const handleRemoveFavorite = async (recipeId) => {
    if (!userId) return

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/favorites/${userId}/${recipeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (res.ok) {
        const data = await res.json()
        setFavorites(data.favorites || [])
      } else {
        const error = await res.json()
        console.error('Error removing favorite:', error.message)
      }
    } catch (err) {
      console.error('Error removing favorite:', err)
    }
  }

  // Check if recipe is favorited
  const isFavorited = (recipeId) => {
    return favorites.some(fav => String(fav.id) === String(recipeId))
  }

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

  return (
    <div className="recipes-page">
      <div className="recipes-page__header">
        <div className="recipes-page__utensils" aria-hidden>
          <span />
          <span />
          <span />
          <span />
        </div>
        <h1 className="recipes-page__title">Explore recipes</h1>
        <p className="recipes-page__lead">Discover dishes that match your tastes.</p>
      </div>

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
                    onFavoriteToggle={() => {
                      if (isFavorited(r.id)) {
                        handleRemoveFavorite(r.id)
                      } else {
                        handleAddFavorite(r.id, r.title, r.image)
                      }
                    }}
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

      <h2 className="recipes-page__section-title">All recipes</h2>

      <div className="recipes-page__grid">
        {samples.filter((r) => !scanIds.has(r.id)).length > 0 ? (
          samples.filter((r) => !scanIds.has(r.id)).map((r) => (
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
                onFavoriteToggle={() => {
                  if (isFavorited(r.id)) {
                    handleRemoveFavorite(r.id)
                  } else {
                    handleAddFavorite(r.id, r.title, r.image)
                  }
                }}
              />
            </div>
          ))
        ) : (
          <div className="recipes-page__empty">
            <p>No recipes found. Try again later.</p>
          </div>
        )}
      </div>
      {selectedRecipeId && selectedRecipe && (
        <div className="recipes-page__modal-overlay" onClick={() => setSelectedRecipeId(null)}>
          <section className="recipes-page__modal-content" onClick={(e) => e.stopPropagation()}>
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
                <p>{selectedRecipe.rating != null ? Number(selectedRecipe.rating).toFixed(1) : 'N/A'}/5</p>
              </div>
              <div className="recipes-page__meta-item">
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    if (isFavorited(selectedRecipeId)) {
                      handleRemoveFavorite(selectedRecipeId)
                    } else {
                      handleAddFavorite(selectedRecipeId, selectedRecipe.title, selectedRecipe.image)
                    }
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    padding: '8px',
                  }}
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
                            {item.measure} {item.name}
                          </li>
                        ))
                      : Array.from({ length: 20 })
                          .map((_, idx) => {
                            const ingredientKey = `strIngredient${idx + 1}`
                            const measureKey = `strMeasure${idx + 1}`
                            const ingredient = recipeDetail[ingredientKey]
                            const measure = recipeDetail[measureKey]
                            return ingredient && ingredient.trim() ? (
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

            {!selectedRecipe?.isLocal && !String(selectedRecipeId).startsWith('user-') && recipeDetail && (
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
