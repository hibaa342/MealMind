import React, { useState } from 'react'

const accentClass = {
  green: 'cookpal-recipe-card--green',
  orange: 'cookpal-recipe-card--orange',
  pink: 'cookpal-recipe-card--pink',
  yellow: 'cookpal-recipe-card--yellow',
  purple: 'cookpal-recipe-card--purple',
}

const RecipeCard = ({ recipe }) => {
  const [saved, setSaved] = useState(false)
  if (!recipe) return null

  const {
    title,
    time,
    categories,
    rating,
    tags = [],
    image,
    accent = 'green',
  } = recipe

  const bg = accentClass[accent] || accentClass.green

  return (
    <article className={`cookpal-recipe-card ${bg}`}>
      <div className="cookpal-recipe-card__image-wrap">
        <img className="cookpal-recipe-card__image" src={image} alt="" loading="lazy" />
        {time && <span className="cookpal-recipe-card__time">{time}</span>}
        <button
          type="button"
          className={`cookpal-recipe-card__heart ${saved ? 'cookpal-recipe-card__heart--on' : ''}`}
          onClick={() => setSaved((s) => !s)}
          aria-label={saved ? 'Remove from favorites' : 'Add to favorites'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.75">
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
          </svg>
        </button>
      </div>
      <div className="cookpal-recipe-card__body">
        <div className="cookpal-recipe-card__title-row">
          <h3 className="cookpal-recipe-card__title">{title}</h3>
          {rating != null && (
            <span className="cookpal-recipe-card__rating">
              <span className="cookpal-recipe-card__star" aria-hidden>
                ★
              </span>
              {Number(rating).toFixed(1)}
            </span>
          )}
        </div>
        {categories && <p className="cookpal-recipe-card__cats">{categories}</p>}
        {tags.length > 0 && (
          <div className="cookpal-recipe-card__tags">
            {tags.map((t) => (
              <span key={t} className="cookpal-recipe-card__tag">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  )
}

export default RecipeCard
