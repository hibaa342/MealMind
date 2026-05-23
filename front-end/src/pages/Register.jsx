import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getPostAuthPath } from '../utils/onboardingStorage'
// On importe la même image que pour le Login
import snapcookDesign from '../assets/snapcook-design.png'
import './Auth.css' 

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
      const response = await fetch('http://127.0.0.1:5000/api/users/register', {
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
    <div className="snapcook-auth-container">
      {/* Left Side: Même image recadrée au millimètre près que le Login */}
      <div className="snapcook-auth-left">
        <div className="snapcook-image-cropper">
          <img src={snapcookDesign} alt="SnapCook Design Panel" className="snapcook-design-panel-img" />
        </div>
      </div>

      {/* Right Side: Formulaire d'inscription défilant et propre */}
      <div className="snapcook-auth-right" style={{ overflowY: 'auto' }}>
        <div className="snapcook-auth-card" style={{ padding: '40px 0' }}>
          
          <div className="snapcook-auth-header">
            <h1 className="snapcook-auth-title">INSCRIPTION</h1>
            <p className="snapcook-auth-subtitle">Créez votre profil pour rejoindre la communauté SnapCook.</p>
          </div>

          {error && <div className="snapcook-alert snapcook-alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* Nom & Prénom */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="snapcook-form-group">
                <label className="snapcook-form-label">Nom</label>
                <input
                  type="text"
                  name="name"
                  className="snapcook-form-input"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Doe"
                  required
                />
              </div>
              <div className="snapcook-form-group">
                <label className="snapcook-form-label">Prénom</label>
                <input
                  type="text"
                  name="surname"
                  className="snapcook-form-input"
                  value={formData.surname}
                  onChange={handleChange}
                  placeholder="John"
                  required
                />
              </div>
            </div>

            {/* Date de naissance & Ville */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="snapcook-form-group">
                <label className="snapcook-form-label">Date de naissance</label>
                <input
                  type="date"
                  name="birthDate"
                  className="snapcook-form-input"
                  value={formData.birthDate}
                  onChange={handleChange}
                />
              </div>
              <div className="snapcook-form-group">
                <label className="snapcook-form-label">Ville</label>
                <input
                  type="text"
                  name="city"
                  className="snapcook-form-input"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Paris"
                />
              </div>
            </div>

            {/* Email */}
            <div className="snapcook-form-group">
              <label className="snapcook-form-label">Email address</label>
              <input
                type="email"
                name="email"
                className="snapcook-form-input"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                required
              />
            </div>

            {/* Mots de passe */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="snapcook-form-group">
                <label className="snapcook-form-label">Mot de passe</label>
                <input
                  type="password"
                  name="password"
                  className="snapcook-form-input"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="snapcook-form-group">
                <label className="snapcook-form-label">Confirmation</label>
                <input
                  type="password"
                  name="confirmPassword"
                  className="snapcook-form-input"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="snapcook-actions-container">
              <button type="submit" className="snapcook-btn-submit" disabled={loading}>
                {loading ? <span className="spinner-inline"></span> : 'Join SnapCook'}
              </button>
            </div>
          </form>

          <p className="snapcook-auth-footer">
            Déjà un compte ? <Link to="/login">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register