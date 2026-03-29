import React from 'react'
import RecipeCard from '../components/RecipeCard'

const favorites = [
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
    title: 'Grilled Salmon Bowl',
    time: '35 min',
    categories: 'Seafood, Dinner',
    rating: 4.5,
    tags: ['High protein'],
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=480&h=280&fit=crop',
    accent: 'orange',
  },
]

const Favorites = () => {
  return (
    <div className="cookpal-page">
      <h1 className="cookpal-page__title">Favorites</h1>
      <p className="cookpal-page__lead">Recipes you have saved.</p>
      <div className="cookpal-recipe-row">
        {favorites.map((r) => (
          <RecipeCard key={r.id} recipe={r} />
        ))}
      </div>
    </div>
  )
}

export default Favorites
