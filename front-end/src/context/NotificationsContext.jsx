import React, { createContext, useCallback, useContext, useMemo, useState, useEffect } from 'react'

const NotificationsContext = createContext(null)

export function NotificationsProvider({ children }) {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) return
    
    try {
      const res = await fetch('http://127.0.0.1:5000/api/notifications', {
        headers: { 'x-auth-token': token }
      })
      const data = await res.json()
      if (res.ok) setNotifications(data)
    } catch (err) {
      console.error('Failed to fetch notifications', err)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const unreadCount = useMemo(() => notifications.filter((n) => !n.isRead).length, [notifications])

  const markAsRead = useCallback(async (id) => {
    const token = localStorage.getItem('token')
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'x-auth-token': token }
      })
      if (res.ok) {
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n))
      }
    } catch (err) {
      console.error('Failed to mark read', err)
    }
  }, [])

  const markAllAsRead = useCallback(() => {
    // Implementation for bulk update would go here
    notifications.forEach(n => !n.isRead && markAsRead(n._id))
  }, [notifications, markAsRead])

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
