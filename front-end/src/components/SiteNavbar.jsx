import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

const SiteNavbar = ({ isAuthenticated, onLogout }) => {
  const navigate = useNavigate()

  const handleLogout = () => {
    onLogout()
    navigate('/login')
  }

  if (!isAuthenticated) {
    return (
      <nav style={styles.nav}>
        <div style={styles.logo}>
          <Link to="/" style={styles.logoLink}>🍽️ FridgeScan</Link>
        </div>
        <div style={styles.navLinks}>
          <Link to="/login" style={styles.link}>Connexion</Link>
          <Link to="/register" style={styles.link}>Inscription</Link>
        </div>
      </nav>
    )
  }

  return (
    <nav style={styles.nav}>
      <div style={styles.logo}>
        <Link to="/dashboard" style={styles.logoLink}>🍽️ FridgeScan</Link>
      </div>
      <div style={styles.navLinks}>
        <Link to="/dashboard" style={styles.link}>Tableau de bord</Link>
        <Link to="/scanner" style={styles.link}>Scanner</Link>
        <Link to="/recipes" style={styles.link}>Recettes</Link>
        <Link to="/planning" style={styles.link}>Planning</Link>
        <Link to="/profile" style={styles.link}>Profil</Link>
        <button type="button" onClick={handleLogout} style={styles.logoutBtn}>
          Déconnexion
        </button>
      </div>
    </nav>
  )
}

const styles = {
  nav: {
    backgroundColor: '#4CAF50',
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
  logoLink: {
    color: 'white',
    textDecoration: 'none',
  },
  navLinks: {
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'center',
  },
  link: {
    color: 'white',
    textDecoration: 'none',
    transition: 'opacity 0.3s',
  },
  logoutBtn: {
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
}

export default SiteNavbar
