import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

const TIPS = [
  'You can filter recipes by your preferences from the Recipes page.',
  'Use the scanner to register your products faster.',
  'Plan your meals for a week to save time.',
  'Save your allergies in your profile for personalized suggestions.',
]

const FAQ_ITEMS = [
  {
    key: 'account',
    title: 'Account',
    questions: [
      ['How do I update my profile?', 'Go to Profile menu, then Edit. You can change your name, preferences and goals.'],
      ['Will my data be deleted if I leave?', 'From Privacy in your profile you can request account deletion when this option is enabled on the server.'],
    ],
  },
  {
    key: 'recipes',
    title: 'Recipes and Scanner',
    questions: [
      ['How do I add a recipe to favorites?', 'On a recipe card, use the favorite icon to save it.'],
      ['The scanner does not recognize my product', 'Check the lighting and barcode frame. Otherwise add the product manually.'],
    ],
  },
  {
    key: 'budget',
    title: 'Planning and Orders',
    questions: [
      ['Where can I see my meal plan?', 'Open the Planning section in the main menu.'],
      ['How do I prepare an order?', 'Missing ingredients can be listed in Order to estimate the total.'],
    ],
  },
]

const HELP_TOPICS = [
  { id: 'start', title: 'Getting Started', text: 'Explore the dashboard then browse recipes.' },
  { id: 'prefs', title: 'Preferences', text: 'Visit your profile to set diet, allergies and goals.' },
  { id: 'plan', title: 'Planning', text: 'Organize lunch and dinner by day of the week.' },
  { id: 'order', title: 'Orders', text: 'List ingredients to buy and confirm your cart.' },
  { id: 'fav', title: 'Favorites', text: 'Find your saved recipes and filter by category.' },
]

const Help = () => {
  const [search, setSearch] = useState('')
  const [openFaq, setOpenFaq] = useState(() => Object.fromEntries(FAQ_ITEMS.map((f) => [f.key, false])))
  const [tipIndex, setTipIndex] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => {
      setTipIndex((i) => (i + 1) % TIPS.length)
    }, 12000)
    return () => window.clearInterval(id)
  }, [])

  const filteredTopics = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return HELP_TOPICS
    return HELP_TOPICS.filter(
      (t) => t.title.toLowerCase().includes(q) || t.text.toLowerCase().includes(q),
    )
  }, [search])

  const toggleFaq = (key) => {
    setOpenFaq((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const onContact = (e) => {
    e.preventDefault()
    window.alert('Thank you. Your message has been recorded (local demo).')
    e.target.reset()
  }

  return (
    <div className="cookpal-page help-page">
      <h1 className="cookpal-page__title">Help</h1>
      <p className="cookpal-page__lead">Quick guides, frequently asked questions, and contact.</p>

      <div className="help-search cookpal-search">
        <span className="cookpal-search__icon" aria-hidden>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
        </span>
        <input
          type="search"
          className="cookpal-search__input"
          placeholder="Search (planning, favorites, scanner...)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search in help"
        />
      </div>

      {search.trim() && (
        <section className="cookpal-help-card help-section" aria-live="polite">
          <h2 className="help-section__title">Results</h2>
          {filteredTopics.length === 0 ? (
            <p className="help-muted">No topics match.</p>
          ) : (
            <ul className="help-topic-list">
              {filteredTopics.map((t) => (
                <li key={t.id}>
                  <strong>{t.title}</strong>
                  <p className="help-muted">{t.text}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <section className="cookpal-help-card help-section">
        <h2 className="help-section__title">Quick Links</h2>
        <ul className="help-shortcuts">
          <li>
            <Link to="/recipes">View Recipes</Link>
          </li>
          <li>
            <Link to="/planning">Weekly Planning</Link>
          </li>
          <li>
            <Link to="/order">My Order</Link>
          </li>
          <li>
            <Link to="/scanner">Product Scanner</Link>
          </li>
          <li>
            <Link to="/profile">My Profile</Link>
          </li>
        </ul>
      </section>

      <section className="cookpal-help-card help-section">
        <h2 className="help-section__title">Frequently Asked Questions</h2>
        <div className="help-faq">
          {FAQ_ITEMS.map((cat) => (
            <div key={cat.key} className="help-faq__block">
              <button
                type="button"
                className="help-faq__head"
                aria-expanded={!!openFaq[cat.key]}
                onClick={() => toggleFaq(cat.key)}
              >
                <span>{cat.title}</span>
                <span className="help-faq__chevron" aria-hidden>{openFaq[cat.key] ? '−' : '+'}</span>
              </button>
              {openFaq[cat.key] && (
                <div className="help-faq__body">
                  {cat.questions.map(([q, a]) => (
                    <div key={q} className="help-faq__pair">
                      <p className="help-faq__q">{q}</p>
                      <p className="help-faq__a">{a}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="cookpal-help-card help-section">
        <h2 className="help-section__title">Contact</h2>
        <form className="help-form" onSubmit={onContact}>
          <label htmlFor="help-subject">Sujet</label>
          <input id="help-subject" name="subject" type="text" required className="help-form__input" />
          <label htmlFor="help-message">Message</label>
          <textarea id="help-message" name="message" rows={4} required className="help-form__textarea" />
          <button type="submit" className="btn btn-primary help-form__submit">
            Envoyer
          </button>
        </form>
      </section>

      <section className="cookpal-help-card help-section help-tip">
        <h2 className="help-section__title">Astuce</h2>
        <p>{TIPS[tipIndex]}</p>
      </section>
    </div>
  )
}

export default Help
