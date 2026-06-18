function normalize(raw) {
  if (!raw || typeof raw !== 'string') return '';
  return raw.trim().toLowerCase().replace(/_/g, ' ');
}

function ingredientMatches(recipeIngredient, detectedName) {
  const r = normalize(recipeIngredient);
  const d = normalize(detectedName);
  if (!r || !d) return false;
  if (r === d || r.includes(d) || d.includes(r)) return true;

  const dStem = d.replace(/ies$/, 'y').replace(/es$/, '').replace(/s$/, '');
  return r.split(/\s+/).some((word) => {
    const w = word.replace(/ies$/, 'y').replace(/es$/, '').replace(/s$/, '');
    return w === dStem || w.startsWith(dStem) || dStem.startsWith(w);
  });
}

function getRecipeIngredientsList(recipeDetail) {
  if (!recipeDetail) return [];

  if (Array.isArray(recipeDetail.ingredients)) {
    return recipeDetail.ingredients
      .map((item) => ({
        name: String(item.name || '').trim(),
        measure: String(item.measure || '').trim(),
      }))
      .filter((item) => item.name);
  }

  const list = [];
  for (let i = 1; i <= 20; i++) {
    const name = recipeDetail[`strIngredient${i}`];
    if (name?.trim()) {
      list.push({
        name: name.trim(),
        measure: recipeDetail[`strMeasure${i}`]?.trim() || '',
      });
    }
  }
  return list;
}

function findMissingIngredients(recipeDetail, fridgeIngredientNames) {
  const recipeIngs = getRecipeIngredientsList(recipeDetail);
  const fridge = [...new Set(fridgeIngredientNames.map((n) => String(n).trim()).filter(Boolean))];

  const missing = [];
  const have = [];

  for (const item of recipeIngs) {
    const matchedWith = fridge.find((fridgeItem) => ingredientMatches(item.name, fridgeItem));
    if (matchedWith) {
      have.push({ ...item, matchedWith });
    } else {
      missing.push(item);
    }
  }

  return { missing, have, recipeIngredients: recipeIngs };
}

module.exports = {
  normalize,
  ingredientMatches,
  getRecipeIngredientsList,
  findMissingIngredients,
};
