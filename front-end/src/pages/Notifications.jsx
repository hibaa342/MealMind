import React from 'react'
import { useNotifications } from '../context/NotificationsContext'

const Notifications = () => {
  const { notifications, unreadCount, markAllAsRead, markAsRead } = useNotifications()

  return (
    <div className="cookpal-page cookpal-page--wide">
      <div className="cookpal-notifications__header">
        <div>
          <h1 className="cookpal-page__title">Notifications</h1>
          <p className="cookpal-page__lead cookpal-notifications__suggested">Suggéré</p>
        </div>
        {unreadCount > 0 && (
          <button type="button" className="cookpal-notifications__mark-all" onClick={markAllAsRead}>
            Tout marquer comme lu
          </button>
        )}
      </div>

      <p className="cookpal-notifications__list-label">Liste des notifications :</p>

      <ul className="cookpal-notifications__list" aria-label="Liste des notifications">
        {notifications.map((n) => (
          <li key={n.id}>
            <button
              type="button"
              className={`cookpal-notifications__item ${n.read ? 'cookpal-notifications__item--read' : ''}`}
              onClick={() => !n.read && markAsRead(n.id)}
            >
              <span className="cookpal-notifications__item-icon" aria-hidden>
                {n.icon}
              </span>
              <span className="cookpal-notifications__item-text">{n.text}</span>
              {!n.read && <span className="cookpal-notifications__unread-dot" aria-hidden />}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Notifications
