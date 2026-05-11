import React, { useState } from 'react'
import { useOutletContext } from 'react-router-dom'

const initialFavorites = [
  {
    id: 1,
    title: 'Poulet Teriyaki',
    time: '30 min',
    image: 'https://images.unsplash.com/photo-1598514982205-f36b96d1e8d4?w=400&h=300&fit=crop',
  },
  {
    id: 2,
    title: 'Salade Caprese',
    time: '15 min',
    image: 'https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?w=400&h=300&fit=crop',
  },
  {
    id: 3,
    title: 'Veggie Tacos',
    time: '25 min',
    image: 'https://images.unsplash.com/photo-1564759298141-cef86f51d4d4?w=400&h=300&fit=crop',
  },
]

const Favorites = () => {
  const [favorites, setFavorites] = useState(initialFavorites)
  const { voice } = useOutletContext() || {}
  const [searchQuery, setSearchQuery] = useState('')
  const isRecording = voice?.isRecording

  const toggleRecording = () => voice?.toggleRecording?.()
  const playRecording = () => voice?.playRecording?.()

  const removeFromFavorites = (id) => {
    setFavorites((prev) => prev.filter((item) => item.id !== id))
  }

  return (
    <div className="cookpal-home cookpal-home--grocio">
      
      {/* 1. En-tête unifié (Copie de l'accueil) */}
      <div className="grocio-search-row">
        <div className="cookpal-search grocio-search">
          <span className="cookpal-search__icon" aria-hidden>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
          </span>
          <input
            type="search"
            className="cookpal-search__input"
            placeholder="Rechercher dans vos favoris..."
            aria-label="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            type="button"
            className={`cookpal-search__mic ${isRecording ? 'cookpal-search__mic--recording' : ''}`}
            onClick={toggleRecording}
            aria-label={isRecording ? 'Stop recording' : 'Start voice recording'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          </button>
          <button type="button" className="cookpal-search__ai" onClick={playRecording} aria-label="Play recording" title="Play last recording">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--grocio-green)" strokeWidth="1.75">
              <polygon points="5 3 19 12 5 21 5 3" fill="var(--grocio-green)" stroke="none" />
            </svg>
          </button>
        </div>
        <button type="button" className="grocio-pill-btn">
          + Recette
        </button>
      </div>

      {/* Conteneurs de recettes cohérents & Icônes actives */}
      <section className="grocio-section" style={{ marginTop: '36px' }}>
        <div className="grocio-section__head">
          <h2 className="grocio-section__title">Vos recettes favorites</h2>
        </div>
        
        {favorites.length === 0 ? (
          <p className="cookpal-empty">Aucune recette sauvegardée.</p>
        ) : (
          <div className="grocio-quick-grid">
            {favorites.map((r) => (
              <div key={r.id} className="grocio-quick-tile" style={{ position: 'relative' }}>
                <div className="grocio-quick-tile__img" style={{ backgroundImage: `url(${r.image})` }} />
                <div className="grocio-quick-tile__text">
                  <span className="grocio-quick-tile__name">{r.title}</span>
                  <span className="grocio-quick-tile__time">{r.time}</span>
                </div>
                
                {/* Icône de cœur active superposée pour retirer des favoris */}
                <button
                  type="button"
                  className="cookpal-recipe-card__heart cookpal-recipe-card__heart--on"
                  onClick={() => removeFromFavorites(r.id)}
                  style={{ 
                    position: 'absolute', 
                    top: '12px', 
                    right: '12px', 
                    zIndex: 10,
                    width: '32px',
                    height: '32px',
                    background: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                  aria-label="Retirer des favoris"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#e91e63" stroke="#e91e63" strokeWidth="1.75">
                    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  )
}

export default Favorites
