const KEY = 'cookpal-user-recipes'

export function getUserRecipes() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveUserRecipes(list) {
  localStorage.setItem(KEY, JSON.stringify(list))
}

export function addUserRecipe(recipe) {
  const list = getUserRecipes()
  const id = `user-${Date.now()}`
  const next = [{ ...recipe, id }, ...list]
  saveUserRecipes(next)
  window.dispatchEvent(new Event('cookpal-user-recipes-changed'))
  return next
}
