import React from 'react'
import { Link } from 'react-router-dom'

const SiteNavbar = () => {
  return (
    <header className="auth-nav">
      <Link to="/login" className="auth-nav__brand">
        <span aria-hidden>
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 14c0-4 2.5-7 8-7s8 3 8 7v2h2v8c0 4-3.5 7-10 7s-10-3-10-7v-8h2v-2z" fill="#4CAF50" />
            <ellipse cx="16" cy="12" rx="10" ry="4" fill="#81C784" />
          </svg>
        </span>
        CookPal
      </Link>
      <nav className="auth-nav__links" aria-label="Account">
        <Link to="/login">Log in</Link>
        <Link to="/register">Sign up</Link>
      </nav>
    </header>
  )
}

export default SiteNavbar
