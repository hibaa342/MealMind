import React, { useState, useEffect, useCallback } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useNotifications } from '../context/NotificationsContext'
import { loadSidebarPrefs, saveSidebarPrefs } from '../utils/sidebarPrefs'
import { getDisplayNameFromUser, getPreferredDisplayName, getSubtitleFromUser } from '../utils/userDisplay'
import { useVoiceRecorder } from '../hooks/useVoiceRecorder'

const IconChefHat = () => (
  <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path
      d="M8 18c0-5 3-9 8-9s8 4 8 9v2H8v-2z"
      fill="currentColor"
      opacity="0.95"
    />
    <ellipse cx="16" cy="11" rx="9" ry="3.5" fill="currentColor" />
    <rect x="10" y="20" width="12" height="6" rx="2" fill="currentColor" opacity="0.85" />
  </svg>
)

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

const IconCalendar = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)
const IconUser = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

const navItems = [
  { to: '/dashboard', label: 'Home', Icon: IconHome },
  { to: '/recipes', label: 'Recipes', Icon: IconRecipe },
  { to: '/scanner', label: 'Scanner', Icon: IconCamera },
  { to: '/order', label: 'Order', Icon: IconCart },
  { to: '/community', label: 'Community', Icon: IconUsers },
  { to: '/planning', label: 'Planning', Icon: IconCalendar },
  { to: '/favorites', label: 'Favorites', Icon: IconHeart },
  { to: '/notifications', label: 'Notifications', Icon: IconBell },
  { to: '/help', label: 'Help', Icon: IconHelp },
]

const PrefPill = ({ label, variant = 'diet' }) => (
  <span className={`snapcook-pref-pill snapcook-pref-pill--${variant}`}>{label}</span>
)

const PrefsSections = ({ prefs, openAdd }) => (
  <>
    <section className="cookpal-prefs snapcook-prefs">
      <h3 className="snapcook-prefs__label">DIET</h3>
      <div className="cookpal-prefs__row">
        {prefs.diets.map((label, i) => (
          <PrefPill key={`diet-${label}-${i}`} label={label} variant="diet" />
        ))}
        <button type="button" className="snapcook-prefs__add" aria-label="Add diet" onClick={() => openAdd('diet')}>
          +
        </button>
      </div>
    </section>
    <section className="cookpal-prefs snapcook-prefs">
      <h3 className="snapcook-prefs__label">ALLERGIES</h3>
      <div className="cookpal-prefs__row">
        {prefs.allergies.map((label, i) => (
          <PrefPill key={`allergy-${label}-${i}`} label={label} variant="allergy" />
        ))}
        <button type="button" className="snapcook-prefs__add" aria-label="Add allergy" onClick={() => openAdd('allergy')}>
          +
        </button>
      </div>
    </section>
    <section className="cookpal-prefs snapcook-prefs">
      <h3 className="snapcook-prefs__label">CUISINES</h3>
      <div className="cookpal-prefs__row">
        {prefs.cuisines.map((label, i) => (
          <PrefPill key={`cuisine-${label}-${i}`} label={label} variant="cuisine" />
        ))}
        <button type="button" className="snapcook-prefs__add" aria-label="Add cuisine" onClick={() => openAdd('cuisine')}>
          +
        </button>
      </div>
    </section>
    <section className="cookpal-prefs snapcook-prefs snapcook-prefs--goals">
      <h3 className="snapcook-prefs__label">GOALS</h3>
      <ul className="snapcook-goals-list">
        {prefs.goals.map((label, i) => (
          <li key={`goal-${label}-${i}`}>{label}</li>
        ))}
      </ul>
      <button type="button" className="snapcook-prefs__add snapcook-prefs__add--inline" aria-label="Add goal" onClick={() => openAdd('goal')}>
        +
      </button>
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
    <div className="cookpal-shell cookpal-shell--snapcook">
      <aside className="cookpal-sidebar cookpal-sidebar--left snapcook-sidebar" aria-label="Site navigation">
        <div className="snapcook-brand">
          <span className="snapcook-brand__icon" aria-hidden>
            <IconChefHat />
          </span>
          <span className="snapcook-brand__text">SnapCook</span>
        </div>

        <nav className="snapcook-nav" aria-label="Main">
          {navItems.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/dashboard'}
              className={({ isActive }) =>
                `snapcook-nav__link${isActive ? ' snapcook-nav__link--active' : ''}`
              }
            >
              <span className="snapcook-nav__icon-wrap">
                <Icon />
                {to === '/notifications' && unreadCount > 0 && (
                  <span
                    className="cookpal-nav__badge"
                    aria-label={`${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`}
                  />
                )}
              </span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `snapcook-nav__link snapcook-nav__link--profile${isActive ? ' snapcook-nav__link--active' : ''}`
          }
        >
          <span className="snapcook-nav__icon-wrap">
            <IconUser />
          </span>
          <span>Profile</span>
        </NavLink>
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
            <div className="cookpal-mobile-header__title">SnapCook</div>
            <p className="cookpal-mobile-header__tagline">Smarter meals, less waste</p>
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

      <main className="cookpal-main snapcook-main">
        <Outlet context={{ voice }} />
      </main>

      <aside className="cookpal-sidebar cookpal-sidebar--right snapcook-panel-right">
        <div className="cookpal-profile snapcook-profile">
          <div className="cookpal-profile__avatar snapcook-profile__avatar" aria-hidden>
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
          className={`cookpal-bottom-nav__fab ${voice.isRecording || voice.isTranscribing ? 'cookpal-bottom-nav__fab--rec' : ''}`}
          onClick={voice.toggleRecording}
          disabled={voice.isTranscribing}
          aria-label={
            voice.isTranscribing
              ? 'Transcription en cours'
              : voice.isRecording
                ? 'Arrêter et transcrire'
                : 'Dicter une recherche'
          }
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
