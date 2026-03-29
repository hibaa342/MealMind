import React from 'react'

const Profile = ({ user }) => {
  return (
    <div className="cookpal-page">
      <h1 className="cookpal-page__title">Settings</h1>
      <p className="cookpal-page__lead">Account details</p>
      <div className="cookpal-help-card">
        {user ? (
          <>
            <p>
              <strong>Name</strong>
              <br />
              {user.name || '—'}
            </p>
            <p style={{ marginTop: 16 }}>
              <strong>Email</strong>
              <br />
              {user.email || '—'}
            </p>
            {user.title && (
              <p style={{ marginTop: 16 }}>
                <strong>Title</strong>
                <br />
                {user.title}
              </p>
            )}
          </>
        ) : (
          <p>No user information.</p>
        )}
      </div>
    </div>
  )
}

export default Profile
