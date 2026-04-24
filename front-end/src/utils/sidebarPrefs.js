const KEY = 'cookpal-sidebar-prefs'

const defaultState = () => ({
  diets: ['Meat', 'Soup'],
  allergies: ['Wheat', 'Dairy'],
  cuisines: ['American', 'Italian'],
  goals: ['Burn Fat'],
})

export function loadSidebarPrefs() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return defaultState()
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return defaultState()
    const d = defaultState()
    return {
      diets: Array.isArray(parsed.diets) && parsed.diets.length ? parsed.diets : d.diets,
      allergies: Array.isArray(parsed.allergies) && parsed.allergies.length ? parsed.allergies : d.allergies,
      cuisines: Array.isArray(parsed.cuisines) && parsed.cuisines.length ? parsed.cuisines : d.cuisines,
      goals: Array.isArray(parsed.goals) && parsed.goals.length ? parsed.goals : d.goals,
    }
  } catch {
    return defaultState()
  }
}

export function saveSidebarPrefs(prefs) {
  localStorage.setItem(KEY, JSON.stringify(prefs))
}
