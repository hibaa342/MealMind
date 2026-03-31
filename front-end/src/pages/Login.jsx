import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getPostAuthPath } from '../utils/onboardingStorage'
import loginBg from '../assets/login-bg.png'
import logo from '../assets/logo.png'

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (response.ok) {
        onLogin(data, data.token)
        navigate(getPostAuthPath(data))
      } else {
        setError(data.message || 'Identifiants invalides.')
      }
      setLoading(false)
    } catch (err) {
      console.error('Login error:', err)
      setError('Impossible de se connecter au serveur.')
      setLoading(false)
    }
  }

  return (
    <div className="auth-layout">
      {/* Left Side: Visuals */}
      <div className="auth-visual">
        <img src={loginBg} alt="MealMind Background" className="auth-visual-img" />
        <div className="auth-visual-overlay">
          <h1>Planifiez vos repas, <br /> libérez votre esprit.</h1>
          <p>Rejoignez des milliers de passionnés de cuisine qui utilisent MealMind pour organiser leur nutrition quotidienne avec intelligence.</p>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="auth-form-container">
        <div className="auth-card-modern">
          <img src={logo} alt="MealMind Logo" className="auth-logo-modern" />
          
          <div className="auth-header-modern">
            <h2>Bon retour !</h2>
            <p>Connectez-vous pour accéder à votre cuisine personnalisée.</p>
          </div>

          {error && <div className="alert alert-error" style={{ marginBottom: '20px' }}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group-modern">
              <label htmlFor="email">Email</label>
              <input 
                id="email"
                type="email" 
                className="form-input-modern"
                placeholder="nom@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group-modern">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label htmlFor="password" style={{ marginBottom: 0 }}>Mot de passe</label>
                <a href="#" style={{ fontSize: '0.8rem', color: 'var(--saas-blue)', fontWeight: '500', textDecoration: 'none' }}>Oublié ?</a>
              </div>
              <input 
                id="password"
                type="password" 
                className="form-input-modern"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-saas-primary" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-small"></span>
                  Connexion...
                </>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          <p className="auth-footer-modern">
            Nouveau sur MealMind ? <Link to="/register">Créer un compte</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login