import React, { useMemo, useState } from 'react'
import './Community.css'

const topChefs = [
  {
    id: 'moroccan',
    name: 'Chef Moroccan',
    specialty: 'Cuisine Marocaine',
    followers: 1240,
    badge: 'CM',
    level: 'Expert',
    recipe: 'Tajine citron olive',
    note: 'Publie des recettes familiales et des astuces epices.',
  },
  {
    id: 'healthy',
    name: 'Healthy Hunter',
    specialty: 'Healthy & Light',
    followers: 856,
    badge: 'HH',
    level: 'Master',
    recipe: 'Buddha bowl colore',
    note: 'Idees rapides pour manger frais avec moins de gaspillage.',
  },
  {
    id: 'quick',
    name: 'Quick Meals Pro',
    specialty: 'Recettes rapides',
    followers: 642,
    badge: 'QP',
    level: 'Expert',
    recipe: 'Pasta legumes 15 min',
    note: 'Repas express pour les soirs charges.',
  },
  {
    id: 'veggie',
    name: 'Veggie Vibes',
    specialty: 'Vegetarien',
    followers: 503,
    badge: 'VV',
    level: 'Advanced',
    recipe: 'Curry pois chiches',
    note: 'Plats veggie simples, colores et nourrissants.',
  },
]

const challenges = [
  {
    id: 'five',
    title: '5 Ingredients Challenge',
    description: 'Creez un repas delicieux avec seulement 5 ingredients.',
    participants: 127,
    difficulty: 'Moyen',
    reward: 50,
    icon: '5',
  },
  {
    id: 'sugarfree',
    title: 'Dessert sans sucre',
    description: 'Preparez un dessert sans sucre raffine.',
    participants: 89,
    difficulty: 'Difficile',
    reward: 75,
    icon: 'DS',
  },
  {
    id: 'budget',
    title: 'Budget Master',
    description: 'Preparez un repas 3 couverts pour moins de 30 MAD.',
    participants: 203,
    difficulty: 'Moyen',
    reward: 60,
    icon: 'BM',
  },
  {
    id: 'quick15',
    title: '15 Minutes ou moins',
    description: 'Un diner complet en 15 minutes maximum.',
    participants: 156,
    difficulty: 'Facile',
    reward: 40,
    icon: '15',
  },
]

const trendingRecipes = [
  {
    id: 'buddha',
    title: 'Buddha Bowl Colore',
    chef: 'Healthy Hunter',
    likes: 456,
    saves: 234,
    tag: 'Healthy',
  },
  {
    id: 'tajine',
    title: 'Tajine Marocain Traditionnel',
    chef: 'Chef Moroccan',
    likes: 623,
    saves: 412,
    tag: 'Tradition',
  },
  {
    id: 'pasta',
    title: 'Pasta aux Legumes 15 Minutes',
    chef: 'Quick Meals Pro',
    likes: 289,
    saves: 145,
    tag: 'Express',
  },
]

const tabs = [
  { id: 'chefs', label: 'Chefs' },
  { id: 'recipes', label: 'Tendance' },
  { id: 'challenges', label: 'Defis' },
]

const difficultyClass = {
  Facile: 'community-chip--easy',
  Moyen: 'community-chip--medium',
  Difficile: 'community-chip--hard',
}

const Community = () => {
  const [activeTab, setActiveTab] = useState('chefs')
  const [selectedChefId, setSelectedChefId] = useState(topChefs[0].id)
  const [followedChefs, setFollowedChefs] = useState(['healthy'])
  const [likedRecipes, setLikedRecipes] = useState(['tajine'])
  const [savedRecipes, setSavedRecipes] = useState(['buddha'])
  const [joinedChallenges, setJoinedChallenges] = useState(['five'])
  const [completedChallenges, setCompletedChallenges] = useState([])
  const [toast, setToast] = useState('Welcome back to the community.')

  const userXP = 320 + completedChallenges.length * 80 + joinedChallenges.length * 20
  const nextLevelXP = 500
  const progress = Math.min(100, Math.round((userXP / nextLevelXP) * 100))
  const selectedChef = topChefs.find((chef) => chef.id === selectedChefId) || topChefs[0]

  const communityStats = useMemo(
    () => [
      { value: '2,847', label: 'Membres actifs' },
      { value: '1,234', label: 'Recettes partagees' },
      { value: '15,602', label: 'Commentaires' },
      { value: String(joinedChallenges.length + completedChallenges.length), label: 'Vos defis' },
    ],
    [completedChallenges.length, joinedChallenges.length]
  )

  const toggleFollow = (chef) => {
    setFollowedChefs((current) => {
      const isFollowing = current.includes(chef.id)
      setToast(isFollowing ? `Vous ne suivez plus ${chef.name}.` : `Vous suivez ${chef.name}.`)
      return isFollowing ? current.filter((id) => id !== chef.id) : [...current, chef.id]
    })
  }

  const toggleLike = (recipe) => {
    setLikedRecipes((current) => {
      const liked = current.includes(recipe.id)
      setToast(liked ? 'Like retire.' : `${recipe.title} ajoute aux likes.`)
      return liked ? current.filter((id) => id !== recipe.id) : [...current, recipe.id]
    })
  }

  const toggleSave = (recipe) => {
    setSavedRecipes((current) => {
      const saved = current.includes(recipe.id)
      setToast(saved ? 'Recette retiree des favoris.' : `${recipe.title} sauvegardee.`)
      return saved ? current.filter((id) => id !== recipe.id) : [...current, recipe.id]
    })
  }

  const toggleChallenge = (challenge) => {
    setJoinedChallenges((current) => {
      const joined = current.includes(challenge.id)
      setToast(joined ? `Defi quitte: ${challenge.title}.` : `Defi rejoint: +${challenge.reward} XP possible.`)
      return joined ? current.filter((id) => id !== challenge.id) : [...current, challenge.id]
    })
    setCompletedChallenges((current) => current.filter((id) => id !== challenge.id))
  }

  const completeChallenge = (challenge) => {
    setJoinedChallenges((current) => (current.includes(challenge.id) ? current : [...current, challenge.id]))
    setCompletedChallenges((current) => {
      if (current.includes(challenge.id)) return current
      setToast(`${challenge.title} complete. Bravo, +${challenge.reward} XP!`)
      return [...current, challenge.id]
    })
  }

  return (
    <div className="community-page">
      <header className="community-header">
        <div>
          <h1 className="community-title">Community</h1>
          <p className="community-lead">Connectez-vous, partagez et apprenez avec d'autres passionnes de cuisine.</p>
        </div>
        <div className="community-status" role="status">
          {toast}
        </div>
      </header>

      <section className="community-hero" aria-label="Votre progression">
        <div className="community-hero__stats">
          <div>
            <span className="community-hero__icon" aria-hidden>
              *
            </span>
            <strong>Beginner</strong>
            <small>Votre niveau</small>
          </div>
          <div>
            <span className="community-hero__icon" aria-hidden>
              XP
            </span>
            <strong>{userXP} XP</strong>
            <small>Points d'experience</small>
          </div>
          <div>
            <span className="community-hero__icon" aria-hidden>
              W
            </span>
            <strong>{completedChallenges.length}</strong>
            <small>Defis completes</small>
          </div>
        </div>
        <div className="community-progress" aria-label={`${progress}% du prochain niveau`}>
          <span style={{ width: `${progress}%` }} />
        </div>
        <small>{Math.max(nextLevelXP - userXP, 0)} XP avant le prochain niveau</small>
      </section>

      <nav className="community-tabs" aria-label="Community sections">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`community-tab${activeTab === tab.id ? ' community-tab--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {activeTab === 'chefs' && (
        <section className="community-grid community-grid--chefs">
          <div className="community-panel">
            <div className="community-section-head">
              <div>
                <h2>Chefs de la communaute</h2>
                <p>Decouvrez les meilleurs cuisinier(e)s et suivez leurs recettes.</p>
              </div>
            </div>
            <div className="community-chef-list">
              {topChefs.map((chef) => {
                const isSelected = selectedChefId === chef.id
                const isFollowing = followedChefs.includes(chef.id)

                return (
                  <article
                    key={chef.id}
                    className={`community-chef-card${isSelected ? ' community-chef-card--selected' : ''}`}
                  >
                    <button
                      type="button"
                      className="community-chef-card__main"
                      onClick={() => {
                        setSelectedChefId(chef.id)
                        setToast(`${chef.name} selectionne.`)
                      }}
                    >
                      <span className="community-avatar" aria-hidden>
                        {chef.badge}
                      </span>
                      <span>
                        <strong>{chef.name}</strong>
                        <small>{chef.specialty}</small>
                      </span>
                    </button>
                    <div className="community-chef-card__foot">
                      <span>{chef.followers + (isFollowing ? 1 : 0)} followers</span>
                      <button
                        type="button"
                        className={`community-mini-btn${isFollowing ? ' community-mini-btn--active' : ''}`}
                        onClick={() => toggleFollow(chef)}
                      >
                        {isFollowing ? 'Suivi' : 'Suivre'}
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>

          <aside className="community-panel community-detail">
            <span className="community-avatar community-avatar--large" aria-hidden>
              {selectedChef.badge}
            </span>
            <h2>{selectedChef.name}</h2>
            <p>{selectedChef.note}</p>
            <dl>
              <div>
                <dt>Niveau</dt>
                <dd>{selectedChef.level}</dd>
              </div>
              <div>
                <dt>Recette phare</dt>
                <dd>{selectedChef.recipe}</dd>
              </div>
            </dl>
            <button type="button" className="community-primary-btn" onClick={() => toggleFollow(selectedChef)}>
              {followedChefs.includes(selectedChef.id) ? 'Ne plus suivre' : 'Suivre ce chef'}
            </button>
          </aside>
        </section>
      )}

      {activeTab === 'recipes' && (
        <section className="community-panel">
          <div className="community-section-head">
            <div>
              <h2>Recettes en tendance</h2>
              <p>Les favorites du moment dans notre communaute.</p>
            </div>
          </div>
          <div className="community-recipe-list">
            {trendingRecipes.map((recipe) => {
              const liked = likedRecipes.includes(recipe.id)
              const saved = savedRecipes.includes(recipe.id)

              return (
                <article key={recipe.id} className="community-recipe-card">
                  <div>
                    <span className="community-chip">{recipe.tag}</span>
                    <h3>{recipe.title}</h3>
                    <p>par {recipe.chef}</p>
                  </div>
                  <div className="community-recipe-actions">
                    <button
                      type="button"
                      className={liked ? 'community-action-btn community-action-btn--active' : 'community-action-btn'}
                      onClick={() => toggleLike(recipe)}
                    >
                      Like {recipe.likes + (liked ? 1 : 0)}
                    </button>
                    <button
                      type="button"
                      className={saved ? 'community-action-btn community-action-btn--saved' : 'community-action-btn'}
                      onClick={() => toggleSave(recipe)}
                    >
                      Save {recipe.saves + (saved ? 1 : 0)}
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      )}

      {activeTab === 'challenges' && (
        <section className="community-panel">
          <div className="community-section-head">
            <div>
              <h2>Defis culinaires</h2>
              <p>Relevez des defis et gagnez de l'experience communautaire.</p>
            </div>
          </div>
          <div className="community-challenge-grid">
            {challenges.map((challenge) => {
              const joined = joinedChallenges.includes(challenge.id)
              const completed = completedChallenges.includes(challenge.id)

              return (
                <article key={challenge.id} className="community-challenge-card">
                  <div className="community-challenge-card__top">
                    <span className="community-challenge-icon">{challenge.icon}</span>
                    <span className={`community-chip ${difficultyClass[challenge.difficulty]}`}>
                      {challenge.difficulty}
                    </span>
                  </div>
                  <h3>{challenge.title}</h3>
                  <p>{challenge.description}</p>
                  <div className="community-challenge-meta">
                    <span>{challenge.participants + (joined ? 1 : 0)} participants</span>
                    <span>{challenge.reward} XP</span>
                  </div>
                  <div className="community-card-actions">
                    <button
                      type="button"
                      className={`community-secondary-btn${joined ? ' community-secondary-btn--active' : ''}`}
                      onClick={() => toggleChallenge(challenge)}
                    >
                      {joined ? 'Quitter' : 'Rejoindre'}
                    </button>
                    <button
                      type="button"
                      className="community-primary-btn"
                      onClick={() => completeChallenge(challenge)}
                      disabled={completed}
                    >
                      {completed ? 'Complete' : 'Terminer'}
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      )}

      <section className="community-stats" aria-label="Statistiques communautaires">
        {communityStats.map((stat) => (
          <div key={stat.label}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </div>
        ))}
      </section>
    </div>
  )
}

export default Community
