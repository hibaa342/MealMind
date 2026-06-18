import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotifications } from '../context/NotificationsContext'

const Notifications = () => {
  const { notifications, unreadCount, markAllAsRead, markAsRead } = useNotifications()
  const navigate = useNavigate()
  const [settings, setSettings] = useState(null)
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    const token = localStorage.getItem('token')
    const API_URL = import.meta.env.VITE_API_URL
    try {
      const res = await fetch(`${API_URL}/api/notifications/settings`, {
        headers: { 'x-auth-token': token }
      })
      if (res.ok) setSettings(await res.json())
    } catch (err) {
      console.error(err)
    }
  }

  const updateSettings = async (newSettings) => {
    const token = localStorage.getItem('token')
    const API_URL = import.meta.env.VITE_API_URL
    setSettings(newSettings)
    try {
      await fetch(`${API_URL}/api/notifications/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify(newSettings)
      })
    } catch (err) {
      console.error(err)
    }
  }

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification._id)
    }
    if (notification.link) {
      navigate(notification.link)
    }
  }

  const getIcon = (type) => {
    if (type === 'warning') return '⚠️'
    if (type === 'success') return '✅'
    return 'ℹ️'
  }

  return (
    <div className="cookpal-page cookpal-page--wide">
      <div className="cookpal-notifications__header">
        <div>
          <h1 className="cookpal-page__title">Activity</h1>
          <p className="cookpal-page__lead">Manage your alerts and interactions</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            type="button" 
            className="cookpal-notifications__mark-all" 
            onClick={() => setShowSettings(!showSettings)}
            style={{ background: showSettings ? 'var(--saas-blue-light)' : 'white' }}
          >
            {showSettings ? 'Close Settings' : '⚙️ Settings'}
          </button>
          {unreadCount > 0 && !showSettings && (
            <button type="button" className="cookpal-notifications__mark-all" onClick={markAllAsRead}>
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {showSettings && settings && (
        <div className="cookpal-panel glass-panel fade-in" style={{ marginBottom: '32px', padding: '24px' }}>
          <h2 className="cookpal-subtitle" style={{ fontSize: '1rem', color: 'var(--saas-slate-800)' }}>Push Notifications</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '16px' }}>
            {/* Pause All */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: 0, fontWeight: 600 }}>Pause All</p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--saas-slate-500)' }}>Temporarily stop all notifications</p>
              </div>
              <input 
                type="checkbox" 
                checked={settings.pauseAll} 
                onChange={(e) => updateSettings({ ...settings, pauseAll: e.target.checked })}
              />
            </div>

            {/* Quiet Mode */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: 0, fontWeight: 600 }}>Quiet Mode</p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--saas-slate-500)' }}>Automatically silence from {settings.quietMode.start} to {settings.quietMode.end}</p>
              </div>
              <input 
                type="checkbox" 
                checked={settings.quietMode.enabled} 
                onChange={(e) => updateSettings({ ...settings, quietMode: { ...settings.quietMode, enabled: e.target.checked } })}
              />
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--saas-slate-100)' }} />
            
            <h2 className="cookpal-subtitle" style={{ fontSize: '0.9rem', marginBottom: '8px' }}>Categories</h2>
            
            {Object.keys(settings.categories).map(cat => (
              <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ margin: 0, fontSize: '0.9rem', textTransform: 'capitalize' }}>
                  {cat.replace(/([A-Z])/g, ' $1')}
                </p>
                <input 
                  type="checkbox" 
                  checked={settings.categories[cat]} 
                  onChange={(e) => updateSettings({ ...settings, categories: { ...settings.categories, [cat]: e.target.checked } })}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {!showSettings && <p className="cookpal-notifications__list-label">Recent Activity</p>}

      {!showSettings && (
        <ul className="cookpal-notifications__list" aria-label="Liste des notifications">
        {notifications.map((n) => (
          <li key={n._id}>
            <button
              type="button"
              className={`cookpal-notifications__item ${n.isRead ? 'cookpal-notifications__item--read' : ''}`}
              onClick={() => handleNotificationClick(n)}
            >
              <span className="cookpal-notifications__item-icon" aria-hidden>
                {getIcon(n.type)}
              </span>
              <div className="cookpal-notifications__item-text">
                <p style={{ margin: 0 }}>{n.text}</p>
                <span style={{ fontSize: '0.75rem', color: 'var(--saas-slate-400)' }}>
                  {new Date(n.createdAt).toLocaleDateString()}
                </span>
              </div>
              {!n.isRead && <span className="cookpal-notifications__unread-dot" aria-hidden />}
            </button>
          </li>
        ))}
        </ul>
      )}
    </div>
  )
}

export default Notifications
