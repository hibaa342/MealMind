import React, { useRef, useState, useEffect } from 'react'
import RecipeCard from '../components/RecipeCard'
import AddProductModal from '../components/AddProductModal'

function RecipeRow({ title, subtitle, recipes, onEdit }) {
  const scrollerRef = useRef(null)

  const scroll = (dir) => {
    const el = scrollerRef.current
    if (!el) return
    const delta = dir === 'next' ? 320 : -320
    el.scrollBy({ left: delta, behavior: 'smooth' })
  }

  if (!recipes || recipes.length === 0) return null

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
          <RecipeCard key={r._id || r.id} recipe={{ ...r, onEdit }} />
        ))}
      </div>
    </section>
  )
}

const Dashboard = () => {
  const [products, setProducts] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const isAdmin = window.location.hostname === 'localhost'

  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/products')
      const data = await res.json()
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleSaveProduct = async (formData, id = null) => {
    try {
      const url = id
        ? `http://localhost:5000/api/products/${id}`
        : 'http://localhost:5000/api/products'

      const res = await fetch(url, {
        method: id ? 'PUT' : 'POST',
        body: formData
      })

      if (res.ok) {
        fetchProducts()
        setIsModalOpen(false)
        setEditingProduct(null)
      }
    } catch (error) {
      console.error('Error saving product:', error)
    }
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingProduct(null)
  }

  // Split products for display
  const recommended = products.slice(0, 3)
  const trending = products.slice(3)

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

        {isAdmin && (
          <button
            type="button"
            className="cookpal-admin-btn"
            onClick={() => setIsModalOpen(true)}
          >
            Add Product
          </button>
        )}
      </div>

      {products.length === 0 ? (
        <div className="cookpal-empty-state" style={{ textAlign: 'center', padding: '40px' }}>
          <p>No recipes found. {isAdmin ? 'Start by adding some!' : 'Check back later.'}</p>
        </div>
      ) : (
        <>
          <RecipeRow
            title="Recommended Recipes"
            subtitle="Based on your preferences."
            recipes={recommended}
            onEdit={handleEdit}
          />
          <RecipeRow
            title="Trending Recipes"
            subtitle=""
            recipes={trending}
            onEdit={handleEdit}
          />
        </>
      )}

      <AddProductModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAdd={handleSaveProduct}
        initialData={editingProduct}
      />
    </div>
  )
}

export default Dashboard
