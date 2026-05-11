import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

const TIPS = [
  'Vous pouvez filtrer les recettes selon vos préférences depuis la page Recettes.',
  'Utilisez le scanner pour enregistrer vos produits plus vite.',
  'Planifiez vos repas sur une semaine pour gagner du temps.',
  'Enregistrez vos allergies dans le profil pour des suggestions adaptées.',
]

const FAQ_ITEMS = [
  {
    key: 'account',
    title: 'Compte',
    questions: [
      ['Comment modifier mon profil ?', "Menu Profil, puis Modifier. Vous pouvez changer nom, préférences et objectifs."],
      ['Mes données sont-elles supprimées si je quitte ?', 'Depuis Confidentialité dans le profil vous pouvez demander la suppression du compte lorsque cette option sera activée côté serveur.'],
    ],
  },
  {
    key: 'recipes',
    title: 'Recettes et scanner',
    questions: [
      ['Comment ajouter une recette aux favoris ?', "Sur une carte recette, utilisez l’icône favori pour l’enregistrer."],
      ["Le scanner ne reconnaît pas mon produit", 'Vérifiez la lumière et le cadre du code-barres. Sinon ajoutez le produit à la main.'],
    ],
  },
  {
    key: 'budget',
    title: 'Planning et commandes',
    questions: [
      ['Où voir mon planning ?', 'Ouvrez la section Planning dans le menu principal.'],
      ['Comment préparer une commande ?', 'Les ingrédients manquants peuvent être listés dans Commande pour estimer le total.'],
    ],
  },
]

const HELP_TOPICS = [
  { id: 'start', title: 'Premiers pas', text: 'Rencontrez le tableau de bord puis explorez les recettes.' },
  { id: 'prefs', title: 'Préférences', text: 'Rencontrez le profil pour régime, allergies et objectifs.' },
  { id: 'plan', title: 'Planning', text: 'Organisez midi et soir par jour de la semaine.' },
  { id: 'order', title: 'Commande', text: 'Récapitulez les ingrédients à acheter et confirmez votre panier.' },
  { id: 'fav', title: 'Favoris', text: 'Retrouvez vos recettes enregistrées et filtrez par catégorie.' },
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
    window.alert('Merci. Votre message a été enregistré (démo locale).')
    e.target.reset()
  }

  return (
    <div className="cookpal-page help-page">
      <h1 className="cookpal-page__title">Aide</h1>
      <p className="cookpal-page__lead">Guides courts, questions fréquentes et contact.</p>

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
          placeholder="Rechercher (planning, favoris, scanner…)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Recherche dans laide"
        />
      </div>

      {search.trim() && (
        <section className="cookpal-help-card help-section" aria-live="polite">
          <h2 className="help-section__title">Résultats</h2>
          {filteredTopics.length === 0 ? (
            <p className="help-muted">Aucun sujet ne correspond.</p>
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
        <h2 className="help-section__title">Raccourcis</h2>
        <ul className="help-shortcuts">
          <li>
            <Link to="/recipes">Voir les recettes</Link>
          </li>
          <li>
            <Link to="/planning">Planning de la semaine</Link>
          </li>
          <li>
            <Link to="/order">Ma commande</Link>
          </li>
          <li>
            <Link to="/scanner">Scanner produit</Link>
          </li>
          <li>
            <Link to="/profile">Mon profil</Link>
          </li>
        </ul>
      </section>

      <section className="cookpal-help-card help-section">
        <h2 className="help-section__title">Questions fréquentes</h2>
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
