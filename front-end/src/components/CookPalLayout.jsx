import React, { useState, useEffect, useCallback } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useNotifications } from '../context/NotificationsContext'
import { loadSidebarPrefs, saveSidebarPrefs } from '../utils/sidebarPrefs'
import { getDisplayNameFromUser, getPreferredDisplayName, getSubtitleFromUser } from '../utils/userDisplay'
import { useVoiceRecorder } from '../hooks/useVoiceRecorder'

import imgMeat from '../assets/images/meat_1777065052517.png'
import imgSoup from '../assets/images/soup_1777065107187.png'
import imgGrocery from '../assets/images/grocery_1777065653499.png'
import imgSalad from '../assets/images/salad_1777065578678.png'
import imgTacos from '../assets/images/tacos_1777065667208.png'
import imgMutton from '../assets/images/mutton_1777065367934.png'

const IconHome = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V9.5z" />
  </svg>
)
const IconCamera = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
)
const IconRecipe = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5V4.5A2.5 2.5 0 0 1 6.5 2z" />
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
const IconCart = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="9" cy="20" r="1.5" />
    <circle cx="18" cy="20" r="1.5" />
    <path d="M3 4h2l2.4 10.5a1 1 0 0 0 1 .8h9.8a1 1 0 0 0 1-.8L21 7H7" />
  </svg>
)
const IconBag = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M6 8V6a6 6 0 0 1 12 0v2" />
    <path d="M4 10h16v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10z" />
  </svg>
)
const IconBell = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
)
const IconFridge = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="4" y="3" width="16" height="18" rx="2" />
    <line x1="4" y1="12" x2="20" y2="12" />
    <circle cx="9" cy="8" r="1" fill="currentColor" />
    <circle cx="9" cy="16" r="1" fill="currentColor" />
  </svg>
)
const IconMicFab = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="22" />
  </svg>
)
const IconSliders = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <line x1="4" y1="21" x2="4" y2="14" />
    <line x1="4" y1="10" x2="4" y2="3" />
    <line x1="12" y1="21" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12" y2="3" />
    <line x1="20" y1="21" x2="20" y2="16" />
    <line x1="20" y1="12" x2="20" y2="3" />
    <line x1="1" y1="14" x2="7" y2="14" />
    <line x1="9" y1="8" x2="15" y2="8" />
    <line x1="17" y1="16" x2="23" y2="16" />
  </svg>
)

const navItems = [
  { to: '/dashboard', label: 'Accueil', Icon: IconHome },
  { to: '/recipes', label: 'Recettes', Icon: IconCamera, bg: imgSoup },
  { to: '/scanner', label: 'Scanner', Icon: IconCompass, bg: imgMutton },
  { to: '/order', label: 'Commande', Icon: IconCart, bg: imgSalad },
  { to: '/community', label: 'Community', Icon: IconUsers, bg: imgMeat },
  { to: '/planning', label: 'Planning', Icon: IconUsers, bg: imgGrocery },
  { to: '/favorites', label: 'Favoris', Icon: IconHeart, bg: imgTacos },
  { to: '/notifications', label: 'Notifications', Icon: IconBell, bg: imgSoup },
  { to: '/help', label: 'Help', Icon: IconHelp, bg: imgMutton },
  { to: '/profile', label: 'Profil', Icon: IconSettings },
]

const PREF_IMAGE_POOL = [imgMeat, imgSoup, imgGrocery, imgSalad, imgTacos, imgMutton]

const prefImageAt = (index) => PREF_IMAGE_POOL[index % PREF_IMAGE_POOL.length]

const PrefCard = ({ image, label }) => (
  <div className="cookpal-pref-card">
    {image && (
      <div className="cookpal-pref-card__img-wrap">
        <img src={image} alt={label} className="cookpal-pref-card__img" />
      </div>
    )}
    <div className="cookpal-pref-card__label">{label}</div>
  </div>
)

const PrefsSections = ({ prefs, openAdd }) => (
  <>
    <section className="cookpal-prefs">
      <div className="cookpal-prefs__head">
        <h3>DIET</h3>
      </div>
      <div className="cookpal-prefs__row">
        {prefs.diets.map((label, i) => (
          <PrefCard key={`diet-${label}-${i}`} label={label} image={prefImageAt(i)} />
        ))}
        <button type="button" className="cookpal-prefs__add" aria-label="Add diet" onClick={() => openAdd('diet')}>
          +
        </button>
      </div>
    </section>
    <section className="cookpal-prefs">
      <div className="cookpal-prefs__head">
        <h3>ALLERGIES</h3>
      </div>
      <div className="cookpal-prefs__row">
        {prefs.allergies.map((label, i) => (
          <PrefCard key={`allergy-${label}-${i}`} label={label} image={prefImageAt(i + 1)} />
        ))}
        <button type="button" className="cookpal-prefs__add" aria-label="Add allergy" onClick={() => openAdd('allergy')}>
          +
        </button>
      </div>
    </section>
    <section className="cookpal-prefs">
      <div className="cookpal-prefs__head">
        <h3>CUISINES</h3>
      </div>
      <div className="cookpal-prefs__row">
        {prefs.cuisines.map((label, i) => (
          <PrefCard key={`cuisine-${label}-${i}`} label={label} image={prefImageAt(i + 2)} />
        ))}
        <button type="button" className="cookpal-prefs__add" aria-label="Add cuisine" onClick={() => openAdd('cuisine')}>
          +
        </button>
      </div>
    </section>
    <section className="cookpal-prefs">
      <div className="cookpal-prefs__head">
        <h3>GOALS</h3>
      </div>
      <div className="cookpal-prefs__row">
        {prefs.goals.map((label, i) => (
          <PrefCard key={`goal-${label}-${i}`} label={label} image={prefImageAt(i + 3)} />
        ))}
        <button type="button" className="cookpal-prefs__add" aria-label="Add goal" onClick={() => openAdd('goal')}>
          +
        </button>
      </div>
    </section>
  </>
)

const ADD_SECTION_LABEL = {
  diet: 'diet preference',
  allergy: 'allergy',
  cuisine: 'cuisine',
  goal: 'goal',
}

const CookPalLayout = ({ user }) => {
  const location = useLocation()
  const { unreadCount } = useNotifications()
  const [preferName, setPreferName] = useState(() => getPreferredDisplayName())

  useEffect(() => {
    const sync = () => setPreferName(getPreferredDisplayName())
    window.addEventListener('cookpal-display-name-changed', sync)
    return () => window.removeEventListener('cookpal-display-name-changed', sync)
  }, [])

  const displayName = preferName || getDisplayNameFromUser(user)
  const subtitle = getSubtitleFromUser(user)

  const voice = useVoiceRecorder()
  const [prefsDrawer, setPrefsDrawer] = useState(false)

  const [prefs, setPrefs] = useState(loadSidebarPrefs)
  const [addOpen, setAddOpen] = useState(null)
  const [addValue, setAddValue] = useState('')

  useEffect(() => {
    saveSidebarPrefs(prefs)
  }, [prefs])

  const openAdd = (section) => {
    setAddOpen(section)
    setAddValue('')
  }

  const closeAdd = useCallback(() => {
    setAddOpen(null)
    setAddValue('')
  }, [])

  useEffect(() => {
    if (!addOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') closeAdd()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [addOpen, closeAdd])

  useEffect(() => {
    if (!prefsDrawer) return
    const onKey = (e) => {
      if (e.key === 'Escape') setPrefsDrawer(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [prefsDrawer])

  const submitAdd = useCallback(() => {
    const trimmed = addValue.trim()
    if (!trimmed || !addOpen) return
    const key =
      addOpen === 'diet'
        ? 'diets'
        : addOpen === 'allergy'
          ? 'allergies'
          : addOpen === 'cuisine'
            ? 'cuisines'
            : 'goals'
    setPrefs((p) => {
      const list = p[key]
      if (list.some((x) => x.toLowerCase() === trimmed.toLowerCase())) return p
      return { ...p, [key]: [...list, trimmed] }
    })
    closeAdd()
  }, [addOpen, addValue, closeAdd])

  return (
    <div className="cookpal-shell cookpal-shell--glass">
      <audio ref={voice.audioRef} className="cookpal-voice-audio" preload="auto" />

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

        <nav className="cookpal-nav cookpal-nav--glass" aria-label="Main">
          {navItems.map(({ to, label, Icon, bg }) => {
            const isActive = location.pathname.startsWith(to) || (to === '/dashboard' && location.pathname === '/')

            const cardStyle =
              !isActive && bg
                ? {
                    backgroundImage: `linear-gradient(to right, rgba(25, 25, 25, 1) 15%, rgba(25, 25, 25, 0.4) 60%, rgba(0,0,0,0) 100%), url(${bg})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'right center',
                  }
                : {}

            return (
              <NavLink
                key={to}
                to={to}
                end={to === '/dashboard'}
                className={`cookpal-nav__link ${isActive ? 'cookpal-nav__link--active' : ''} ${!isActive && bg ? 'cookpal-nav__link--card' : ''}`}
                style={cardStyle}
              >
                <span className="cookpal-nav__icon-wrap">
                  <Icon />
                  {to === '/notifications' && unreadCount > 0 && (
                    <span className="cookpal-nav__badge" aria-label={`${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lues`} />
                  )}
                </span>
                <span>{label}</span>
              </NavLink>
            )
          })}
        </nav>
      </aside>

      <header className="cookpal-mobile-header">
        <div className="cookpal-mobile-header__brand">
          <span className="cookpal-mobile-header__logo" aria-hidden>
            <svg width="26" height="26" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 14c0-4 2.5-7 8-7s8 3 8 7v2h2v8c0 4-3.5 7-10 7s-10-3-10-7v-8h2v-2z" fill="#2d6a4f" />
              <ellipse cx="16" cy="12" rx="10" ry="4" fill="#52b788" />
            </svg>
          </span>
          <div>
            <div className="cookpal-mobile-header__title">CookPal</div>
            <p className="cookpal-mobile-header__tagline">AI grocery planner — smarter meals, less waste</p>
          </div>
        </div>
        <div className="cookpal-mobile-header__actions">
          <NavLink to="/notifications" className="cookpal-mobile-header__icon-btn" aria-label="Notifications">
            <IconBell />
            {unreadCount > 0 && <span className="cookpal-mobile-header__dot" />}
          </NavLink>
          <button
            type="button"
            className="cookpal-mobile-header__icon-btn"
            aria-label="Diet and allergies"
            onClick={() => setPrefsDrawer(true)}
          >
            <IconSliders />
          </button>
          <NavLink to="/profile" className="cookpal-mobile-header__avatar" aria-label="Profile">
            {displayName.charAt(0).toUpperCase()}
          </NavLink>
        </div>
      </header>

      <main className="cookpal-main">
        <Outlet context={{ voice }} />
      </main>

      <aside className="cookpal-sidebar cookpal-sidebar--right">
        <div className="cookpal-profile">
          <div className="cookpal-profile__avatar cookpal-profile__avatar--green" aria-hidden>
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="cookpal-profile__name">{displayName}</div>
            <div className="cookpal-profile__role">{subtitle}</div>
          </div>
        </div>
        <PrefsSections prefs={prefs} openAdd={openAdd} />
      </aside>

      <nav className="cookpal-bottom-nav" aria-label="Primary mobile">
        <NavLink
          to="/dashboard"
          end
          className={({ isActive }) => `cookpal-bottom-nav__item${isActive ? ' cookpal-bottom-nav__item--active' : ''}`}
        >
          <IconHome />
          <span>Home</span>
        </NavLink>
        <NavLink
          to="/scanner"
          className={({ isActive }) => `cookpal-bottom-nav__item${isActive ? ' cookpal-bottom-nav__item--active' : ''}`}
        >
          <IconFridge />
          <span>Fridge</span>
        </NavLink>
        <button
          type="button"
          className={`cookpal-bottom-nav__fab ${voice.isRecording ? 'cookpal-bottom-nav__fab--rec' : ''}`}
          onClick={voice.toggleRecording}
          aria-label={voice.isRecording ? 'Stop recording' : 'Record voice note'}
        >
          <IconMicFab />
        </button>
        <NavLink
          to="/profile"
          className={({ isActive }) => `cookpal-bottom-nav__item${isActive ? ' cookpal-bottom-nav__item--active' : ''}`}
        >
          <IconUsers />
          <span>Profile</span>
        </NavLink>
      </nav>

      {prefsDrawer && (
        <div className="cookpal-drawer-backdrop" role="presentation" onClick={() => setPrefsDrawer(false)}>
          <aside
            className="cookpal-drawer cookpal-panel"
            role="dialog"
            aria-label="Your preferences"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cookpal-drawer__head">
              <h2 className="cookpal-drawer__title">Your tastes</h2>
              <button type="button" className="cookpal-drawer__close" onClick={() => setPrefsDrawer(false)} aria-label="Close">
                ✕
              </button>
            </div>
            <div className="cookpal-drawer__body">
              <PrefsSections prefs={prefs} openAdd={openAdd} />
            </div>
          </aside>
        </div>
      )}

      {addOpen && (
        <div className="cookpal-modal-backdrop" role="presentation" onClick={closeAdd}>
          <div
            className="cookpal-modal cookpal-panel"
            role="dialog"
            aria-labelledby="cookpal-add-pref-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="cookpal-add-pref-title" className="cookpal-subtitle" style={{ marginTop: 0 }}>
              Add {ADD_SECTION_LABEL[addOpen]}
            </h2>
            <label className="cookpal-modal__label" htmlFor="cookpal-add-pref-input">
              Name
            </label>
            <input
              id="cookpal-add-pref-input"
              className="cookpal-modal__input"
              value={addValue}
              onChange={(e) => setAddValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitAdd()}
              placeholder="e.g. Vegan, Peanuts, Japanese…"
              autoFocus
            />
            <div className="cookpal-modal__actions">
              <button type="button" className="cookpal-modal__btn cookpal-modal__btn--ghost" onClick={closeAdd}>
                Cancel
              </button>
              <button type="button" className="cookpal-modal__btn cookpal-modal__btn--primary" onClick={submitAdd}>
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CookPalLayout
