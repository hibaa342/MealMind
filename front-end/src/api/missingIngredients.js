const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

export async function fetchMissingIngredients({ mealId, recipeDetail, fridgeIngredients }) {
  const response = await fetch(`${API_BASE}/api/ingredients/missing`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mealId, recipeDetail, fridgeIngredients }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Could not detect missing ingredients');
  }

  return data;
}
