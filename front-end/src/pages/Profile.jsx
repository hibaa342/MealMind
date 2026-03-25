import React from 'react'

const Profile = ({ user }) => {
  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 480 }}>
        <h2>Profil</h2>
        {user ? (
          <>
            <p><strong>Nom :</strong> {user.name || '—'}</p>
            <p><strong>Email :</strong> {user.email || '—'}</p>
          </>
        ) : (
          <p>Aucune information utilisateur.</p>
        )}
      </div>
    </div>
  )
}

export default Profile
