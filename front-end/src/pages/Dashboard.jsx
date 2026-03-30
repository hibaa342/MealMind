import React, { useRef } from 'react'
import RecipeCard from '../components/RecipeCard'

const recommended = [
  {
    id: 1,
    title: 'Caesar Salad',
    time: '20 min',
    categories: 'Mexican, Greens, Lunch',
    rating: 3.8,
    tags: ['Heart-healthy', 'Weight loss'],
    image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=480&h=280&fit=crop',
    accent: 'green',
  },
  {
    id: 2,
    title: 'Veggie Tacos',
    time: '25 min',
    categories: 'Mexican, Dinner',
    rating: 4.2,
    tags: ['Vegetarian'],
    image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=480&h=360&fit=crop',
    accent: 'orange',
  },
  {
    id: 3,
    title: 'Berry Smoothie Bowl',
    time: '15 min',
    categories: 'Breakfast, Healthy',
    rating: 4.6,
    tags: ['Weight loss'],
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=480&h=280&fit=crop',
    accent: 'pink',
  },
]

const trending = [
  {
    id: 4,
    title: 'Baked Chicken Breasts',
    time: '40 min',
    categories: 'Protein, Dinner',
    rating: 4.7,
    tags: ['High protein', 'Burn Fat'],
    image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=480&h=280&fit=crop',
    accent: 'orange',
  },
  {
    id: 5,
    title: 'Zucchini Lasagna',
    time: '55 min',
    categories: 'Italian, Comfort',
    rating: 4.4,
    tags: ['Low carb'],
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=480&h=280&fit=crop',
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

function RecipeRow({ title, subtitle, recipes }) {
  const scrollerRef = useRef(null)

  const scroll = (dir) => {
    const el = scrollerRef.current
    if (!el) return
    const delta = dir === 'next' ? 320 : -320
    el.scrollBy({ left: delta, behavior: 'smooth' })
  }

  return (
    <section className="cookpal-section">
      <div className="cookpal-section__head">
        <div>
          <h2 className="cookpal-section__title">{title}</h2>
          {subtitle && <p className="cookpal-section__sub">{subtitle}</p>}
        </div>
        <div className="cookpal-section__arrows">
          <button type="button" className="cookpal-arrow" onClick={() => scroll('prev')} aria-label="Previous">
            ‹
          </button>
          <button type="button" className="cookpal-arrow" onClick={() => scroll('next')} aria-label="Next">
            ›
          </button>
        </div>
      </div>
      <div className="cookpal-recipe-scroller" ref={scrollerRef}>
        {recipes.map((r) => (
          <RecipeCard key={r.id} recipe={r} />
        ))}
      </div>
    </section>
  )
}

const Dashboard = () => {
  return (
    <div className="cookpal-home">
      <div className="cookpal-search-row">
        <div className="cookpal-search">
          <span className="cookpal-search__icon" aria-hidden>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
          </span>
          <input type="search" className="cookpal-search__input" placeholder="What do you want to cook today?" aria-label="Search recipes" />
        </div>
        <button type="button" className="cookpal-filter-btn" aria-label="Filters">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path d="M4 6h16M8 12h8M10 18h4" />
          </svg>
        </button>
      </div>

      <RecipeRow title="Recommended Recipes" subtitle="Based on your preferences." recipes={recommended} />
      <RecipeRow title="Trending Recipes" subtitle="" recipes={trending} />
    </div>
  )
}

export default Dashboard
