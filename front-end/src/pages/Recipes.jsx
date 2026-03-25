import React from 'react'
import RecipeCard from '../components/RecipeCard'

const Recipes = () => {
  const samples = [
    { id: 1, title: 'Pâtes tomate', time: '25 min', ingredients: ['pâtes', 'tomates', 'ail'] },
    { id: 2, title: 'Salade rapide', time: '10 min', ingredients: ['tomates', 'oignons'] },
  ]

  return (
    <div className="container">
      <h2 style={{ color: 'white', marginBottom: 16 }}>Recettes suggérées</h2>
      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
        {samples.map((r) => (
          <RecipeCard key={r.id} recipe={r} />
        ))}
      </div>
    </div>
  )
}

export default Recipes
