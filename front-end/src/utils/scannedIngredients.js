const INGREDIENTS_KEY = 'mealmind-scanned-ingredients'
const RECIPES_KEY = 'mealmind-scanned-recipes'

function ingredientsKey(names) {
  return [...names].map((n) => n.trim().toLowerCase()).sort().join('|')
}

export function saveScannedIngredients(ingredients) {
  const names = ingredients
    .map((item) => (typeof item === 'string' ? item : item?.name))
    .filter(Boolean)
  localStorage.setItem(INGREDIENTS_KEY, JSON.stringify(names))
  window.dispatchEvent(new CustomEvent('mealmind-scan-updated'))
  return names
}

export function getScannedIngredients() {
  try {
    const raw = localStorage.getItem(INGREDIENTS_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveScannedRecipes(recipes, ingredients = getScannedIngredients()) {
  const names = ingredients
    .map((item) => (typeof item === 'string' ? item : item?.name))
    .filter(Boolean)
  localStorage.setItem(
    RECIPES_KEY,
    JSON.stringify({
      key: ingredientsKey(names),
      recipes,
    })
  )
  // NOTE: do NOT dispatch 'mealmind-scan-updated' here — this function only
  // caches fetched recipe results. Dispatching the event would re-trigger
  // refreshScanSuggestions → saveScannedRecipes → event → infinite loop.
}

export function getScannedRecipes(currentIngredients = getScannedIngredients()) {
  try {
    const raw = localStorage.getItem(RECIPES_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    const names = currentIngredients
      .map((item) => (typeof item === 'string' ? item : item?.name))
      .filter(Boolean)
    if (parsed?.key !== ingredientsKey(names)) return []
    return Array.isArray(parsed.recipes) ? parsed.recipes : []
  } catch {
    return []
  }
}

export function clearScannedData() {
  localStorage.removeItem(INGREDIENTS_KEY)
  localStorage.removeItem(RECIPES_KEY)
  window.dispatchEvent(new CustomEvent('mealmind-scan-updated'))
}
