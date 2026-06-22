export const GROCERY_CATALOG = [
  { id: 1, name: 'Tomatoes', unit: 'kg', pricePerUnit: 18, keywords: ['tomato', 'tomatoes'] },
  { id: 2, name: 'Chicken', unit: 'kg', pricePerUnit: 120, keywords: ['chicken', 'poulet'] },
  { id: 3, name: 'Cheese', unit: 'kg', pricePerUnit: 95, keywords: ['cheese', 'fromage', 'cheddar'] },
  { id: 4, name: 'Olive oil', unit: 'L', pricePerUnit: 45, keywords: ['olive oil', 'oil'] },
  { id: 5, name: 'Bread', unit: 'piece', pricePerUnit: 5, keywords: ['bread', 'pain'] },
  { id: 6, name: 'Eggs', unit: 'dozen', pricePerUnit: 22, keywords: ['egg', 'eggs', 'oeuf', 'oeufs'] },
  { id: 7, name: 'Milk', unit: 'L', pricePerUnit: 12, keywords: ['milk', 'lait'] },
  { id: 8, name: 'Onions', unit: 'kg', pricePerUnit: 8, keywords: ['onion', 'onions', 'oignon'] },
  { id: 9, name: 'Garlic', unit: 'kg', pricePerUnit: 15, keywords: ['garlic', 'ail'] },
  { id: 10, name: 'Rice', unit: 'kg', pricePerUnit: 25, keywords: ['rice', 'riz'] },
  { id: 11, name: 'Butter', unit: 'kg', pricePerUnit: 55, keywords: ['butter', 'beurre'] },
  { id: 12, name: 'Potatoes', unit: 'kg', pricePerUnit: 10, keywords: ['potato', 'potatoes'] },
  { id: 13, name: 'Bell Peppers', unit: 'kg', pricePerUnit: 20, keywords: ['pepper', 'peppers', 'poivron'] },
  { id: 14, name: 'Spinach', unit: 'kg', pricePerUnit: 16, keywords: ['spinach', 'epinard'] },
  { id: 15, name: 'Lemon', unit: 'kg', pricePerUnit: 14, keywords: ['lemon', 'citron'] },
];

function normalize(text) {
  return String(text || '').toLowerCase().trim();
}

export function mapIngredientToCatalog(ingredientName) {
  const key = normalize(ingredientName);
  if (!key) return null;

  const exact = GROCERY_CATALOG.find((item) => normalize(item.name) === key);
  if (exact) return exact;

  const byKeyword = GROCERY_CATALOG.find((item) =>
    item.keywords.some((kw) => key.includes(kw) || kw.includes(key))
  );
  if (byKeyword) return byKeyword;

  const partial = GROCERY_CATALOG.find((item) => {
    const stem = normalize(item.name).replace(/s$/, '');
    return key.includes(stem) || stem.includes(key.split(' ')[0]);
  });

  return partial || null;
}
