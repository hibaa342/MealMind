import React from 'react'

const RecipeCard = ({ recipe }) => {
  if (!recipe) return null

  return (
    <div className="card">
      <h3>{recipe.title}</h3>
      {recipe.time && <p style={{ color: '#666', marginBottom: 8 }}>⏱ {recipe.time}</p>}
      {Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0 && (
        <ul style={{ paddingLeft: 20 }}>
          {recipe.ingredients.map((ing, i) => (
            <li key={i}>{ing}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default RecipeCard
