import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

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
      // Appel API pour se connecter
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password })
      // })
      
      // Simulation d'une connexion réussie
      setTimeout(() => {
        const mockUser = { id: 1, email, name: 'Gordon Ramsay', title: 'Professional Chef' }
        const mockToken = 'fake-jwt-token'
        onLogin(mockUser, mockToken)
        navigate('/dashboard')
        setLoading(false)
      }, 1000)
    } catch (err) {
      setError('Sign-in failed')
      setLoading(false)
    }
  }

  return (
    <div className="container auth-page">
      <div className="card" style={{ maxWidth: '400px', margin: '32px auto' }}>
        <h2 style={{ marginBottom: 8 }}>Log in</h2>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Mot de passe</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
        <p style={{ marginTop: '15px', textAlign: 'center' }}>
          Pas encore de compte ? <Link to="/register">S'inscrire</Link>
        </p>
      </div>
    </div>
  )
}

export default Login