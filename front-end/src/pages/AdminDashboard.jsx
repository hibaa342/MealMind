import React, { useState, useEffect } from 'react'
import './AdminDashboard.css'

// ── Icons ────────────────────────────────────────────────────────────────────

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

const IconCalendar = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)

const IconBell = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
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

const IconShield = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)

const IconClipboard = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="8" y="2" width="8" height="4" rx="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <line x1="9" y1="12" x2="15" y2="12" />
    <line x1="9" y1="16" x2="15" y2="16" />
  </svg>
)

const IconChartBar = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <line x1="12" y1="20" x2="12" y2="10" />
    <line x1="18" y1="20" x2="18" y2="4" />
    <line x1="6" y1="20" x2="6" y2="16" />
  </svg>
)

const IconServer = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="2" y="3" width="20" height="6" rx="1" />
    <rect x="2" y="15" width="20" height="6" rx="1" />
    <line x1="6" y1="6" x2="6" y2="6" />
    <line x1="6" y1="18" x2="6" y2="18" />
  </svg>
)

// ── Mini bar chart ─────────────────────────────────────────────────────────
// data is a list of objects like { _id: "2026-06-20", count: 5 }

const MiniBarChart = ({ data, colorVar = '--snap-forest' }) => {
  if (!data || data.length === 0) {
    return <p style={{ color: '#5c7068', fontSize: '0.85rem' }}>No data available.</p>
  }

  let maxCount = 1
  for (let i = 0; i < data.length; i++) {
    if (data[i].count > maxCount) {
      maxCount = data[i].count
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {data.map((item, index) => {
        const percentage = (item.count / maxCount) * 100

        return (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem' }}>
            <span style={{ width: '90px', flexShrink: 0, color: '#5c7068', fontWeight: 600, textTransform: 'capitalize' }}>
              {item._id || 'N/A'}
            </span>
            <div style={{ flex: 1, background: 'rgba(45,106,79,0.08)', borderRadius: '6px', height: '10px', overflow: 'hidden' }}>
              <div style={{
                width: `${percentage}%`,
                background: `var(${colorVar})`,
                height: '100%',
                borderRadius: '6px',
                transition: 'width 0.6s ease'
              }} />
            </div>
            <span style={{ width: '28px', textAlign: 'right', fontWeight: 700, color: 'var(--snap-forest, #2d6a4f)' }}>
              {item.count}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ── Helper: status pill label ───────────────────────────────────────────────

const StatusPill = ({ status }) => (
  <span className={`admin-status-pill admin-status-pill--${status}`}>{status}</span>
)

// ── Main component ───────────────────────────────────────────────────────────

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [toast, setToast] = useState(null)

  const token = localStorage.getItem('token')

  // Data for each section
  const [statsData, setStatsData] = useState(null)
  const [usersList, setUsersList] = useState([])
  const [recipesList, setRecipesList] = useState([])
  const [activityLogs, setActivityLogs] = useState([])
  const [analyticsData, setAnalyticsData] = useState(null)
  const [systemData, setSystemData] = useState(null)

  // Content Management filters
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sortOption, setSortOption] = useState('newest')

  // Product details panel
  const [selectedRecipe, setSelectedRecipe] = useState(null)

  const triggerToast = (message, isError = false) => {
    setToast({ message, isError })
    setTimeout(() => setToast(null), 4000)
  }

  // ── Fetch functions ────────────────────────────────────────────────────────

  const fetchOverviewData = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Unable to load dashboard statistics.')
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
      if (!res.ok) throw new Error('Unable to load the user list.')
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
      if (!res.ok) throw new Error('Unable to load products.')
      const data = await res.json()
      setRecipesList(data)
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchActivityLogs = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/activity-logs', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Unable to load activity logs.')
      const data = await res.json()
      setActivityLogs(data)
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/analytics', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Unable to load analytics.')
      const data = await res.json()
      setAnalyticsData(data)
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchSystemOverview = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/system-overview', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Unable to load system overview.')
      const data = await res.json()
      setSystemData(data)
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setSearchQuery('')
    if (activeTab === 'overview') fetchOverviewData()
    else if (activeTab === 'users') fetchUsers()
    else if (activeTab === 'content') fetchRecipes()
    else if (activeTab === 'logs') fetchActivityLogs()
    else if (activeTab === 'analytics') fetchAnalytics()
    else if (activeTab === 'system') fetchSystemOverview()
  }, [activeTab])

  // ── User Management handlers ────────────────────────────────────────────

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role: newRole })
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || 'Failed to update role.')
      }
      triggerToast(`Role updated to: ${newRole}`)
      fetchUsers()
    } catch (err) {
      triggerToast(err.message, true)
    }
  }

  const handleToggleUserStatus = async (userId, currentlyActive) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isActive: !currentlyActive })
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || 'Failed to update account status.')
      }
      triggerToast(currentlyActive ? 'Account deactivated.' : 'Account activated.')
      fetchUsers()
    } catch (err) {
      triggerToast(err.message, true)
    }
  }

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Delete "${userName}" and all their products? This action is irreversible.`)) return
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || 'Failed to delete user.')
      }
      triggerToast('User deleted successfully.')
      fetchUsers()
    } catch (err) {
      triggerToast(err.message, true)
    }
  }

  // ── Content Management handlers ─────────────────────────────────────────

  const handleRecipeStatusChange = async (recipeId, newStatus) => {
    try {
      const res = await fetch(`/api/admin/recipes/${recipeId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || 'Failed to update product status.')
      }
      triggerToast(`Product marked as ${newStatus}.`)
      fetchRecipes()
      setSelectedRecipe(null)
    } catch (err) {
      triggerToast(err.message, true)
    }
  }

  const handleDeleteRecipe = async (recipeId, recipeTitle) => {
    if (!window.confirm(`Delete the product "${recipeTitle}"? This action is irreversible.`)) return
    try {
      const res = await fetch(`/api/admin/recipes/${recipeId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || 'Failed to delete product.')
      }
      triggerToast('Product deleted.')
      fetchRecipes()
      setSelectedRecipe(null)
    } catch (err) {
      triggerToast(err.message, true)
    }
  }

  // ── Search / filter / sort (Content Management) ────────────────────────

  const search = searchQuery.toLowerCase()

  const filteredUsers = usersList.filter(u => {
    const name = (u.name || '').toLowerCase()
    const surname = (u.surname || '').toLowerCase()
    const email = (u.email || '').toLowerCase()
    return name.includes(search) || surname.includes(search) || email.includes(search)
  })

  // Unique category list, built from the products we already have
  const availableCategories = []
  for (let i = 0; i < recipesList.length; i++) {
    const category = recipesList[i].categories
    if (category && availableCategories.indexOf(category) === -1) {
      availableCategories.push(category)
    }
  }

  let filteredRecipes = recipesList.filter(r => {
    const title = (r.title || '').toLowerCase()
    const creatorName = `${r.user?.name || ''} ${r.user?.surname || ''}`.toLowerCase()
    const matchesSearch = title.includes(search) || creatorName.includes(search)
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter
    const matchesCategory = categoryFilter === 'all' || r.categories === categoryFilter
    return matchesSearch && matchesStatus && matchesCategory
  })

  if (sortOption === 'alphabetical') {
    filteredRecipes = [...filteredRecipes].sort((a, b) => (a.title || '').localeCompare(b.title || ''))
  } else {
    filteredRecipes = [...filteredRecipes].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

  const stats = statsData?.stats

  return (
    <div className="admin-dashboard">

      {/* Toast */}
      {toast && (
        <div className={`admin-toast${toast.isError ? ' admin-toast--error' : ''}`}>
          <span>{toast.message}</span>
          <button className="admin-toast__close" onClick={() => setToast(null)}>✕</button>
        </div>
      )}

      {/* Header */}
      <header className="admin-header">
        <div className="admin-title-area">
          <h1>Admin Control Panel</h1>
          <p className="admin-subtitle">Manage users, content and view application insights.</p>
        </div>
      </header>

      {/* Tabs */}
      <nav className="admin-tabs">
        <button
          onClick={() => setActiveTab('overview')}
          className={activeTab === 'overview' ? 'admin-tab-btn admin-tab-btn--active' : 'admin-tab-btn'}
        >
          <IconActivity />
          Dashboard
        </button>

        <button
          onClick={() => setActiveTab('content')}
          className={activeTab === 'content' ? 'admin-tab-btn admin-tab-btn--active' : 'admin-tab-btn'}
        >
          <IconRecipe />
          Content Management
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={activeTab === 'users' ? 'admin-tab-btn admin-tab-btn--active' : 'admin-tab-btn'}
        >
          <IconUsers />
          Users
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={activeTab === 'logs' ? 'admin-tab-btn admin-tab-btn--active' : 'admin-tab-btn'}
        >
          <IconClipboard />
          Activity Logs
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={activeTab === 'analytics' ? 'admin-tab-btn admin-tab-btn--active' : 'admin-tab-btn'}
        >
          <IconChartBar />
          Analytics
        </button>

        <button
          onClick={() => setActiveTab('system')}
          className={activeTab === 'system' ? 'admin-tab-btn admin-tab-btn--active' : 'admin-tab-btn'}
        >
          <IconServer />
          System Overview
        </button>
      </nav>

      {/* Global error */}
      {error && (
        <div style={{ background: '#ffebee', color: '#c62828', padding: '16px', borderRadius: '12px', marginBottom: '20px', fontWeight: 600 }}>
          Error: {error}
        </div>
      )}

      {/* ── TAB: Dashboard ─────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div>
          {loading && !statsData ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#5c7068', fontWeight: 600 }}>
              Loading statistics...
            </div>
          ) : (
            <>
              <div className="admin-stats-grid">

                <div className="admin-stat-card">
                  <div className="admin-stat-content">
                    <h3>Registered Users</h3>
                    <p className="admin-stat-number">{stats?.totalUsers ?? 0}</p>
                    <span className="admin-stat-sub">+{stats?.newUsersThisWeek ?? 0} this week</span>
                  </div>
                  <div className="admin-stat-icon"><IconUsers /></div>
                </div>

                <div className="admin-stat-card">
                  <div className="admin-stat-content">
                    <h3>Active Users</h3>
                    <p className="admin-stat-number">{stats?.activeUsers ?? 0}</p>
                    <span className="admin-stat-sub">{stats?.inactiveUsers ?? 0} deactivated</span>
                  </div>
                  <div className="admin-stat-icon" style={{ background: '#fff3e0', color: '#e65100' }}>
                    <IconShield />
                  </div>
                </div>

                <div className="admin-stat-card">
                  <div className="admin-stat-content">
                    <h3>Total Products</h3>
                    <p className="admin-stat-number">{stats?.totalRecipes ?? 0}</p>
                    <span className="admin-stat-sub">+{stats?.recipesAddedThisWeek ?? 0} this week</span>
                  </div>
                  <div className="admin-stat-icon"><IconRecipe /></div>
                </div>

                <div className="admin-stat-card">
                  <div className="admin-stat-content">
                    <h3>Total Favorites</h3>
                    <p className="admin-stat-number">{stats?.totalFavorites ?? 0}</p>
                    <span className="admin-stat-sub">saved by users</span>
                  </div>
                  <div className="admin-stat-icon" style={{ background: '#fce4ec', color: '#880e4f' }}>
                    <IconBell />
                  </div>
                </div>

              </div>

              <div className="admin-recent-grid">

                <div className="admin-recent-card">
                  <h2>Recently Registered Users</h2>
                  {!statsData?.recentUsers?.length ? (
                    <p style={{ color: '#5c7068', fontSize: '0.9rem' }}>No recent users.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {statsData.recentUsers.map(u => (
                        <div key={u._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem', borderBottom: '1px solid rgba(0,0,0,0.04)', paddingBottom: '8px' }}>
                          <div>
                            <span style={{ fontWeight: 700 }}>{u.name} {u.surname}</span>
                            <span style={{ color: '#5c7068', marginLeft: '8px' }}>({u.email})</span>
                          </div>
                          <span className={`admin-badge admin-badge--${u.role}`}>{u.role}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="admin-recent-card">
                  <h2>Recent Products</h2>
                  {!statsData?.recentRecipes?.length ? (
                    <p style={{ color: '#5c7068', fontSize: '0.9rem' }}>No recent products.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {statsData.recentRecipes.map(r => (
                        <div key={r._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem', borderBottom: '1px solid rgba(0,0,0,0.04)', paddingBottom: '8px' }}>
                          <div>
                            <span style={{ fontWeight: 700 }}>{r.title}</span>
                            <span style={{ color: '#5c7068', marginLeft: '6px' }}>— {r.categories}</span>
                          </div>
                          <span style={{ fontSize: '0.8rem', color: '#778899', fontWeight: 600 }}>
                            {r.user?.name || 'Unknown'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="admin-recent-card">
                  <h2>Most Active Users</h2>
                  {!statsData?.mostActiveUsers?.length ? (
                    <p style={{ color: '#5c7068', fontSize: '0.9rem' }}>No data available.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {statsData.mostActiveUsers.map(u => (
                        <div key={u._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem', borderBottom: '1px solid rgba(0,0,0,0.04)', paddingBottom: '8px' }}>
                          <span style={{ fontWeight: 700 }}>{u.name} {u.surname}</span>
                          <span style={{ fontSize: '0.8rem', color: '#778899', fontWeight: 600 }}>
                            {u.productCount} product{u.productCount > 1 ? 's' : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="admin-recent-card">
                  <h2>Meal Plans per Day</h2>
                  <MiniBarChart data={statsData?.charts?.mealPlansByDay} />
                </div>

                <div className="admin-recent-card">
                  <h2>Meal Plans per Type</h2>
                  <MiniBarChart data={statsData?.charts?.mealPlansByType} colorVar="--snap-sage" />
                </div>

                <div className="admin-recent-card">
                  <h2>Ingredients by Category</h2>
                  <MiniBarChart data={statsData?.charts?.ingredientsByCategory} colorVar="--snap-forest" />
                </div>

              </div>
            </>
          )}
        </div>
      )}

      {/* ── TAB: Content Management ───────────────────────────────────── */}
      {activeTab === 'content' && (
        <div>
          <div className="admin-search-bar admin-search-bar--wrap">
            <input
              type="text"
              placeholder="Search by title or creator..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="admin-search-input"
            />

            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="admin-select">
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="admin-select">
              <option value="all">All categories</option>
              {availableCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select value={sortOption} onChange={e => setSortOption(e.target.value)} className="admin-select">
              <option value="newest">Newest first</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </div>

          {loading && !recipesList.length ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#5c7068', fontWeight: 600 }}>
              Loading products...
            </div>
          ) : (
            <div className="admin-recipes-grid">
              {filteredRecipes.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#5c7068', background: '#fff', borderRadius: '20px' }}>
                  No products found.
                </div>
              ) : filteredRecipes.map(r => (
                <div
                  className={`admin-recipe-card admin-recipe-card--${r.accent || 'green'}`}
                  key={r._id}
                  onClick={() => setSelectedRecipe(r)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="admin-recipe-card__accent-bar" />
                  <div className="admin-recipe-content">
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                        <h3 className="admin-recipe-title">{r.title}</h3>
                        <StatusPill status={r.status || 'pending'} />
                      </div>
                      <p className="admin-recipe-author">
                        By <strong>{r.user?.name || 'Unknown'} {r.user?.surname || ''}</strong>
                      </p>
                      <p style={{ fontSize: '0.78rem', color: '#778899', margin: '0 0 8px' }}>
                        Submitted on {new Date(r.createdAt).toLocaleDateString('en-US')} · {r.time}
                      </p>
                    </div>
                    <div className="admin-recipe-footer">
                      <span className="snapcook-pill" style={{ background: '#e8f5e9', color: '#2d6a4f' }}>
                        {r.categories}
                      </span>
                      <button onClick={(e) => { e.stopPropagation(); setSelectedRecipe(r) }} className="admin-btn admin-btn--secondary" style={{ padding: '6px 12px' }}>
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB: Users ─────────────────────────────────────────────────── */}
      {activeTab === 'users' && (
        <div>
          <div className="admin-search-bar">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="admin-search-input"
            />
          </div>
          {loading && !usersList.length ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#5c7068', fontWeight: 600 }}>
              Loading users...
            </div>
          ) : (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Registered</th>
                    <th>Status</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#5c7068' }}>
                        No users found.
                      </td>
                    </tr>
                  ) : filteredUsers.map(u => (
                    <tr key={u._id}>
                      <td>
                        <div className="admin-avatar-name">
                          <div className="admin-avatar">{u.name?.[0]?.toUpperCase() || 'U'}</div>
                          <div>
                            <strong style={{ display: 'block', color: 'var(--snap-forest)' }}>{u.name} {u.surname}</strong>
                            <span style={{ fontSize: '0.75rem', color: '#778899' }}>ID: {u._id}</span>
                          </div>
                        </div>
                      </td>
                      <td>{u.email}</td>
                      <td>{new Date(u.createdAt).toLocaleDateString('en-US')}</td>
                      <td>
                        <span className={`admin-status-pill admin-status-pill--${u.isActive === false ? 'inactive' : 'active'}`}>
                          {u.isActive === false ? 'Deactivated' : 'Active'}
                        </span>
                      </td>
                      <td>
                        <select value={u.role} onChange={e => handleRoleChange(u._id, e.target.value)} className="admin-select">
                          <option value="user">User</option>
                          <option value="admin">Administrator</option>
                        </select>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => handleToggleUserStatus(u._id, u.isActive !== false)}
                            className="admin-btn admin-btn--secondary"
                          >
                            {u.isActive === false ? 'Activate' : 'Deactivate'}
                          </button>
                          <button onClick={() => handleDeleteUser(u._id, `${u.name} ${u.surname}`)} className="admin-btn">
                            <IconTrash /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: Activity Logs ────────────────────────────────────────────── */}
      {activeTab === 'logs' && (
        <div>
          {loading && !activityLogs.length ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#5c7068', fontWeight: 600 }}>
              Loading activity logs...
            </div>
          ) : (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Administrator</th>
                    <th>Action</th>
                    <th>Date</th>
                    <th>Target</th>
                  </tr>
                </thead>
                <tbody>
                  {activityLogs.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#5c7068' }}>
                        No activity recorded yet.
                      </td>
                    </tr>
                  ) : activityLogs.map(log => (
                    <tr key={log._id}>
                      <td>{log.admin?.name || 'Unknown'} {log.admin?.surname || ''}</td>
                      <td>{log.action}</td>
                      <td>{new Date(log.createdAt).toLocaleString('en-US')}</td>
                      <td>{log.details || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: Analytics ─────────────────────────────────────────────────── */}
      {activeTab === 'analytics' && (
        <div>
          {loading && !analyticsData ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#5c7068', fontWeight: 600 }}>
              Loading analytics...
            </div>
          ) : (
            <>
              <div className="admin-stats-grid">
                <div className="admin-stat-card">
                  <div className="admin-stat-content">
                    <h3>Approval Rate</h3>
                    <p className="admin-stat-number">{analyticsData?.approvalRate ?? 0}%</p>
                    <span className="admin-stat-sub">{analyticsData?.approvedRecipes ?? 0} of {analyticsData?.totalRecipes ?? 0} products</span>
                  </div>
                  <div className="admin-stat-icon"><IconChartBar /></div>
                </div>

                <div className="admin-stat-card">
                  <div className="admin-stat-content">
                    <h3>Total Favorites</h3>
                    <p className="admin-stat-number">{analyticsData?.favoritesStats?.totalFavorites ?? 0}</p>
                    <span className="admin-stat-sub">{analyticsData?.favoritesStats?.averageFavoritesPerUser ?? 0} avg. per user</span>
                  </div>
                  <div className="admin-stat-icon" style={{ background: '#fce4ec', color: '#880e4f' }}>
                    <IconBell />
                  </div>
                </div>
              </div>

              <div className="admin-recent-grid">
                <div className="admin-recent-card">
                  <h2>User Registrations (last 14 days)</h2>
                  <MiniBarChart data={analyticsData?.userRegistrationsByDay} />
                </div>

                <div className="admin-recent-card">
                  <h2>Product Submissions (last 14 days)</h2>
                  <MiniBarChart data={analyticsData?.productSubmissionsByDay} colorVar="--snap-sage" />
                </div>

                <div className="admin-recent-card" style={{ gridColumn: '1 / -1' }}>
                  <h2>Most Active Contributors</h2>
                  {!analyticsData?.mostActiveContributors?.length ? (
                    <p style={{ color: '#5c7068', fontSize: '0.9rem' }}>No data available.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {analyticsData.mostActiveContributors.map(u => (
                        <div key={u._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem', borderBottom: '1px solid rgba(0,0,0,0.04)', paddingBottom: '8px' }}>
                          <span style={{ fontWeight: 700 }}>{u.name} {u.surname}</span>
                          <span style={{ fontSize: '0.8rem', color: '#778899', fontWeight: 600 }}>
                            {u.productCount} product{u.productCount > 1 ? 's' : ''}
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

      {/* ── TAB: System Overview ───────────────────────────────────────────── */}
      {activeTab === 'system' && (
        <div>
          {loading && !systemData ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#5c7068', fontWeight: 600 }}>
              Loading system overview...
            </div>
          ) : (
            <div className="admin-stats-grid">
              <div className="admin-stat-card">
                <div className="admin-stat-content">
                  <h3>Backend Status</h3>
                  <p className="admin-stat-number" style={{ fontSize: '1.4rem', color: '#1b5e20' }}>
                    {systemData?.backendStatus === 'online' ? 'Online' : 'Unknown'}
                  </p>
                </div>
                <div className="admin-stat-icon" style={{ background: '#e8f5e9', color: '#1b5e20' }}>
                  <IconServer />
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-content">
                  <h3>Database Status</h3>
                  <p className="admin-stat-number" style={{ fontSize: '1.4rem', textTransform: 'capitalize' }}>
                    {systemData?.databaseStatus || 'Unknown'}
                  </p>
                </div>
                <div className="admin-stat-icon"><IconServer /></div>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-content">
                  <h3>Application Version</h3>
                  <p className="admin-stat-number" style={{ fontSize: '1.4rem' }}>
                    {systemData?.applicationVersion || 'N/A'}
                  </p>
                </div>
                <div className="admin-stat-icon"><IconClipboard /></div>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-content">
                  <h3>Environment</h3>
                  <p className="admin-stat-number" style={{ fontSize: '1.4rem', textTransform: 'capitalize' }}>
                    {systemData?.environment || 'N/A'}
                  </p>
                </div>
                <div className="admin-stat-icon" style={{ background: '#e3f2fd', color: '#0d47a1' }}>
                  <IconActivity />
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-content">
                  <h3>Last Database Update</h3>
                  <p className="admin-stat-number" style={{ fontSize: '1.1rem' }}>
                    {systemData?.lastDatabaseUpdate
                      ? new Date(systemData.lastDatabaseUpdate).toLocaleString('en-US')
                      : 'N/A'}
                  </p>
                </div>
                <div className="admin-stat-icon" style={{ background: '#fce4ec', color: '#880e4f' }}>
                  <IconCalendar />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Product Details panel ─────────────────────────────────────────── */}
      {selectedRecipe && (
        <div className="cookpal-modal-backdrop" role="presentation" onClick={() => setSelectedRecipe(null)}>
          <div className="cookpal-modal cookpal-panel" role="dialog" aria-labelledby="recipe-details-title" onClick={(e) => e.stopPropagation()}>
            <h2 id="recipe-details-title" className="cookpal-subtitle" style={{ marginTop: 0 }}>
              {selectedRecipe.title}
            </h2>

            <p style={{ margin: '0 0 6px' }}><strong>Creator:</strong> {selectedRecipe.user?.name || 'Unknown'} {selectedRecipe.user?.surname || ''} ({selectedRecipe.user?.email || 'N/A'})</p>
            <p style={{ margin: '0 0 6px' }}><strong>Category:</strong> {selectedRecipe.categories}</p>
            <p style={{ margin: '0 0 6px' }}><strong>Preparation time:</strong> {selectedRecipe.time}</p>
            <p style={{ margin: '0 0 6px' }}><strong>Rating:</strong> {selectedRecipe.rating != null ? Number(selectedRecipe.rating).toFixed(1) : 'N/A'} / 5</p>
            <p style={{ margin: '0 0 6px' }}><strong>Tags:</strong> {selectedRecipe.tags?.length ? selectedRecipe.tags.join(', ') : 'None'}</p>
            <p style={{ margin: '0 0 6px' }}><strong>Submitted on:</strong> {new Date(selectedRecipe.createdAt).toLocaleDateString('en-US')}</p>
            <p style={{ margin: '0 0 16px' }}><strong>Status:</strong> <StatusPill status={selectedRecipe.status || 'pending'} /></p>

            <div className="cookpal-modal__actions" style={{ flexWrap: 'wrap', gap: '8px' }}>
              <button type="button" className="cookpal-modal__btn cookpal-modal__btn--ghost" onClick={() => setSelectedRecipe(null)}>Close</button>
              <button type="button" className="cookpal-modal__btn cookpal-modal__btn--ghost" onClick={() => handleRecipeStatusChange(selectedRecipe._id, 'approved')}>Approve</button>
              <button type="button" className="cookpal-modal__btn cookpal-modal__btn--ghost" onClick={() => handleRecipeStatusChange(selectedRecipe._id, 'rejected')}>Reject</button>
              <button type="button" className="cookpal-modal__btn cookpal-modal__btn--primary" onClick={() => handleDeleteRecipe(selectedRecipe._id, selectedRecipe.title)}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default AdminDashboard