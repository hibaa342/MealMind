import React from 'react'
import RecipeCard from '../components/RecipeCard'

const samples = [
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
]

const Recipes = () => {
  return (
    <div className="cookpal-page">
      <h1 className="cookpal-page__title">Explore recipes</h1>
      <p className="cookpal-page__lead">Discover dishes that match your tastes.</p>
      <div className="cookpal-recipe-row">
        {samples.map((r) => (
          <RecipeCard key={r.id} recipe={r} />
        ))}
      </div>
    </div>
  )
}

export default Recipes
