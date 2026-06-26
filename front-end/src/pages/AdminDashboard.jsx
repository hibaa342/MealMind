import React, { useState, useEffect } from 'react'
import './AdminDashboard.css'

// ── Icônes ────────────────────────────────────────────────────────────────────

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

const IconIngredient = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M12 2a9 9 0 0 1 9 9c0 4.17-3.58 7.83-9 11-5.42-3.17-9-6.83-9-11a9 9 0 0 1 9-9z" />
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

// ── Mini graphique en barres ───────────────────────────────────────────────────
// data est une liste d'objets du type { _id: "lundi", count: 5 }

const MiniBarChart = ({ data, colorVar = '--snap-forest' }) => {
  if (!data || data.length === 0) {
    return <p style={{ color: '#5c7068', fontSize: '0.85rem' }}>Aucune donnée disponible.</p>
  }

  // On cherche la plus grande valeur pour calculer la longueur des barres
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

// ── Composant principal ───────────────────────────────────────────────────────

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
    setTimeout(() => setToast(null), 4000)
  }

  const fetchOverviewData = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Impossible de récupérer les statistiques.')
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
      if (!res.ok) throw new Error('Impossible de récupérer la liste des utilisateurs.')
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
      if (!res.ok) throw new Error('Impossible de récupérer les recettes.')
      const data = await res.json()
      setRecipesList(data)
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
    else if (activeTab === 'recipes') fetchRecipes()
  }, [activeTab])

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role: newRole })
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || 'Échec de la mise à jour du rôle.')
      }
      triggerToast(`Rôle mis à jour : ${newRole}`)
      fetchUsers()
    } catch (err) {
      triggerToast(err.message, true)
    }
  }

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Supprimer "${userName}" et toutes ses recettes ? Cette action est irréversible.`)) return
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || 'Échec de la suppression.')
      }
      triggerToast('Utilisateur supprimé avec succès.')
      fetchUsers()
    } catch (err) {
      triggerToast(err.message, true)
    }
  }

  const handleDeleteRecipe = async (recipeId, recipeTitle) => {
    if (!window.confirm(`Supprimer la recette "${recipeTitle}" ? Cette action est irréversible.`)) return
    try {
      const res = await fetch(`/api/admin/recipes/${recipeId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || 'Échec de la suppression.')
      }
      triggerToast('Recette supprimée par modération admin.')
      fetchRecipes()
    } catch (err) {
      triggerToast(err.message, true)
    }
  }

  // On compare en minuscules pour que la recherche ne soit pas sensible à la casse
  const search = searchQuery.toLowerCase()

  const filteredUsers = usersList.filter(u => {
    const name = (u.name || '').toLowerCase()
    const surname = (u.surname || '').toLowerCase()
    const email = (u.email || '').toLowerCase()
    return name.includes(search) || surname.includes(search) || email.includes(search)
  })

  const filteredRecipes = recipesList.filter(r => {
    const title = (r.title || '').toLowerCase()
    const category = (r.categories || '').toLowerCase()
    const authorName = `${r.user?.name || ''} ${r.user?.surname || ''}`.toLowerCase()
    return title.includes(search) || category.includes(search) || authorName.includes(search)
  })

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
          <p className="admin-subtitle">Gérez les utilisateurs, modérez les recettes et consultez les statistiques en temps réel.</p>
        </div>
      </header>

      {/* Onglets */}
      <nav className="admin-tabs">
        <button
          onClick={() => setActiveTab('overview')}
          className={activeTab === 'overview' ? 'admin-tab-btn admin-tab-btn--active' : 'admin-tab-btn'}
        >
          <IconActivity />
          Vue d'ensemble
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={activeTab === 'users' ? 'admin-tab-btn admin-tab-btn--active' : 'admin-tab-btn'}
        >
          <IconUsers />
          Utilisateurs
        </button>

        <button
          onClick={() => setActiveTab('recipes')}
          className={activeTab === 'recipes' ? 'admin-tab-btn admin-tab-btn--active' : 'admin-tab-btn'}
        >
          <IconRecipe />
          Modération
        </button>
      </nav>

      {/* Erreur globale */}
      {error && (
        <div style={{ background: '#ffebee', color: '#c62828', padding: '16px', borderRadius: '12px', marginBottom: '20px', fontWeight: 600 }}>
          Erreur : {error}
        </div>
      )}

      {/* ── TAB 1 : Vue d'ensemble ───────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div>
          {loading && !statsData ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#5c7068', fontWeight: 600 }}>
              Chargement des statistiques...
            </div>
          ) : (
            <>
              {/* Cartes de statistiques principales */}
              <div className="admin-stats-grid">

                <div className="admin-stat-card">
                  <div className="admin-stat-content">
                    <h3>Utilisateurs inscrits</h3>
                    <p className="admin-stat-number">{stats?.totalUsers ?? 0}</p>
                    <span className="admin-stat-sub">+{stats?.newUsersThisWeek ?? 0} cette semaine</span>
                  </div>
                  <div className="admin-stat-icon"><IconUsers /></div>
                </div>

                <div className="admin-stat-card">
                  <div className="admin-stat-content">
                    <h3>Administrateurs</h3>
                    <p className="admin-stat-number">{stats?.totalAdmins ?? 0}</p>
                    <span className="admin-stat-sub">{stats?.totalStandardUsers ?? 0} utilisateurs standard</span>
                  </div>
                  <div className="admin-stat-icon" style={{ background: '#fff3e0', color: '#e65100' }}>
                    <IconShield />
                  </div>
                </div>

                <div className="admin-stat-card">
                  <div className="admin-stat-content">
                    <h3>Recettes partagées</h3>
                    <p className="admin-stat-number">{stats?.totalRecipes ?? 0}</p>
                    <span className="admin-stat-sub">dans la communauté</span>
                  </div>
                  <div className="admin-stat-icon"><IconRecipe /></div>
                </div>

                <div className="admin-stat-card">
                  <div className="admin-stat-content">
                    <h3>Ingrédients</h3>
                    <p className="admin-stat-number">{stats?.totalIngredients ?? 0}</p>
                    <span className="admin-stat-sub">dans la base de données</span>
                  </div>
                  <div className="admin-stat-icon" style={{ background: '#e8f5e9', color: '#1b5e20' }}>
                    <IconIngredient />
                  </div>
                </div>

                <div className="admin-stat-card">
                  <div className="admin-stat-content">
                    <h3>Meal Plans</h3>
                    <p className="admin-stat-number">{stats?.totalMealPlans ?? 0}</p>
                    <span className="admin-stat-sub">planifications créées</span>
                  </div>
                  <div className="admin-stat-icon" style={{ background: '#e3f2fd', color: '#0d47a1' }}>
                    <IconCalendar />
                  </div>
                </div>

                <div className="admin-stat-card">
                  <div className="admin-stat-content">
                    <h3>Notifications</h3>
                    <p className="admin-stat-number">{stats?.totalNotifications ?? 0}</p>
                    <span className="admin-stat-sub">{stats?.unreadNotifications ?? 0} non lues</span>
                  </div>
                  <div className="admin-stat-icon" style={{ background: '#fce4ec', color: '#880e4f' }}>
                    <IconBell />
                  </div>
                </div>

              </div>

              {/* Graphiques et listes récentes */}
              <div className="admin-recent-grid">

                {/* Utilisateurs récents */}
                <div className="admin-recent-card">
                  <h2>Derniers inscrits</h2>
                  {!statsData?.recentUsers?.length ? (
                    <p style={{ color: '#5c7068', fontSize: '0.9rem' }}>Aucun utilisateur récent.</p>
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

                {/* Recettes récentes */}
                <div className="admin-recent-card">
                  <h2>Recettes récentes</h2>
                  {!statsData?.recentRecipes?.length ? (
                    <p style={{ color: '#5c7068', fontSize: '0.9rem' }}>Aucune recette récente.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {statsData.recentRecipes.map(r => (
                        <div key={r._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem', borderBottom: '1px solid rgba(0,0,0,0.04)', paddingBottom: '8px' }}>
                          <div>
                            <span style={{ fontWeight: 700 }}>{r.title}</span>
                            <span style={{ color: '#5c7068', marginLeft: '6px' }}>— {r.categories}</span>
                          </div>
                          <span style={{ fontSize: '0.8rem', color: '#778899', fontWeight: 600 }}>
                            {r.user?.name || 'Inconnu'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Meal plans par jour */}
                <div className="admin-recent-card">
                  <h2>Meal Plans par jour</h2>
                  <MiniBarChart data={statsData?.charts?.mealPlansByDay} />
                </div>

                {/* Meal plans par type */}
                <div className="admin-recent-card">
                  <h2>Meal Plans par type de repas</h2>
                  <MiniBarChart data={statsData?.charts?.mealPlansByType} colorVar="--snap-sage" />
                </div>

                {/* Ingrédients par catégorie */}
                <div className="admin-recent-card">
                  <h2>Ingrédients par catégorie</h2>
                  <MiniBarChart data={statsData?.charts?.ingredientsByCategory} colorVar="--snap-forest" />
                </div>

                {/* Notifications par type */}
                <div className="admin-recent-card">
                  <h2>Notifications par type</h2>
                  <MiniBarChart data={statsData?.charts?.notificationsByType} colorVar="--snap-sage" />
                </div>

                {/* Ingrédients récemment ajoutés */}
                <div className="admin-recent-card" style={{ gridColumn: '1 / -1' }}>
                  <h2>Ingrédients récemment ajoutés</h2>
                  {!statsData?.recentIngredients?.length ? (
                    <p style={{ color: '#5c7068', fontSize: '0.9rem' }}>Aucun ingrédient récent.</p>
                  ) : (
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      {statsData.recentIngredients.map(ing => (
                        <div key={ing._id} style={{ background: '#e8f5e9', borderRadius: '20px', padding: '6px 14px', fontSize: '0.82rem', fontWeight: 600, color: '#2d6a4f' }}>
                          {ing.name}
                          <span style={{ color: '#778899', fontWeight: 400, marginLeft: '6px' }}>({ing.category})</span>
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

      {/* ── TAB 2 : Gestion des utilisateurs ────────────────────────────── */}
      {activeTab === 'users' && (
        <div>
          <div className="admin-search-bar">
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="admin-search-input"
            />
          </div>
          {loading && !usersList.length ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#5c7068', fontWeight: 600 }}>
              Chargement des utilisateurs...
            </div>
          ) : (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Utilisateur</th>
                    <th>Email</th>
                    <th>Inscription</th>
                    <th>Rôle</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#5c7068' }}>
                        Aucun utilisateur trouvé.
                      </td>
                    </tr>
                  ) : filteredUsers.map(u => (
                    <tr key={u._id}>
                      <td>
                        <div className="admin-avatar-name">
                          <div className="admin-avatar">{u.name?.[0]?.toUpperCase() || 'U'}</div>
                          <div>
                            <strong style={{ display: 'block', color: 'var(--snap-forest)' }}>{u.name} {u.surname}</strong>
                            <span style={{ fontSize: '0.75rem', color: '#778899' }}>ID : {u._id}</span>
                          </div>
                        </div>
                      </td>
                      <td>{u.email}</td>
                      <td>{new Date(u.createdAt).toLocaleDateString('fr-FR')}</td>
                      <td>
                        <select value={u.role} onChange={e => handleRoleChange(u._id, e.target.value)} className="admin-select">
                          <option value="user">Utilisateur</option>
                          <option value="admin">Administrateur</option>
                        </select>
                      </td>
                      <td>
                        <button onClick={() => handleDeleteUser(u._id, `${u.name} ${u.surname}`)} className="admin-btn">
                          <IconTrash /> Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3 : Modération des recettes ─────────────────────────────── */}
      {activeTab === 'recipes' && (
        <div>
          <div className="admin-search-bar">
            <input
              type="text"
              placeholder="Rechercher par titre, catégorie, auteur..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="admin-search-input"
            />
          </div>
          {loading && !recipesList.length ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#5c7068', fontWeight: 600 }}>
              Chargement des recettes...
            </div>
          ) : (
            <div className="admin-recipes-grid">
              {filteredRecipes.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#5c7068', background: '#fff', borderRadius: '20px' }}>
                  Aucune recette trouvée.
                </div>
              ) : filteredRecipes.map(r => (
                <div className="admin-recipe-card" key={r._id}>
                  <img
                    src={r.image || 'https://placehold.co/300x300?text=Recipe'}
                    alt={r.title}
                    className="admin-recipe-image"
                    onError={e => {
                      e.target.onerror = null
                      e.target.src = 'https://placehold.co/300x300?text=Recipe'
                    }}
                  />
                  <div className="admin-recipe-content">
                    <div>
                      <h3 className="admin-recipe-title">{r.title}</h3>
                      <p className="admin-recipe-author">
                        Ajouté par <strong>{r.user?.name || 'Inconnu'} {r.user?.surname || ''}</strong>
                      </p>
                    </div>
                    <div className="admin-recipe-footer">
                      <span className="snapcook-pill" style={{ background: '#e8f5e9', color: '#2d6a4f' }}>
                        {r.categories}
                      </span>
                      <button onClick={() => handleDeleteRecipe(r._id, r.title)} className="admin-btn" style={{ padding: '6px 12px' }}>
                        <IconTrash /> Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  )
}

export default AdminDashboard