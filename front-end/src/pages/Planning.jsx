import React, { useMemo, useState } from 'react'

const spendingByWeek = [
  { week: 'S1', amount: 210 },
  { week: 'S2', amount: 320 },
  { week: 'S3', amount: 170 },
  { week: 'S4', amount: 285 },
]

const orderHistory = [
  { id: 'CMD-2026-102', date: '24/03/2026', total: 132 },
  { id: 'CMD-2026-097', date: '18/03/2026', total: 168 },
  { id: 'CMD-2026-091', date: '10/03/2026', total: 96 },
  { id: 'CMD-2026-085', date: '03/03/2026', total: 154 },
]

const weekDays = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

const defaultPlanning = {
  Lundi: { lunch: 'Salade Cesar', dinner: 'Poulet grille' },
  Mardi: { lunch: 'Wrap thon', dinner: 'Pates legumes' },
  Mercredi: { lunch: 'Soupe de lentilles', dinner: 'Poisson au four' },
  Jeudi: { lunch: 'Riz poulet', dinner: 'Tacos maison' },
  Vendredi: { lunch: 'Bowl quinoa', dinner: 'Pizza healthy' },
  Samedi: { lunch: 'Couscous veggie', dinner: 'Burger maison' },
  Dimanche: { lunch: 'Tajine', dinner: 'Soupe + salade' },
}

const Planning = () => {
  const [planning, setPlanning] = useState(defaultPlanning)
  const [selectedRecipe, setSelectedRecipe] = useState('')

  const monthlyTotal = useMemo(() => orderHistory.reduce((sum, order) => sum + order.total, 0), [])
  const mostOrderedIngredient = 'Tomates'
  const maxWeekAmount = Math.max(...spendingByWeek.map((w) => w.amount))

  const addMeal = (day) => {
    const mealName = window.prompt(`Ajouter un repas pour ${day}`)
    if (!mealName) return

    setPlanning((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        dinner: mealName,
      },
    }))
  }

  const openRecipe = (mealName) => {
    setSelectedRecipe(mealName)
  }

  return (
    <div className="cookpal-page cookpal-planning-page">
      <h1 className="cookpal-page__title">Planning & Budget</h1>
      <p className="cookpal-page__lead">Suivez vos depenses et organisez vos repas de la semaine.</p>

      <section className="cookpal-panel">
        <h2 className="cookpal-subtitle">Resume budget mensuel</h2>
        <div className="cookpal-kpis">
          <article>
            <span>Total depense</span>
            <strong>{monthlyTotal} MAD</strong>
          </article>
          <article>
            <span>Nombre de commandes</span>
            <strong>{orderHistory.length}</strong>
          </article>
          <article>
            <span>Ingredient le plus commande</span>
            <strong>{mostOrderedIngredient}</strong>
          </article>
        </div>

        <h3 className="cookpal-chart-title">Depenses par semaine</h3>
        <div className="cookpal-bar-chart" aria-label="Depenses par semaine">
          {spendingByWeek.map((week) => (
            <div className="cookpal-bar-chart__item" key={week.week}>
              <div className="cookpal-bar-chart__bar-wrap">
                <div className="cookpal-bar-chart__bar" style={{ height: `${(week.amount / maxWeekAmount) * 100}%` }} />
              </div>
              <span>{week.week}</span>
              <small>{week.amount} MAD</small>
            </div>
          ))}
        </div>
      </section>

      <section className="cookpal-panel">
        <h2 className="cookpal-subtitle">Planning de la semaine</h2>
        <div className="cookpal-week-grid">
          {weekDays.map((day) => (
            <article className="cookpal-day-card" key={day}>
              <h3>{day}</h3>
              <p>
                Midi:{' '}
                <button type="button" onClick={() => openRecipe(planning[day].lunch)}>
                  {planning[day].lunch}
                </button>
              </p>
              <p>
                Soir:{' '}
                <button type="button" onClick={() => openRecipe(planning[day].dinner)}>
                  {planning[day].dinner}
                </button>
              </p>
              <button type="button" className="cookpal-add-btn" onClick={() => addMeal(day)}>
                Ajouter un repas
              </button>
            </article>
          ))}
        </div>
        {selectedRecipe && (
          <p className="cookpal-inline-note">Detail recette ouvert: <strong>{selectedRecipe}</strong></p>
        )}
      </section>

      <section className="cookpal-panel">
        <h2 className="cookpal-subtitle">Historique des commandes</h2>
        <div className="cookpal-history-list">
          {orderHistory.map((order) => (
            <div className="cookpal-history-item" key={order.id}>
              <span>{order.id}</span>
              <span>{order.date}</span>
              <strong>{order.total} MAD</strong>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Planning
