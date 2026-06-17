import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getPostAuthPath } from '../utils/onboardingStorage'
import snapcookDesign from '../assets/snapcook-design.png'
import './Auth.css' 

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
      const response = await fetch('http://127.0.0.1:5000/api/users/login', {
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
    <div className="snapcook-auth-container">
      {/* Left Side: Image container that crops to only show the green graphic */}
      <div className="snapcook-auth-left">
        <div className="snapcook-image-cropper">
          <img src={snapcookDesign} alt="SnapCook Design Panel" className="snapcook-design-panel-img" />
        </div>
      </div>

      {/* Right Side: Centered Form Panel */}
      <div className="snapcook-auth-right">
        <div className="snapcook-auth-card">
          
          <div className="snapcook-auth-header">
            <h1 className="snapcook-auth-title">WELCOME TO SNAPCOOK.</h1>
            <div className="snapcook-auth-subtitle-row">
              {/* Removed the dates and location from here */}
              <p className="snapcook-auth-subtitle">A Community for Foodies and Adventurous Cooks.</p>
            </div>
          </div>

          {error && <div className="snapcook-alert snapcook-alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="snapcook-form-group">
              <label className="snapcook-form-label" htmlFor="email">Email address</label>
              <input 
                id="email"
                type="email" 
                className="snapcook-form-input"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="snapcook-form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="snapcook-form-label" htmlFor="password">Password</label>
                <a href="#" style={{ fontSize: '0.82rem', color: '#1E2D24', opacity: 0.6, textDecoration: 'none' }}>Forgot?</a>
              </div>
              <input 
                id="password"
                type="password" 
                className="snapcook-form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="snapcook-actions-container">
              {/* Button text changed to Join SnapCook & removed the '12 spots available' label */}
              <button type="submit" className="snapcook-btn-submit" disabled={loading}>
                {loading ? <span className="spinner-inline"></span> : 'Join SnapCook'}
              </button>
            </div>
          </form>

          <p className="snapcook-auth-footer">
            New to SnapCook? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login