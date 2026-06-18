import React, { useState, useEffect } from 'react'
import './AdminDashboard.css'

const IconUsers = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

const IconRecipe = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5V4.5A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
)

const IconActivity = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
)

const IconSearch = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

const IconTrash = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
)

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [statsData, setStatsData] = useState(null)
  const [usersList, setUsersList] = useState([])
  const [recipesList, setRecipesList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [toast, setToast] = useState(null)

  const token = localStorage.getItem('token')

  const triggerToast = (message, isError = false) => {
    setToast({ message, isError })
    setTimeout(() => {
      setToast(null)
    }, 4000)
  }

  const fetchOverviewData = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed to fetch statistics.')
      const data = await res.json()
      setStatsData(data)
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed to fetch users list.')
      const data = await res.json()
      setUsersList(data)
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchRecipes = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/recipes', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed to fetch recipes list.')
      const data = await res.json()
      setRecipesList(data)
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Load data depending on the active tab
  useEffect(() => {
    setSearchQuery('')
    if (activeTab === 'overview') {
      fetchOverviewData()
    } else if (activeTab === 'users') {
      fetchUsers()
    } else if (activeTab === 'recipes') {
      fetchRecipes()
    }
  }, [activeTab])

  // Handle user role update
  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || 'Failed to update user role.')
      }

      triggerToast(`User role updated to ${newRole} successfully!`)
      // Refresh list
      fetchUsers()
    } catch (err) {
      triggerToast(err.message, true)
    }
  }

  // Handle user deletion
  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}" and all their custom recipes? This action cannot be undone.`)) {
      return
    }

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || 'Failed to delete user.')
      }

      triggerToast('User and their data deleted successfully!')
      fetchUsers()
    } catch (err) {
      triggerToast(err.message, true)
    }
  }

  // Handle recipe deletion (moderation)
  const handleDeleteRecipe = async (recipeId, recipeTitle) => {
    if (!window.confirm(`Are you sure you want to delete the recipe "${recipeTitle}"? This action cannot be undone.`)) {
      return
    }

    try {
      const res = await fetch(`/api/admin/recipes/${recipeId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || 'Failed to moderate recipe.')
      }

      triggerToast('Recipe deleted successfully by admin moderation.')
      fetchRecipes()
    } catch (err) {
      triggerToast(err.message, true)
    }
  }

  // Filter lists based on search queries
  const filteredUsers = usersList.filter(user => 
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.surname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredRecipes = recipesList.filter(recipe => 
    recipe.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipe.categories?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    `${recipe.user?.name || ''} ${recipe.user?.surname || ''}`.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="admin-dashboard">
      {toast && (
        <div className="admin-toast">
          <span>{toast.message}</span>
          <button className="admin-toast__close" onClick={() => setToast(null)}>✕</button>
        </div>
      )}

      <header className="admin-header">
        <div className="admin-title-area">
          <h1>Admin Control Panel</h1>
          <p className="admin-subtitle">Manage system users, monitor user recipes, and view database statistics.</p>
        </div>
      </header>

      {/* Tabs Menu */}
      <nav className="admin-tabs">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`admin-tab-btn ${activeTab === 'overview' ? 'admin-tab-btn--active' : ''}`}
        >
          <IconActivity />
          Overview
        </button>
        <button 
          onClick={() => setActiveTab('users')}
          className={`admin-tab-btn ${activeTab === 'users' ? 'admin-tab-btn--active' : ''}`}
        >
          <IconUsers />
          User Management
        </button>
        <button 
          onClick={() => setActiveTab('recipes')}
          className={`admin-tab-btn ${activeTab === 'recipes' ? 'admin-tab-btn--active' : ''}`}
        >
          <IconRecipe />
          Recipe Moderation
        </button>
      </nav>

      {error && (
        <div style={{ background: '#ffebee', color: '#c62828', padding: '16px', borderRadius: '12px', marginBottom: '20px', fontWeight: 600 }}>
          Error: {error}
        </div>
      )}

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div>
          {loading && !statsData ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#5c7068', fontWeight: 600 }}>Loading system statistics...</div>
          ) : (
            <>
              <div className="admin-stats-grid">
                <div className="admin-stat-card">
                  <div className="admin-stat-content">
                    <h3>Total Registered Users</h3>
                    <p className="admin-stat-number">{statsData?.stats?.totalUsers || 0}</p>
                  </div>
                  <div className="admin-stat-icon">
                    <IconUsers />
                  </div>
                </div>

                <div className="admin-stat-card">
                  <div className="admin-stat-content">
                    <h3>Total Shared Recipes</h3>
                    <p className="admin-stat-number">{statsData?.stats?.totalRecipes || 0}</p>
                  </div>
                  <div className="admin-stat-icon">
                    <IconRecipe />
                  </div>
                </div>

                <div className="admin-stat-card">
                  <div className="admin-stat-content">
                    <h3>System Health Status</h3>
                    <p className="admin-stat-number" style={{ fontSize: '1.4rem', color: '#2d6a4f' }}>OPERATIONAL</p>
                  </div>
                  <div className="admin-stat-icon" style={{ background: '#e8f5e9', color: '#2d6a4f' }}>
                    <IconActivity />
                  </div>
                </div>
              </div>

              <div className="admin-recent-grid">
                {/* Recent Users List */}
                <div className="admin-recent-card">
                  <h2>Recently Joined Users</h2>
                  {statsData?.recentUsers?.length === 0 ? (
                    <p style={{ color: '#5c7068', fontSize: '0.9rem' }}>No recent users.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {statsData?.recentUsers?.map(user => (
                        <div key={user._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', borderBottom: '1px solid rgba(0,0,0,0.04)', paddingBottom: '8px' }}>
                          <div>
                            <span style={{ fontWeight: 700 }}>{user.name} {user.surname}</span>
                            <span style={{ color: '#5c7068', marginLeft: '8px' }}>({user.email})</span>
                          </div>
                          <span className={`admin-badge admin-badge--${user.role}`}>{user.role}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Recipes List */}
                <div className="admin-recent-card">
                  <h2>Recently Added Recipes</h2>
                  {statsData?.recentRecipes?.length === 0 ? (
                    <p style={{ color: '#5c7068', fontSize: '0.9rem' }}>No recipes added yet.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {statsData?.recentRecipes?.map(recipe => (
                        <div key={recipe._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', borderBottom: '1px solid rgba(0,0,0,0.04)', paddingBottom: '8px' }}>
                          <div>
                            <span style={{ fontWeight: 700 }}>{recipe.title}</span>
                            <span style={{ color: '#5c7068', marginLeft: '6px' }}>in {recipe.categories}</span>
                          </div>
                          <span style={{ fontSize: '0.8rem', color: '#778899', fontWeight: 600 }}>
                            by {recipe.user?.name || 'Unknown'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Tab 2: User Management */}
      {activeTab === 'users' && (
        <div>
          <div className="admin-search-bar">
            <input 
              type="text" 
              placeholder="Search users by name or email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-search-input"
            />
          </div>

          {loading && usersList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#5c7068', fontWeight: 600 }}>Loading users directory...</div>
          ) : (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User Details</th>
                    <th>Email Address</th>
                    <th>Joined Date</th>
                    <th>System Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textCenter: 'center', padding: '30px', color: '#5c7068' }}>
                        No users found matching search query.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(user => (
                      <tr key={user._id}>
                        <td>
                          <div className="admin-avatar-name">
                            <div className="admin-avatar">
                              {user.name ? user.name[0].toUpperCase() : 'U'}
                            </div>
                            <div>
                              <strong style={{ display: 'block', color: 'var(--snap-forest)' }}>
                                {user.name} {user.surname}
                              </strong>
                              <span style={{ fontSize: '0.75rem', color: '#778899' }}>ID: {user._id}</span>
                            </div>
                          </div>
                        </td>
                        <td>{user.email}</td>
                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td>
                          <select 
                            value={user.role} 
                            onChange={(e) => handleRoleChange(user._id, e.target.value)}
                            className="admin-select"
                          >
                            <option value="user">Standard User</option>
                            <option value="admin">Administrator</option>
                          </select>
                        </td>
                        <td>
                          <button 
                            onClick={() => handleDeleteUser(user._id, `${user.name} ${user.surname}`)}
                            className="admin-btn"
                          >
                            <IconTrash />
                            Delete Account
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Recipe Moderation */}
      {activeTab === 'recipes' && (
        <div>
          <div className="admin-search-bar">
            <input 
              type="text" 
              placeholder="Search recipes by title, category, author..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-search-input"
            />
          </div>

          {loading && recipesList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#5c7068', fontWeight: 600 }}>Loading recipes catalog...</div>
          ) : (
            <div className="admin-recipes-grid">
              {filteredRecipes.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#5c7068', background: '#fff', borderRadius: '20px', border: '1px solid rgba(45,106,79,0.08)' }}>
                  No recipes found matching search query.
                </div>
              ) : (
                filteredRecipes.map(recipe => (
                  <div className="admin-recipe-card" key={recipe._id}>
                    <img 
                      src={recipe.image || 'https://via.placeholder.com/300'} 
                      alt={recipe.title} 
                      className="admin-recipe-image"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/300' }}
                    />
                    <div className="admin-recipe-content">
                      <div>
                        <h3 className="admin-recipe-title">{recipe.title}</h3>
                        <p className="admin-recipe-author">
                          Added by <strong>{recipe.user?.name || 'Unknown'} {recipe.user?.surname || ''}</strong>
                        </p>
                      </div>
                      <div className="admin-recipe-footer">
                        <span className="snapcook-pill" style={{ background: '#e8f5e9', color: '#2d6a4f' }}>
                          {recipe.categories}
                        </span>
                        <button 
                          onClick={() => handleDeleteRecipe(recipe._id, recipe.title)}
                          className="admin-btn"
                          style={{ padding: '6px 12px' }}
                        >
                          <IconTrash />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
