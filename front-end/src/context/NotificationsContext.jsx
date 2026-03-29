import React, { createContext, useCallback, useContext, useMemo, useState, useEffect } from 'react'

const STORAGE_KEY = 'cookpal-notification-read-ids'

export const DEFAULT_NOTIFICATIONS = [
  { id: '1', icon: '✅', text: 'Commande confirmée' },
  { id: '2', icon: '❤️', text: 'Recette sauvegardée' },
  { id: '3', icon: '📅', text: 'Rappel repas du soir' },
  { id: '4', icon: '🤖', text: 'Nouvelles recettes disponibles' },
]

function loadReadIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return new Set()
    const arr = JSON.parse(raw)
    return new Set(Array.isArray(arr) ? arr : [])
  } catch {
    return new Set()
  }
}

const NotificationsContext = createContext(null)

export function NotificationsProvider({ children }) {
  const [readIds, setReadIds] = useState(loadReadIds)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...readIds]))
  }, [readIds])

  const notifications = useMemo(
    () =>
      DEFAULT_NOTIFICATIONS.map((n) => ({
        ...n,
        read: readIds.has(n.id),
      })),
    [readIds],
  )

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications])

  const markAllAsRead = useCallback(() => {
    setReadIds(new Set(DEFAULT_NOTIFICATIONS.map((n) => n.id)))
  }, [])

  const markAsRead = useCallback((id) => {
    setReadIds((prev) => new Set([...prev, id]))
  }, [])

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      markAllAsRead,
      markAsRead,
    }),
    [notifications, unreadCount, markAllAsRead, markAsRead],
  )

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext)
  if (!ctx) {
    throw new Error('useNotifications must be used within NotificationsProvider')
  }
  return ctx
}
