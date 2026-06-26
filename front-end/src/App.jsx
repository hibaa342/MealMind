import React, { useState } from 'react'
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
import Onboarding from './pages/Onboarding'
import AdminDashboard from './pages/AdminDashboard'
// ── Suppression de l'import de SiteNavbar ici ──
import { NotificationsProvider } from './context/NotificationsContext'
import { UserProvider } from './context/UserContext'
import CookPalLayout from './components/CookPalLayout'
import ProtectedRoute from './components/ProtectedRoute'
import RequireOnboarded from './components/RequireOnboarded'
import ErrorBoundary from './components/ErrorBoundary'
import { getPostAuthPath } from './utils/onboardingStorage'
import ChatbotWidget from './components/ChatbotWidget'

function App() {
  const savedToken = localStorage.getItem('token')
  const savedUserText = localStorage.getItem('user')

  let savedUser = null
  if (savedToken && savedUserText) {
    try {
      savedUser = JSON.parse(savedUserText)
    } catch {
      savedUser = null
    }
  }

  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(savedToken && savedUser))
  const [user, setUser] = useState(savedUser)

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
      {/* ── La ligne contenant SiteNavbar a été supprimée d'ici ── */}
      <Routes>
        {/* ── Pages publiques ── */}
        <Route
          path="/login"
          element={
            !isAuthenticated
              ? <Login onLogin={handleLogin} />
              : <Navigate to={getPostAuthPath(user)} replace />
          }
        />
        <Route
          path="/register"
          element={
            !isAuthenticated
              ? <Register onRegister={handleLogin} />
              : <Navigate to={getPostAuthPath(user)} replace />
          }
        />

        {/* ── Application protégée ── */}
        <Route path="/" element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
          <Route path="onboarding" element={<Onboarding user={user} onComplete={handleOnboardingComplete} />} />
          <Route element={<RequireOnboarded />}>
            <Route
              element={
                <UserProvider sessionUser={user}>
                  <CookPalLayout user={user} onLogout={handleLogout} />
                </UserProvider>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="scanner" element={<Scanner user={user} />} />
              <Route path="recipes" element={<ErrorBoundary><Recipes user={user} /></ErrorBoundary>} />
              <Route path="order" element={<Order user={user} />} />
              <Route path="community" element={<Community user={user} />} />
              <Route path="planning" element={<Planning user={user} />} />
              <Route path="profile" element={<Profile user={user} onLogout={handleLogout} />} />
              <Route path="help" element={<Help />} />
              <Route path="favorites" element={<Favorites />} />

              <Route
                path="admin/dashboard"
                element={
                  user && user.role === 'admin'
                    ? <AdminDashboard />
                    : <Navigate to="/dashboard" replace />
                }
              />
            </Route>
          </Route>
        </Route>

        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? getPostAuthPath(user) : '/login'} replace />}
        />
      </Routes>
      {isAuthenticated && <ChatbotWidget />}
    </div>
  )
}

export default App
