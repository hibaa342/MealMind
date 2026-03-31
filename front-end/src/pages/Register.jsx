import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getPostAuthPath } from '../utils/onboardingStorage'
import loginBg from '../assets/login-bg.png'
import logo from '../assets/logo.png'

const Register = ({ onRegister }) => {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    birthDate: '',
    city: '',

    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          surname: formData.surname,
          birthDate: formData.birthDate,
          city: formData.city,
          email: formData.email,
          password: formData.password
        })
      })

      const data = await response.json()

      if (response.ok) {
        onRegister(data, data.token)
        navigate(getPostAuthPath(data))
      } else {
        setError(data.message || 'Erreur lors de l\'inscription')
      }
      setLoading(false)
    } catch (err) {
      console.error('Registration error:', err)
      setError('Impossible de se connecter au serveur.')
      setLoading(false)
    }
  }

  return (
    <div className="auth-layout">
      {/* Left Side: Visuals (Same as Login for consistency) */}
      <div className="auth-visual">
        <img src={loginBg} alt="MealMind Background" className="auth-visual-img" />
        <div className="auth-visual-overlay">
          <h1>Rejoignez l'aventure <br /> MealMind.</h1>
          <p>Créez votre compte en quelques secondes et commencez à transformer votre façon de cuisiner et de manger.</p>
        </div>
      </div>

      {/* Right Side: Register Form */}
      <div className="auth-form-container" style={{ paddingTop: '60px', paddingBottom: '60px', overflowY: 'auto' }}>
        <div className="auth-card-modern">
          <img src={logo} alt="MealMind Logo" className="auth-logo-modern" />

          <div className="auth-header-modern">
            <h2>Inscription</h2>
            <p>Créez votre profil pour une expérience sur mesure.</p>
          </div>

          {error && <div className="alert alert-error" style={{ marginBottom: '20px' }}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group-modern">
                <label>Nom</label>
                <input
                  type="text"
                  name="name"
                  className="form-input-modern"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Doe"
                  required
                />
              </div>
              <div className="form-group-modern">
                <label>Prénom</label>
                <input
                  type="text"
                  name="surname"
                  className="form-input-modern"
                  value={formData.surname}
                  onChange={handleChange}
                  placeholder="John"
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group-modern">
                <label>Date de naissance</label>
                <input
                  type="date"
                  name="birthDate"
                  className="form-input-modern"
                  value={formData.birthDate}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group-modern">
                <label>Ville</label>
                <input
                  type="text"
                  name="city"
                  className="form-input-modern"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Paris"
                />
              </div>
            </div>

            <div className="form-group-modern">
              <label>Email</label>
              <input
                type="email"
                name="email"
                className="form-input-modern"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group-modern">
                <label>Mot de passe</label>
                <input
                  type="password"
                  name="password"
                  className="form-input-modern"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="form-group-modern">
                <label>Confirmation</label>
                <input
                  type="password"
                  name="confirmPassword"
                  className="form-input-modern"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-saas-primary" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-small"></span>
                  Création...
                </>
              ) : (
                'Créer mon compte'
              )}
            </button>
          </form>

          <p className="auth-footer-modern">
            Déjà un compte ? <Link to="/login">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
