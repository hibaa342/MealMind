import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import RecipeCard from '../components/RecipeCard'
import { getUserRecipes } from '../utils/userRecipes'
import { fetchRecipesByIngredients } from '../api/recipes'
import { getScannedIngredients, saveScannedRecipes } from '../utils/scannedIngredients'
import './Recipes.css'

// Color accent cycling for recipes
const ACCENT_COLORS = ['green', 'orange', 'pink', 'yellow', 'purple']

// Helper to cycle through accent colors
const getAccentColor = (index) => ACCENT_COLORS[index % ACCENT_COLORS.length]

// Helper to fetch recipes from TheMealDB
const fetchTheMealDBRecipes = async () => {
  try {
    const recipes = []
    const fetchedIds = new Set()

    const categories = ['Seafood', 'Breakfast', 'Vegetarian', 'Pasta', 'Dessert']
    
    for (const category of categories) {
      if (recipes.length >= 10) break
      try {
        const res = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`)
        const data = await res.json()
        if (data.meals) {
          for (const meal of data.meals.slice(0, 2)) {
            if (!fetchedIds.has(meal.idMeal) && recipes.length < 10) {
              recipes.push({
                id: meal.idMeal,
                title: meal.strMeal,
                image: meal.strMealThumb,
                time: '30 min',
                categories: category,
                rating: 4.2 + Math.random() * 0.7,
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
      
      const res = await fetch(`http://localhost:5000/api/users/favorites/${currentUserId}`, {
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

  // Fetch detailed recipe info when a recipe is selected
  useEffect(() => {
    if (!selectedRecipeId) {
      setRecipeDetail(null)
      return
    }

    const selected = samples.find((r) => r.id === selectedRecipeId)
    if (selected?.isLocal && selected.localDetail) {
      setRecipeDetail(selected.localDetail)
      setLoadingDetail(false)
      return
    }

    const fetchDetail = async () => {
      try {
        setLoadingDetail(true)
        const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${selectedRecipeId}`)
        const data = await res.json()
        if (data.meals && data.meals[0]) {
          setRecipeDetail(data.meals[0])
        }
      } catch (error) {
        console.error('Error fetching recipe detail:', error)
        setRecipeDetail(null)
      } finally {
        setLoadingDetail(false)
      }
    }

    fetchDetail()
  }, [selectedRecipeId, samples])

  // Handle adding favorite with complete authorization headers
  const handleAddFavorite = async (recipeId, title, image) => {
    if (!userId) {
      alert('Please log in to add favorites')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`http://localhost:5000/api/users/favorites/add/${userId}`, {
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
      const res = await fetch(`http://localhost:5000/api/users/favorites/${userId}/${recipeId}`, {
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
        <h1 className="recipes-page__title">Explore recipes</h1>
        <p className="recipes-page__lead">Loading delicious meals...</p>
        <div className="recipes-page__loading">Loading...</div>
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
              </>
            ) : (
              <p className="recipes-page__modal-no-details">Recipe details unavailable.</p>
            )}

            {!selectedRecipe?.isLocal && (
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
