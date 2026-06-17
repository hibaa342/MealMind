import React, { useMemo, useState } from 'react'
import './Community.css'

const topChefs = [
  {
    id: 'moroccan',
    name: 'Chef Moroccan',
    specialty: 'Moroccan Cuisine',
    followers: 1240,
    badge: 'CM',
    level: 'Expert',
    recipe: 'Lemon Olive Tagine',
    note: 'Publishes family recipes and spice tips.',
  },
  {
    id: 'healthy',
    name: 'Healthy Hunter',
    specialty: 'Healthy & Light',
    followers: 856,
    badge: 'HH',
    level: 'Master',
    recipe: 'Colorful Buddha Bowl',
    note: 'Quick ideas for fresh eating with less waste.',
  },
  {
    id: 'quick',
    name: 'Quick Meals Pro',
    specialty: 'Quick Recipes',
    followers: 642,
    badge: 'QP',
    level: 'Expert',
    recipe: 'Vegetable Pasta 15 min',
    note: 'Quick meals for busy nights.',
  },
  {
    id: 'veggie',
    name: 'Veggie Vibes',
    specialty: 'Vegetarian',
    followers: 503,
    badge: 'VV',
    level: 'Advanced',
    recipe: 'Chickpea Curry',
    note: 'Simple, colorful and nourishing vegetarian dishes.',
  },
]

const challenges = [
  {
    id: 'five',
    title: '5 Ingredients Challenge',
    description: 'Create a delicious meal with just 5 ingredients.',
    participants: 127,
    difficulty: 'Medium',
    reward: 50,
    icon: '5',
  },
  {
    id: 'sugarfree',
    title: 'Sugar-Free Dessert',
    description: 'Prepare a dessert without refined sugar.',
    participants: 89,
    difficulty: 'Hard',
    reward: 75,
    icon: 'DS',
  },
  {
    id: 'budget',
    title: 'Budget Master',
    description: 'Prepare a 3-course meal for under 30 MAD.',
    participants: 203,
    difficulty: 'Medium',
    reward: 60,
    icon: 'BM',
  },
  {
    id: 'quick15',
    title: '15 Minutes or Less',
    description: 'A complete dinner in 15 minutes max.',
    participants: 156,
    difficulty: 'Easy',
    reward: 40,
    icon: '15',
  },
]

const trendingRecipes = [
  {
    id: 'buddha',
    title: 'Colorful Buddha Bowl',
    chef: 'Healthy Hunter',
    likes: 456,
    saves: 234,
    tag: 'Healthy',
  },
  {
    id: 'tajine',
    title: 'Traditional Moroccan Tagine',
    chef: 'Chef Moroccan',
    likes: 623,
    saves: 412,
    tag: 'Traditional',
  },
  {
    id: 'pasta',
    title: 'Vegetable Pasta 15 Minutes',
    chef: 'Quick Meals Pro',
    likes: 289,
    saves: 145,
    tag: 'Express',
  },
]

const tabs = [
  { id: 'chefs', label: 'Chefs' },
  { id: 'recipes', label: 'Trending' },
  { id: 'challenges', label: 'Challenges' },
]

const difficultyClass = {
  Easy: 'community-chip--easy',
  Medium: 'community-chip--medium',
  Hard: 'community-chip--hard',
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
      { value: '2,847', label: 'Active Members' },
      { value: '1,234', label: 'Shared Recipes' },
      { value: '15,602', label: 'Comments' },
      { value: String(joinedChallenges.length + completedChallenges.length), label: 'Your Challenges' },
    ],
    [completedChallenges.length, joinedChallenges.length]
  )

  const toggleFollow = (chef) => {
    setFollowedChefs((current) => {
      const isFollowing = current.includes(chef.id)
      setToast(isFollowing ? `You are no longer following ${chef.name}.` : `You are now following ${chef.name}.`)
      return isFollowing ? current.filter((id) => id !== chef.id) : [...current, chef.id]
    })
  }

  const toggleLike = (recipe) => {
    setLikedRecipes((current) => {
      const liked = current.includes(recipe.id)
      setToast(liked ? 'Like removed.' : `${recipe.title} added to likes.`)
      return liked ? current.filter((id) => id !== recipe.id) : [...current, recipe.id]
    })
  }

  const toggleSave = (recipe) => {
    setSavedRecipes((current) => {
      const saved = current.includes(recipe.id)
      setToast(saved ? 'Recipe removed from favorites.' : `${recipe.title} saved.`)
      return saved ? current.filter((id) => id !== recipe.id) : [...current, recipe.id]
    })
  }

  const toggleChallenge = (challenge) => {
    setJoinedChallenges((current) => {
      const joined = current.includes(challenge.id)
      setToast(joined ? `Challenge left: ${challenge.title}.` : `Challenge joined: +${challenge.reward} XP possible.`)
      return joined ? current.filter((id) => id !== challenge.id) : [...current, challenge.id]
    })
    setCompletedChallenges((current) => current.filter((id) => id !== challenge.id))
  }

  const completeChallenge = (challenge) => {
    setJoinedChallenges((current) => (current.includes(challenge.id) ? current : [...current, challenge.id]))
    setCompletedChallenges((current) => {
      if (current.includes(challenge.id)) return current
      setToast(`${challenge.title} completed. Congrats, +${challenge.reward} XP!`)
      return [...current, challenge.id]
    })
  }

  return (
    <div className="community-page">
      <header className="community-header">
        <div>
          <h1 className="community-title">Community</h1>
          <p className="community-lead">Connect, share, and learn with fellow cooking enthusiasts.</p>
        </div>
        <div className="community-status" role="status">
          {toast}
        </div>
      </header>

      <section className="community-hero" aria-label="Your Progress">
        <div className="community-hero__stats">
          <div>
            <span className="community-hero__icon" aria-hidden>
              *
            </span>
            <strong>Beginner</strong>
            <small>Your Level</small>
          </div>
          <div>
            <span className="community-hero__icon" aria-hidden>
              XP
            </span>
            <strong>{userXP} XP</strong>
            <small>Experience Points</small>
          </div>
          <div>
            <span className="community-hero__icon" aria-hidden>
              W
            </span>
            <strong>{completedChallenges.length}</strong>
            <small>Challenges Completed</small>
          </div>
        </div>
        <div className="community-progress" aria-label={`${progress}% to next level`}>
          <span style={{ width: `${progress}%` }} />
        </div>
        <small>{Math.max(nextLevelXP - userXP, 0)} XP until next level</small>
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
                <h2>Community Chefs</h2>
                <p>Discover the best chefs and follow their recipes.</p>
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
                        setToast(`${chef.name} selected.`)
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
                        {isFollowing ? 'Following' : 'Follow'}
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
                <dt>Level</dt>
                <dd>{selectedChef.level}</dd>
              </div>
              <div>
                <dt>Featured Recipe</dt>
                <dd>{selectedChef.recipe}</dd>
              </div>
            </dl>
            <button type="button" className="community-primary-btn" onClick={() => toggleFollow(selectedChef)}>
              {followedChefs.includes(selectedChef.id) ? 'Stop Following' : 'Follow this Chef'}
            </button>
          </aside>
        </section>
      )}

      {activeTab === 'recipes' && (
        <section className="community-panel">
          <div className="community-section-head">
            <div>
              <h2>Trending Recipes</h2>
              <p>Current favorites in our community.</p>
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
              <h2>Culinary Challenges</h2>
              <p>Take on challenges and earn community experience.</p>
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
                      {joined ? 'Leave' : 'Join'}
                    </button>
                    <button
                      type="button"
                      className="community-primary-btn"
                      onClick={() => completeChallenge(challenge)}
                      disabled={completed}
                    >
                      {completed ? 'Complete' : 'Finish'}
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
