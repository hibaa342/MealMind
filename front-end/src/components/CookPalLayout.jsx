import React from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'

const IconHome = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V9.5z" />
  </svg>
)
const IconCamera = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
)
const IconCompass = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="12" r="9" />
    <path d="m15.5 8.5-4 2-2 4-4-2 4-2 2-4z" />
  </svg>
)
const IconUsers = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)
const IconHeart = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
  </svg>
)
const IconHelp = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2-3 4M12 17h.01" />
  </svg>
)
const IconSettings = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
  </svg>
)
const IconBag = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M6 8V6a6 6 0 0 1 12 0v2" />
    <path d="M4 10h16v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10z" />
  </svg>
)

const navItems = [
  { to: '/dashboard', label: 'Home', Icon: IconHome },
  { to: '/scanner',   label: 'Scanner',   Icon: IconCamera  },
  { to: '/recipes', label: 'Explore', Icon: IconCompass },
  { to: '/planning', label: 'Community', Icon: IconUsers },
  { to: '/favorites', label: 'Favorites', Icon: IconHeart },
  { to: '/help', label: 'Help', Icon: IconHelp },
  { to: '/profile', label: 'Settings', Icon: IconSettings },
]

const PrefChip = ({ children }) => <span className="cookpal-chip">{children}</span>

const CookPalLayout = ({ user, onLogout }) => {
  const navigate = useNavigate()
  const displayName = user?.name || 'Chef'
  const subtitle = user?.title || 'Home cook'

  const handleLogout = () => {
    onLogout()
    navigate('/login')
  }

  return (
    <div className="cookpal-shell">
      <aside className="cookpal-sidebar cookpal-sidebar--left">
        <div className="cookpal-brand">
          <span className="cookpal-brand__icon" aria-hidden>
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 14c0-4 2.5-7 8-7s8 3 8 7v2h2v8c0 4-3.5 7-10 7s-10-3-10-7v-8h2v-2z" fill="#4CAF50" />
              <ellipse cx="16" cy="12" rx="10" ry="4" fill="#81C784" />
            </svg>
          </span>
          <span className="cookpal-brand__text">CookPal</span>
        </div>

        <nav className="cookpal-nav" aria-label="Main">
          {navItems.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/dashboard'}
              className={({ isActive }) => `cookpal-nav__link ${isActive ? 'cookpal-nav__link--active' : ''}`}
            >
              <Icon />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="cookpal-newsletter">
          <IconBag />
          <p className="cookpal-newsletter__text">Get weekly recipes directly to your email.</p>
          <button type="button" className="cookpal-btn-subscribe">
            SUBSCRIBE NOW
          </button>
        </div>

        <button type="button" className="cookpal-signout" onClick={handleLogout}>
          Sign out
        </button>
      </aside>

      <main className="cookpal-main">
        <Outlet />
      </main>

      <aside className="cookpal-sidebar cookpal-sidebar--right">
        <div className="cookpal-profile">
          <div className="cookpal-profile__avatar" aria-hidden>
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="cookpal-profile__name">{displayName}</div>
            <div className="cookpal-profile__role">{subtitle}</div>
          </div>
        </div>

        <section className="cookpal-prefs">
          <div className="cookpal-prefs__head">
            <h3>Diet</h3>
            <button type="button" className="cookpal-prefs__edit">
              Edit
            </button>
          </div>
          <div className="cookpal-prefs__row">
            <PrefChip>
              <span className="cookpal-prefs__chip-icon">🥩</span> Meat
            </PrefChip>
            <PrefChip>
              <span className="cookpal-prefs__chip-icon">🍲</span> Soup
            </PrefChip>
            <button type="button" className="cookpal-prefs__add" aria-label="Add diet">
              +
            </button>
          </div>
        </section>

        <section className="cookpal-prefs">
          <div className="cookpal-prefs__head">
            <h3>Allergies</h3>
            <button type="button" className="cookpal-prefs__edit">
              Edit
            </button>
          </div>
          <div className="cookpal-prefs__row">
            <PrefChip>Gluten</PrefChip>
            <button type="button" className="cookpal-prefs__add" aria-label="Add allergy">
              +
            </button>
          </div>
        </section>

        <section className="cookpal-prefs">
          <div className="cookpal-prefs__head">
            <h3>Cuisines</h3>
            <button type="button" className="cookpal-prefs__edit">
              Edit
            </button>
          </div>
          <div className="cookpal-prefs__row cookpal-prefs__row--wrap">
            <PrefChip>American</PrefChip>
            <PrefChip>Italian</PrefChip>
            <PrefChip>Mediterranean</PrefChip>
          </div>
        </section>

        <section className="cookpal-prefs">
          <div className="cookpal-prefs__head">
            <h3>Goals</h3>
            <button type="button" className="cookpal-prefs__edit">
              Edit
            </button>
          </div>
          <div className="cookpal-prefs__row">
            <PrefChip>Burn Fat</PrefChip>
            <button type="button" className="cookpal-prefs__add" aria-label="Add goal">
              +
            </button>
          </div>
        </section>
      </aside>
    </div>
  )
}

export default CookPalLayout
