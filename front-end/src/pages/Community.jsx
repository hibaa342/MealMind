import React, { useState } from 'react'

const topChefs = [
  {
    id: 1,
    name: 'Chef Moroccan',
    specialty: 'Cuisine Marocaine',
    followers: 1240,
    badge: '👨‍🍳',
    level: 'Expert',
  },
  {
    id: 2,
    name: 'Healthy Hunter',
    specialty: 'Healthy & Light',
    followers: 856,
    badge: '🥗',
    level: 'Master',
  },
  {
    id: 3,
    name: 'Quick Meals Pro',
    specialty: 'Recettes rapides',
    followers: 642,
    badge: '⚡',
    level: 'Expert',
  },
  {
    id: 4,
    name: 'Veggie Vibes',
    specialty: 'Végétarien',
    followers: 503,
    badge: '🌱',
    level: 'Advanced',
  },
]

const challenges = [
  {
    id: 1,
    title: '5 Ingrédients Challenge',
    description: 'Créez un repas délicieux avec seulement 5 ingrédients',
    participants: 127,
    difficulty: 'Moyen',
    reward: '50 XP',
    icon: '5️⃣',
  },
  {
    id: 2,
    title: 'Desserts sans sucre',
    description: 'Préparez un dessert sans sucre raffiné',
    participants: 89,
    difficulty: 'Difficile',
    reward: '75 XP',
    icon: '🍰',
  },
  {
    id: 3,
    title: 'Budget Master',
    description: 'Préparez un repas 3 couverts pour moins de 30 MAD',
    participants: 203,
    difficulty: 'Moyen',
    reward: '60 XP',
    icon: '💰',
  },
  {
    id: 4,
    title: '15 Minutes ou Moins',
    description: 'Un diner complet en 15 minutes maximum',
    participants: 156,
    difficulty: 'Facile',
    reward: '40 XP',
    icon: '⏱️',
  },
]

const trendingRecipes = [
  {
    id: 1,
    title: 'Buddha Bowl Coloré',
    chef: 'Healthy Hunter',
    likes: 456,
    saves: 234,
    trending: true,
  },
  {
    id: 2,
    title: 'Tajine Marocain Traditionnel',
    chef: 'Chef Moroccan',
    likes: 623,
    saves: 412,
    trending: true,
  },
  {
    id: 3,
    title: 'Pasta aux Légumes 2 Minutes',
    chef: 'Quick Meals Pro',
    likes: 289,
    saves: 145,
    trending: false,
  },
]

const Community = ({ user }) => {
  const [selectedChef, setSelectedChef] = useState(null)
  const [userLevel, setUserLevel] = useState('Beginner')
  const [userXP, setUserXP] = useState(320)
  const [participatedChallenges, setParticipatedChallenges] = useState([1])

  const toggleChallenge = (challengeId) => {
    setParticipatedChallenges((prev) => {
      if (prev.includes(challengeId)) {
        return prev.filter((id) => id !== challengeId)
      } else {
        setUserXP((p) => p + 50)
        return [...prev, challengeId]
      }
    })
  }

  return (
    <div className="cookpal-page cookpal-community-page">
      <h1 className="cookpal-page__title">Community</h1>
      <p className="cookpal-page__lead">Connectez-vous, partagez et apprenez avec d'autres passionnés de cuisine.</p>

      {/* User Stats Card */}
      <section className="cookpal-panel" style={{ background: 'linear-gradient(135deg, #4CAF50, #45a049)', color: 'white', marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: 16 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: 8 }}>⭐</div>
            <p style={{ margin: 0 }}>{userLevel}</p>
            <small>Votre niveau</small>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: 8 }}>✨</div>
            <p style={{ margin: 0 }}>{userXP} XP</p>
            <small>Points d'expérience</small>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: 8 }}>🏆</div>
            <p style={{ margin: 0 }}>{participatedChallenges.length}</p>
            <small>Défis complétés</small>
          </div>
        </div>
        <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.3)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ width: `${(userXP / 500) * 100}%`, height: '100%', background: '#FFD700' }} />
        </div>
        <small style={{ display: 'block', marginTop: 8 }}>180 XP avant le prochain niveau</small>
      </section>

      {/* Top Chefs */}
      <section className="cookpal-panel">
        <h2 className="cookpal-subtitle">👨‍🍳 Chefs de la communauté</h2>
        <p className="cookpal-page__lead" style={{ fontSize: '14px', marginBottom: 16 }}>Découvrez les meilleurs cuisinier(e)s et suivez leurs recettes.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
          {topChefs.map((chef) => (
            <article
              key={chef.id}
              className="cookpal-panel"
              style={{
                borderLeft: '4px solid #4CAF50',
                cursor: 'pointer',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-4px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              onClick={() => setSelectedChef(chef.id)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 12 }}>
                <div style={{ fontSize: '40px' }}>{chef.badge}</div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 4px 0' }}>{chef.name}</h3>
                  <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>{chef.specialty}</p>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderTop: '1px solid #eee' }}>
                <span style={{ fontSize: '12px', color: '#666' }}>👥 {chef.followers} followers</span>
                <span style={{ fontSize: '11px', background: '#4CAF50', color: 'white', padding: '4px 8px', borderRadius: '12px' }}>
                  {chef.level}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Trending Recipes */}
      <section className="cookpal-panel">
        <h2 className="cookpal-subtitle">🔥 Recettes en tendance</h2>
        <p className="cookpal-page__lead" style={{ fontSize: '14px', marginBottom: 16 }}>Les favorites du moment dans notre communauté.</p>
        <div style={{ display: 'grid', gap: '12px' }}>
          {trendingRecipes.map((recipe) => (
            <article
              key={recipe.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                alignItems: 'center',
                padding: '12px',
                background: '#f9f9f9',
                borderRadius: '8px',
                borderLeft: recipe.trending ? '3px solid #FF6B6B' : 'none',
              }}
            >
              <div>
                <h4 style={{ margin: '0 0 4px 0' }}>
                  {recipe.trending && '🔥 '}
                  {recipe.title}
                </h4>
                <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>par {recipe.chef}</p>
              </div>
              <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
                <span>❤️ {recipe.likes}</span>
                <span>💾 {recipe.saves}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Challenges */}
      <section className="cookpal-panel">
        <h2 className="cookpal-subtitle">🎯 Défis culinaires</h2>
        <p className="cookpal-page__lead" style={{ fontSize: '14px', marginBottom: 16 }}>
          Relevez des défis et gagnez de l'expérience communautaire!
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {challenges.map((challenge) => (
            <article
              key={challenge.id}
              className="cookpal-panel"
              style={{
                borderTop: '4px solid #FF9800',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ fontSize: '40px' }}>{challenge.icon}</div>
                <span
                  style={{
                    fontSize: '11px',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    background:
                      challenge.difficulty === 'Facile'
                        ? '#E8F5E9'
                        : challenge.difficulty === 'Moyen'
                          ? '#FFF3E0'
                          : '#FFEBEE',
                    color:
                      challenge.difficulty === 'Facile'
                        ? '#2E7D32'
                        : challenge.difficulty === 'Moyen'
                          ? '#E65100'
                          : '#C62828',
                  }}
                >
                  {challenge.difficulty}
                </span>
              </div>
              <h3 style={{ margin: '0 0 8px 0' }}>{challenge.title}</h3>
              <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#666', flex: 1 }}>
                {challenge.description}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: 12, color: '#999' }}>
                <span>👥 {challenge.participants} participants</span>
                <span>⭐ {challenge.reward}</span>
              </div>
              <button
                type="button"
                onClick={() => toggleChallenge(challenge.id)}
                style={{
                  padding: '8px 12px',
                  border: 'none',
                  borderRadius: '4px',
                  background: participatedChallenges.includes(challenge.id) ? '#81C784' : '#4CAF50',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 'bold',
                }}
              >
                {participatedChallenges.includes(challenge.id) ? '✓ Participé' : 'Relever le défi'}
              </button>
            </article>
          ))}
        </div>
      </section>

      {/* Community Stats */}
      <section className="cookpal-panel" style={{ background: '#F5F5F5' }}>
        <h2 className="cookpal-subtitle">📊 Statistiques communautaires</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginTop: 16 }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#4CAF50' }}>2,847</p>
            <small>Membres actifs</small>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#FF9800' }}>1,234</p>
            <small>Recettes partagées</small>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#2196F3' }}>15,602</p>
            <small>Commentaires</small>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#E91E63' }}>345</p>
            <small>Défis complétés</small>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Community
