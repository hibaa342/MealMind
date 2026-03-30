import React, { useMemo, useState } from 'react'

const initialMissingIngredients = [
  { id: 1, name: 'Tomates', quantity: '1 kg', price: 18 },
  { id: 2, name: 'Poulet', quantity: '750 g', price: 62 },
  { id: 3, name: 'Fromage rape', quantity: '300 g', price: 34 },
  { id: 4, name: 'Huile d olive', quantity: '1 bouteille', price: 45 },
]

const recentOrdersSeed = [
  { id: 'CMD-2026-102', date: '24/03/2026', store: 'Marjane', total: 132 },
  { id: 'CMD-2026-097', date: '18/03/2026', store: 'Carrefour', total: 168 },
  { id: 'CMD-2026-091', date: '10/03/2026', store: 'Marjane', total: 96 },
]

const Order = () => {
  const [store, setStore] = useState('Marjane')
  const [items, setItems] = useState(initialMissingIngredients)
  const [recentOrders, setRecentOrders] = useState(recentOrdersSeed)
  const [isConfirmed, setIsConfirmed] = useState(false)

  const total = useMemo(() => items.reduce((sum, item) => sum + item.price, 0), [items])

  const removeItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const refillItems = () => {
    setItems(initialMissingIngredients)
    setIsConfirmed(false)
  }

  const confirmOrder = () => {
    if (items.length === 0) return

    const now = new Date()
    const orderId = `CMD-${now.getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`
    const orderDate = now.toLocaleDateString('fr-FR')

    const newOrder = {
      id: orderId,
      date: orderDate,
      store,
      total,
    }

    setRecentOrders((prev) => [newOrder, ...prev].slice(0, 4))
    setItems([])
    setIsConfirmed(true)
  }

  return (
    <div className="cookpal-page cookpal-order-page">
      <h1 className="cookpal-page__title">Ma commande</h1>
      <p className="cookpal-page__lead">Finalisez votre panier d ingredients manquants.</p>

      <section className="cookpal-panel">
        {items.length === 0 ? (
          <div className="cookpal-empty-state">
            <p className="cookpal-empty">Liste de commande vide.</p>
            <p className="cookpal-page__lead" style={{ marginBottom: 10 }}>Ajoutez des ingredients pour preparer votre prochaine commande.</p>
            <button type="button" className="btn btn-primary" onClick={refillItems}>
              Ajouter des ingredients exemples
            </button>
          </div>
        ) : (
          <div className="cookpal-order-list">
            {items.map((item) => (
              <article className="cookpal-order-item" key={item.id}>
                <div>
                  <h3>{item.name}</h3>
                  <p>Quantite estimee: {item.quantity}</p>
                </div>
                <div className="cookpal-order-item__right">
                  <strong>{item.price} MAD</strong>
                  <button type="button" onClick={() => removeItem(item.id)} aria-label={`Supprimer ${item.name}`}>
                    X
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="cookpal-order-controls">
          <label htmlFor="store">Supermarche</label>
          <select id="store" value={store} onChange={(e) => setStore(e.target.value)}>
            <option value="Marjane">Marjane</option>
            <option value="Carrefour">Carrefour</option>
          </select>
        </div>

        <div className="cookpal-order-footer">
          <p>
            Total estime <strong>{total} MAD</strong>
          </p>
          <button type="button" className="btn btn-primary" onClick={confirmOrder} disabled={items.length === 0}>
            Confirmer la commande
          </button>
        </div>

        {isConfirmed && <p className="cookpal-success">Commande envoyee avec succes.</p>}
      </section>

      <section className="cookpal-panel">
        <h2 className="cookpal-subtitle">Historique rapide</h2>
        <div className="cookpal-history-list">
          {recentOrders.map((order) => (
            <div className="cookpal-history-item" key={order.id}>
              <span>{order.id}</span>
              <span>{order.date}</span>
              <span>{order.store}</span>
              <strong>{order.total} MAD</strong>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Order
