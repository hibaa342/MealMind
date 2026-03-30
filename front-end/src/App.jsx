import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Scanner from './pages/Scanner'
import Recipes from './pages/Recipes'
import Planning from './pages/Planning'
import Community from './pages/Community'
import Profile from './pages/Profile'
import Help from './pages/Help'
import Favorites from './pages/Favorites'
import Order from './pages/Order'
import Notifications from './pages/Notifications'
import Onboarding from './pages/Onboarding'
import SiteNavbar from './components/SiteNavbar'
import { NotificationsProvider } from './context/NotificationsContext'
import CookPalLayout from './components/CookPalLayout'
import ProtectedRoute from './components/ProtectedRoute'
import RequireOnboarded from './components/RequireOnboarded'
import { getPostAuthPath } from './utils/onboardingStorage'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (token && userData) {
      setIsAuthenticated(true)
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setIsAuthenticated(true)
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsAuthenticated(false)
    setUser(null)
  }

  const handleOnboardingComplete = (updatedUser) => {
    localStorage.setItem('user', JSON.stringify(updatedUser))
    setUser(updatedUser)
  }

  return (
    <div className="app">
      {!isAuthenticated && <SiteNavbar />}
      <Routes>
        <Route
          path="/login"
          element={
            !isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to={getPostAuthPath(user)} replace />
          }
        />
        <Route
          path="/register"
          element={
            !isAuthenticated ? <Register onRegister={handleLogin} /> : <Navigate to={getPostAuthPath(user)} replace />
          }
        />
        <Route path="/" element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
        <Route path="onboarding" element={<Onboarding user={user} onComplete={handleOnboardingComplete} />} />
          <Route element={<RequireOnboarded />}>
            <Route
              element={
                <NotificationsProvider>
                  <CookPalLayout user={user} onLogout={handleLogout} />
                </NotificationsProvider>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="scanner" element={<Scanner user={user} />} />
              <Route path="recipes" element={<Recipes user={user} />} />
              {/* --- Vos routes ajoutées --- */}
              <Route path="order" element={<Order user={user} />} />
              <Route path="community" element={<Community user={user} />} />
              {/* --------------------------- */}
              <Route path="planning" element={<Planning user={user} />} />
              <Route path="profile" element={<Profile user={user} onLogout={handleLogout} />} />
              <Route path="help" element={<Help />} />
              <Route path="favorites" element={<Favorites />} />
              <Route path="notifications" element={<Notifications />} />
            </Route>
          </Route>
          
        </Route>
        <Route path="*" element={<Navigate to={isAuthenticated ? getPostAuthPath(user) : '/login'} replace />} />
      </Routes>
    </div>
  )
}

export default App
