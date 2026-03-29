import React, { useState } from 'react'
import RecipeCard from '../components/RecipeCard'

const samples = [
  {
    id: 1,
    title: 'Caesar Salad',
    time: '20 min',
    categories: 'Mexican, Greens, Lunch',
    rating: 3.8,
    tags: ['Heart-healthy', 'Weight loss'],
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=480&h=280&fit=crop',
    accent: 'green',
  },
  {
    id: 2,
    title: 'Veggie Tacos',
    time: '25 min',
    categories: 'Mexican, Dinner',
    rating: 4.2,
    tags: ['Vegetarian'],
    image: 'https://images.unsplash.com/photo-1565299585323-38174c0b5e14?w=480&h=360&fit=crop',
    accent: 'orange',
  },
  {
    id: 3,
    title: 'Berry Smoothie Bowl',
    time: '15 min',
    categories: 'Breakfast, Healthy',
    rating: 4.6,
    tags: ['Weight loss'],
    image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=480&h=280&fit=crop',
    accent: 'pink',
  },
]

const recipeDetails = {
  1: {
    description: 'Salade fraiche, rapide et riche en fibres.',
    ingredients: ['Laitue romaine', 'Poulet grille', 'Parmesan', 'Croutons', 'Sauce Caesar'],
    steps: ['Laver la salade', 'Griller le poulet', 'Melanger les ingredients', 'Servir frais'],
  },
  2: {
    description: 'Tacos vegetariens avec beaucoup de saveurs.',
    ingredients: ['Tortillas', 'Haricots rouges', 'Poivrons', 'Avocat', 'Salsa'],
    steps: ['Cuire les legumes', 'Chauffer les tortillas', 'Monter les tacos', 'Ajouter la salsa'],
  },
  3: {
    description: 'Petit-dejeuner leger et vitaminé.',
    ingredients: ['Fruits rouges', 'Banane', 'Yaourt', 'Granola', 'Graines de chia'],
    steps: ['Mixer les fruits', 'Verser dans un bol', 'Ajouter toppings', 'Servir immediatement'],
  },
}

const Recipes = () => {
  const [selectedRecipeId, setSelectedRecipeId] = useState(null)
  const selectedRecipe = samples.find((r) => r.id === selectedRecipeId)
  const selectedRecipeDetail = recipeDetails[selectedRecipeId]

  return (
    <div className="cookpal-page">
      <h1 className="cookpal-page__title">Explore recipes</h1>
      <p className="cookpal-page__lead">Discover dishes that match your tastes.</p>
      
      <div className="cookpal-recipe-row">
        {samples.map((r) => (
          <button
            key={r.id}
            type="button"
            className="cookpal-recipe-select-btn"
            onClick={() => setSelectedRecipeId(r.id)}
            aria-label={`Voir les details de ${r.title}`}
          >
            <RecipeCard recipe={r} />
          </button>
        ))}
      </div>

      {/* Modal - Détails de la recette */}
      {selectedRecipeId && selectedRecipe && selectedRecipeDetail && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setSelectedRecipeId(null)}
        >
          <section
            className="cookpal-panel"
            style={{
              maxWidth: '600px',
              width: '90%',
              maxHeight: '90vh',
              overflow: 'auto',
              borderRadius: '8px',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedRecipeId(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                padding: '0',
              }}
              aria-label="Fermer"
            >
              ✕
            </button>

            <h2 className="cookpal-subtitle" style={{ marginTop: 0 }}>
              {selectedRecipe.title}
            </h2>

            <img
              src={selectedRecipe.image}
              alt={selectedRecipe.title}
              style={{
                width: '100%',
                height: '280px',
                objectFit: 'cover',
                borderRadius: '6px',
                marginBottom: '16px',
              }}
            />

            <p className="cookpal-page__lead" style={{ marginBottom: 16 }}>
              {selectedRecipeDetail.description}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: 20 }}>
              <div style={{ padding: '12px', background: '#F5F5F5', borderRadius: '6px' }}>
                <strong>⏱️ Temps</strong>
                <p style={{ margin: '4px 0 0 0' }}>{selectedRecipe.time}</p>
              </div>
              <div style={{ padding: '12px', background: '#F5F5F5', borderRadius: '6px' }}>
                <strong>⭐ Note</strong>
                <p style={{ margin: '4px 0 0 0' }}>{selectedRecipe.rating.toFixed(1)}/5</p>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <h3 style={{ marginBottom: 8 }}>🥘 Ingredients</h3>
              <ul style={{ marginLeft: '20px', marginTop: 0 }}>
                {selectedRecipeDetail.ingredients.map((ing, idx) => (
                  <li key={idx} style={{ marginBottom: 6 }}>{ing}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 style={{ marginBottom: 8 }}>👨‍🍳 Etapes</h3>
              <ol style={{ marginLeft: '20px', marginTop: 0 }}>
                {selectedRecipeDetail.steps.map((step, idx) => (
                  <li key={idx} style={{ marginBottom: 6 }}>{step}</li>
                ))}
              </ol>
            </div>

            <button
              type="button"
              onClick={() => setSelectedRecipeId(null)}
              style={{
                marginTop: '20px',
                padding: '10px 20px',
                background: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
              }}
            >
              Fermer
            </button>
          </section>
        </div>
      )}
    </div>
  )
}

export default Recipes
