import React, { useMemo, useState } from 'react'
import RecipeCard from '../components/RecipeCard'

const initialFavorites = [
  {
    id: 1,
    title: 'Caesar Salad',
    time: '20 min',
    categories: 'Lunch',
    category: 'Healthy',
    rating: 3.8,
    tags: ['Heart-healthy', 'Weight loss'],
    image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=480&h=280&fit=crop',
    accent: 'green',
  },
  {
    id: 2,
    title: 'Grilled Salmon Bowl',
    time: '35 min',
    categories: 'Dinner',
    category: 'Protein',
    rating: 4.5,
    tags: ['High protein'],
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=480&h=280&fit=crop',
    accent: 'orange',
  },
  {
    id: 3,
    title: 'Veggie Tacos',
    time: '25 min',
    categories: 'Dinner',
    category: 'Vegetarien',
    rating: 4.2,
    tags: ['Vegetarien'],
    image: 'https://images.unsplash.com/photo-1565299585323-38174c0b5e14?w=480&h=360&fit=crop',
    accent: 'pink',
  },
]

const Favorites = () => {
  const [favorites, setFavorites] = useState(initialFavorites)
  const [activeFilter, setActiveFilter] = useState('Toutes')

  const categories = useMemo(() => ['Toutes', ...new Set(initialFavorites.map((item) => item.category))], [])
  const filteredFavorites = favorites.filter((item) => activeFilter === 'Toutes' || item.category === activeFilter)

  const removeFromFavorites = (id) => {
    setFavorites((prev) => prev.filter((item) => item.id !== id))
  }

  return (
    <div className="cookpal-page cookpal-favorites-page">
      <h1 className="cookpal-page__title">Mes recettes favorites</h1>
      <p className="cookpal-page__lead">Retrouvez et gerez vos recettes sauvegardees.</p>
      <div className="cookpal-filters">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className={`cookpal-filter-pill ${activeFilter === category ? 'cookpal-filter-pill--active' : ''}`}
            onClick={() => setActiveFilter(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {filteredFavorites.length === 0 ? (
        <section className="cookpal-panel">
          <p className="cookpal-empty">Aucune recette sauvegardee</p>
        </section>
      ) : (
        <div className="cookpal-recipe-row">
          {filteredFavorites.map((r) => (
            <div key={r.id} className="cookpal-favorite-card-wrap">
              <RecipeCard recipe={r} />
              <button type="button" className="cookpal-remove-fav-btn" onClick={() => removeFromFavorites(r.id)}>
                Retirer des favoris
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="cookpal-help-card">
        <h2>Favorites</h2>
        <p>Recipes you have saved.</p>
      </div>
    </div>
  )
}

export default Favorites
