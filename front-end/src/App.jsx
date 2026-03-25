import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Scanner from './pages/Scanner'
import Recipes from './pages/Recipes'
import Planning from './pages/Planning'
import Profile from './pages/Profile'
import SiteNavbar from './components/SiteNavbar'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté (localStorage ou token)
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

  return (
    <div className="app">
      <SiteNavbar isAuthenticated={isAuthenticated} onLogout={handleLogout} />
      <Routes>
        <Route path="/login" element={
          !isAuthenticated ? 
          <Login onLogin={handleLogin} /> : 
          <Navigate to="/dashboard" />
        } />
        <Route path="/register" element={
          !isAuthenticated ? 
          <Register onRegister={handleLogin} /> : 
          <Navigate to="/dashboard" />
        } />
        <Route path="/" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Navigate to="/dashboard" />
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Dashboard user={user} />
          </ProtectedRoute>
        } />
        <Route path="/scanner" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Scanner user={user} />
          </ProtectedRoute>
        } />
        <Route path="/recipes" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Recipes user={user} />
          </ProtectedRoute>
        } />
        <Route path="/planning" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Planning user={user} />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Profile user={user} />
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  )
}

export default App