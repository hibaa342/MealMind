const express = require('express');
const { findMissingIngredients } = require('../utils/ingredientMatch');

const router = express.Router();
const MEALDB_BASE = 'https://www.themealdb.com/api/json/v1/1';

async function fetchMealDetail(mealId) {
  const response = await fetch(`${MEALDB_BASE}/lookup.php?i=${encodeURIComponent(mealId)}`);
  if (!response.ok) return null;
  const data = await response.json();
  return data.meals?.[0] ?? null;
}

router.post('/missing', async (req, res) => {
  try {
    const { mealId, recipeDetail, fridgeIngredients } = req.body;
    const fridge = Array.isArray(fridgeIngredients) ? fridgeIngredients : [];

    if (fridge.length === 0) {
      return res.status(400).json({ message: 'No fridge ingredients provided. Scan your fridge first.' });
    }

    let detail = recipeDetail || null;

    if (!detail && mealId) {
      if (String(mealId).startsWith('local-')) {
        return res.status(400).json({
          message: 'Send recipeDetail for local recipes (fruit salad, smoothie, etc.).',
        });
      }
      detail = await fetchMealDetail(mealId);
      if (!detail) {
        return res.status(404).json({ message: 'Recipe not found on TheMealDB' });
      }
    }

    if (!detail) {
      return res.status(400).json({ message: 'mealId or recipeDetail is required' });
    }

    const result = findMissingIngredients(detail, fridge);
    res.json(result);
  } catch (err) {
    console.error('Missing ingredients error:', err);
    res.status(500).json({ message: err.message || 'Could not compare ingredients' });
  }
});

module.exports = router;
