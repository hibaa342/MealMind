import React from 'react'

const Dashboard = ({ user }) => {
  return (
    <div className="container">
      <div className="card">
        <h1>Tableau de bord</h1>
        <p>Bienvenue{user?.name ? `, ${user.name}` : ''}.</p>
        <p>Utilisez le menu pour scanner votre frigo, consulter des recettes ou planifier vos repas.</p>
      </div>
    </div>
  )
}

export default Dashboard
