// pages/Recipes.jsx
import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import RecipeCard from '../components/RecipeCard'
import './Recipes.css'

// ─── Mock AI-generated recipes ───────────────────────────────────────────────
// Replace this with a real Claude API call using the scanned ingredients
const MOCK_AI_RECIPES = [
  {
    id: 'ai-1',
    title: 'Omelette aux tomates et fromage',
    time: '15 min',
    categories: 'Petit-déjeuner, Rapide',
    rating: 4.5,
    tags: ['Végétarien', 'Protéiné'],
    image: 'https://images.unsplash.com/photo-1510693206972-df098062cb71?w=480&h=280&fit=crop',
    accent: 'yellow',
    persons: 2,
    haveIngredients: ['Œufs', 'Tomates', 'Fromage', 'Oignons'],
    missingIngredients: ['Crème fraîche', 'Ciboulette'],
  },
  {
    id: 'ai-2',
    title: 'Soupe de carottes au lait',
    time: '25 min',
    categories: 'Dîner, Soupe',
    rating: 4.2,
    tags: ['Végétarien', 'Léger'],
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=480&h=280&fit=crop',
    accent: 'orange',
    persons: 3,
    haveIngredients: ['Carottes', 'Lait', 'Oignons'],
    missingIngredients: ['Bouillon de légumes', 'Crème'],
  },
  {
    id: 'ai-3',
    title: 'Gratin de pâtes au fromage',
    time: '35 min',
    categories: 'Dîner, Confort',
    rating: 4.7,
    tags: ['Végétarien', 'Réconfortant'],
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=480&h=280&fit=crop',
    accent: 'green',
    persons: 4,
    haveIngredients: ['Fromage', 'Œufs', 'Lait'],
    missingIngredients: ['Pâtes', 'Beurre', 'Muscade'],
  },
]

// Sample recipes for "All recipes" tab — reuses existing RecipeCard style
const ALL_RECIPES = [
  {
    id: 1,
    title: 'Caesar Salad',
    time: '20 min',
    categories: 'Mexican, Greens, Lunch',
    rating: 3.8,
    tags: ['Heart-healthy', 'Weight loss'],
    image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=480&h=280&fit=crop',
    accent: 'green',
  },
  {
    id: 2,
    title: 'Veggie Tacos',
    time: '25 min',
    categories: 'Mexican, Dinner',
    rating: 4.2,
    tags: ['Vegetarian'],
    image: 'https://images.unsplash.com/photo-1565299585323-38174c0b5e14?w=480&h=280&fit=crop',
    accent: 'orange',
  },
  {
    id: 3,
    title: 'Berry Smoothie Bowl',
    time: '15 min',
    categories: 'Breakfast, Healthy',
    rating: 4.6,
    tags: ['Weight loss'],
    image: 'https://images.unsplash.com/photo-1490474504059-bf625f7d7033?w=480&h=280&fit=crop',
    accent: 'pink',
  },
  {
    id: 4,
    title: 'Baked Chicken Breasts',
    time: '40 min',
    categories: 'Protein, Dinner',
    rating: 4.7,
    tags: ['High protein', 'Burn Fat'],
    image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=480&h=280&fit=crop',
    accent: 'orange',
  },
  {
    id: 5,
    title: 'Zucchini Lasagna',
    time: '55 min',
    categories: 'Italian, Comfort',
    rating: 4.4,
    tags: ['Low carb'],
    image: 'https://images.unsplash.com/photo-1574894709920-11b28e7497ad?w=480&h=280&fit=crop',
    accent: 'yellow',
  },
  {
    id: 6,
    title: 'Keto Ice Cream',
    time: '10 min',
    categories: 'Dessert, Keto',
    rating: 4.1,
    tags: ['Keto'],
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=480&h=280&fit=crop',
    accent: 'purple',
  },
]

// ─── AI Recipe Card ───────────────────────────────────────────────────────────
function AIRecipeCard({ recipe, onView, onOrder }) {
  const [saved, setSaved] = useState(false)

  return (
    <article className="recipes-ai-card">
      <div className="recipes-ai-card__image-wrap">
        <img className="recipes-ai-card__image" src={recipe.image} alt={recipe.title} loading="lazy" />
        <span className="recipes-ai-card__badge">✨ IA</span>
        {recipe.time && <span className="recipes-ai-card__time">⏱ {recipe.time}</span>}
        <button
          className={`recipes-ai-card__heart ${saved ? 'recipes-ai-card__heart--on' : ''}`}
          onClick={() => setSaved(s => !s)}
          aria-label={saved ? 'Retirer des favoris' : 'Sauvegarder'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24"
            fill={saved ? 'currentColor' : 'none'}
            stroke="currentColor" strokeWidth="1.75">
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
          </svg>
        </button>
      </div>

      <div className="recipes-ai-card__body">
        <h3 className="recipes-ai-card__title">{recipe.title}</h3>

        <div className="recipes-ai-card__meta">
          <span>⏱ {recipe.time}</span>
          <span>👥 {recipe.persons} pers.</span>
          <span>⭐ {recipe.rating}</span>
        </div>

        {/* Ingredients */}
        <div className="recipes-ai-card__ingredients">
          {recipe.haveIngredients?.length > 0 && (
            <div>
              <p className="recipes-ai-card__ing-label">✅ Disponibles</p>
              <div className="recipes-ai-card__ing-row">
                {recipe.haveIngredients.map(ing => (
                  <span key={ing} className="recipes-ai-card__ing-chip recipes-ai-card__ing-chip--have">
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}
          {recipe.missingIngredients?.length > 0 && (
            <div>
              <p className="recipes-ai-card__ing-label">❌ Manquants</p>
              <div className="recipes-ai-card__ing-row">
                {recipe.missingIngredients.map(ing => (
                  <span key={ing} className="recipes-ai-card__ing-chip recipes-ai-card__ing-chip--missing">
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="recipes-ai-card__actions">
          <button className="recipes-ai-card__btn-primary" onClick={() => onView(recipe)}>
            Voir la recette
          </button>
          {recipe.missingIngredients?.length > 0 && (
            <button className="recipes-ai-card__btn-secondary" onClick={() => onOrder(recipe)}>
              🛒 Commander
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const Recipes = ({ user }) => {
  const location  = useLocation()
  const navigate  = useNavigate()

  // Ingredients passed from Scanner page
  const scannedIngredients = location.state?.ingredients || []

  const [tab,      setTab]      = useState(scannedIngredients.length > 0 ? 'ai' : 'all')
  const [loading,  setLoading]  = useState(scannedIngredients.length > 0)
  const [aiRecipes, setAiRecipes] = useState([])

  // Simulate Claude API call — replace with real fetch
  useEffect(() => {
    if (scannedIngredients.length === 0) return
    const timer = setTimeout(() => {
      setAiRecipes(MOCK_AI_RECIPES)
      setLoading(false)
    }, 2200)
    return () => clearTimeout(timer)
  }, [])

  const handleView  = (recipe) => navigate(`/recipes/${recipe.id}`, { state: { recipe } })
  const handleOrder = (recipe) => navigate('/order',                { state: { missing: recipe.missingIngredients, recipeName: recipe.title } })

  const handleGenerate = () => {
    setLoading(true)
    setAiRecipes([])
    setTimeout(() => {
      // Shuffle mock for demo — replace with real API
      setAiRecipes([...MOCK_AI_RECIPES].reverse())
      setLoading(false)
    }, 2000)
  }

  return (
    <div className="cookpal-page recipes-page">

      {/* ── Header ── */}
      <h1 className="cookpal-page__title">
        {tab === 'ai' ? 'Recettes suggérées pour toi' : 'Explorer les recettes'}
      </h1>
      <p className="cookpal-page__lead">
        {tab === 'ai'
          ? 'Générées par Claude AI selon tes ingrédients scannés.'
          : 'Découvre des plats qui correspondent à tes goûts.'}
      </p>

      {/* ── Scanned ingredients banner ── */}
      {scannedIngredients.length > 0 && (
        <div className="recipes-scan-banner">
          <div className="recipes-scan-banner__left">
            <span className="recipes-scan-banner__label">📸 Ingrédients scannés :</span>
            <div className="recipes-scan-banner__chips">
              {scannedIngredients.slice(0, 6).map(ing => (
                <span key={ing.id} className="recipes-scan-banner__chip">
                  {ing.emoji} {ing.name}
                </span>
              ))}
              {scannedIngredients.length > 6 && (
                <span className="recipes-scan-banner__chip">
                  +{scannedIngredients.length - 6}
                </span>
              )}
            </div>
          </div>
          <button className="recipes-scan-banner__btn" onClick={() => navigate('/scanner')}>
            🔄 Nouveau scan
          </button>
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="recipes-tabs">
        <button
          className={`recipes-tab ${tab === 'ai' ? 'recipes-tab--active' : ''}`}
          onClick={() => setTab('ai')}
        >✨ Suggestions IA</button>
        <button
          className={`recipes-tab ${tab === 'all' ? 'recipes-tab--active' : ''}`}
          onClick={() => setTab('all')}
        >🍽 Toutes les recettes</button>
      </div>

      {/* ════════ TAB: AI suggestions ════════ */}
      {tab === 'ai' && (
        <>
          {loading ? (
            <div className="recipes-loading">
              <div className="recipes-loading__icon">🤖</div>
              <h2 className="recipes-loading__title">Claude AI génère tes recettes…</h2>
              <p className="recipes-loading__sub">Analyse des ingrédients et création des suggestions</p>
              <div className="recipes-loading__bar">
                <div className="recipes-loading__fill" />
              </div>
            </div>
          ) : aiRecipes.length === 0 ? (
            <div className="recipes-empty">
              <div className="recipes-empty__icon">🍳</div>
              <h2 className="recipes-empty__title">Aucune recette générée</h2>
              <p className="recipes-empty__sub">Scanne ton frigo pour obtenir des suggestions personnalisées</p>
              <button className="btn btn-primary" style={{ borderRadius: 12 }} onClick={() => navigate('/scanner')}>
                📸 Scanner mon frigo
              </button>
            </div>
          ) : (
            <>
              <div className="recipes-grid">
                {aiRecipes.map(recipe => (
                  <AIRecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    onView={handleView}
                    onOrder={handleOrder}
                  />
                ))}
              </div>

              <div className="recipes-bottom">
                <button className="recipes-bottom__scan" onClick={() => navigate('/scanner')}>
                  ← Nouveau scan
                </button>
                <button className="recipes-bottom__generate" onClick={handleGenerate}>
                  🔄 Générer d'autres recettes
                </button>
              </div>
            </>
          )}
        </>
      )}

      {/* ════════ TAB: All recipes ════════ */}
      {tab === 'all' && (
        <div className="cookpal-recipe-row">
          {ALL_RECIPES.map(r => (
            <RecipeCard key={r.id} recipe={r} />
          ))}
        </div>
      )}

    </div>
  )
}

export default Recipes
