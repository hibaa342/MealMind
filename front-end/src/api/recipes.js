const MEALDB_BASE = 'https://www.themealdb.com/api/json/v1/1'

const ACCENT_COLORS = ['green', 'orange', 'pink', 'yellow', 'purple']

/**
 * YOLO class names (lowercase) → exact TheMealDB ingredient names.
 * filter.php?i= is case-sensitive and needs the official ingredient name.
 */
const YOLO_TO_MEALDB = {
  apple: 'Apples',
  asparagus: 'Asparagus',
  avocado: 'Avocado',
  bacon: 'Bacon',
  banana: 'Banana',
  bean: 'Beans',
  beans: 'Beans',
  beef: 'Beef',
  'bell pepper': 'Red Pepper',
  blueberries: 'Blueberries',
  bread: 'Bread',
  broccoli: 'Broccoli',
  butter: 'Butter',
  cabbage: 'Cabbage',
  carrot: 'Carrots',
  cauliflower: 'Cauliflower',
  cheese: 'Cheese',
  chicken: 'Chicken',
  'chicken breast': 'Chicken',
  chocolate: 'Chocolate',
  corn: 'Corn',
  cucumber: 'Cucumber',
  dill: 'Dill',
  egg: 'Eggs',
  eggs: 'Eggs',
  eggplant: 'Aubergine',
  fish: 'Fish',
  flour: 'Flour',
  garlic: 'Garlic',
  ginger: 'Ginger',
  grape: null,
  'green bell pepper': 'Green Pepper',
  'green chilies': 'Green Chilli',
  ham: 'Ham',
  jam: 'Jam',
  kiwi: null,
  leek: 'Leek',
  lemon: 'Lemon',
  lettuce: 'Lettuce',
  lime: 'Lime',
  mango: 'Mango',
  milk: 'Milk',
  mushrooms: 'Mushrooms',
  olives: 'Olives',
  onion: 'Onion',
  orange: 'Orange',
  parsley: 'Parsley',
  pea: 'Peas',
  peach: 'Peaches',
  pear: 'Pears',
  pepper: 'Red Pepper',
  pineapple: 'Pineapple',
  potato: 'Potatoes',
  radish: 'Radish',
  'red bell pepper': 'Red Pepper',
  sausage: 'Sausage',
  spinach: 'Spinach',
  strawberry: 'Strawberries',
  'sweet potato': 'Sweet Potatoes',
  tomato: 'Tomato',
  tomatoes: 'Tomatoes',
  watermelon: null,
  'yellow bell pepper': 'Yellow Pepper',
  yogurt: 'Yogurt',
  zucchini: 'Courgettes',
}

/** French manual input → TheMealDB */
const MANUAL_ALIASES = {
  tomate: 'Tomato',
  tomates: 'Tomatoes',
  poulet: 'Chicken',
  bœuf: 'Beef',
  boeuf: 'Beef',
  pate: 'Pasta',
  pates: 'Pasta',
  spaghetti: 'Pasta',
  pâtes: 'Pasta',
  oignon: 'Onion',
  oignons: 'Onion',
  carotte: 'Carrots',
  carottes: 'Carrots',
  pomme: 'Apples',
  pommes: 'Apples',
  oeuf: 'Eggs',
  oeufs: 'Eggs',
  œuf: 'Eggs',
  œufs: 'Eggs',
  fromage: 'Cheese',
  lait: 'Milk',
  riz: 'Rice',
  saumon: 'Salmon',
  crevette: 'Prawns',
  crevettes: 'Prawns',
  champignon: 'Mushrooms',
  champignons: 'Mushrooms',
  poivron: 'Red Pepper',
  poivrons: 'Red Pepper',
  epinard: 'Spinach',
  épinard: 'Spinach',
  epinards: 'Spinach',
  épinards: 'Spinach',
  avocat: 'Avocado',
  citron: 'Lemon',
  citrons: 'Lemon',
  basilic: 'Basil',
  ail: 'Garlic',
  beurre: 'Butter',
  creme: 'Cream',
  crème: 'Cream',
  yaourt: 'Yogurt',
  banane: 'Banana',
  orange: 'Orange',
  fraise: 'Strawberries',
  fraises: 'Strawberries',
  peche: 'Peaches',
  pêche: 'Peaches',
  poire: 'Pears',
  poires: 'Pears',
  mangue: 'Mango',
  ananas: 'Pineapple',
}

let mealDbIngredientsCache = null

async function getMealDbIngredientList() {
  if (mealDbIngredientsCache) return mealDbIngredientsCache
  const res = await fetch(`${MEALDB_BASE}/list.php?i=list`)
  const data = await res.json()
  mealDbIngredientsCache = (data.meals ?? []).map((m) => m.strIngredient)
  return mealDbIngredientsCache
}

export function normalizeIngredientName(raw) {
  if (!raw || typeof raw !== 'string') return ''
  return raw.trim().toLowerCase().replace(/_/g, ' ')
}

/**
 * Resolve a scan/manual name to an exact TheMealDB ingredient, or null if unsupported.
 */
export async function resolveMealDbIngredient(raw) {
  const key = normalizeIngredientName(raw)
  if (!key) return null

  if (Object.prototype.hasOwnProperty.call(YOLO_TO_MEALDB, key)) {
    return YOLO_TO_MEALDB[key]
  }

  if (MANUAL_ALIASES[key]) {
    return MANUAL_ALIASES[key]
  }

  const list = await getMealDbIngredientList()
  const exact = list.find((item) => item.toLowerCase() === key)
  if (exact) return exact

  const singular = key.endsWith('s') ? key.slice(0, -1) : null
  if (singular) {
    const match = list.find((item) => item.toLowerCase() === singular)
    if (match) return match
  }

  const contains = list.find((item) => item.toLowerCase() === key || item.toLowerCase().startsWith(`${key} `))
  return contains ?? null
}

export async function fetchRecipesByIngredient(mealDbIngredient) {
  try {
    const res = await fetch(
      `${MEALDB_BASE}/filter.php?i=${encodeURIComponent(mealDbIngredient)}`
    )
    if (!res.ok) {
      console.warn(`TheMealDB filter error for ingredient ${mealDbIngredient}: ${res.status}`)
      return []
    }
    const data = await res.json()
    return data.meals ?? []
  } catch (error) {
    console.warn(`Failed to fetch recipes for ingredient ${mealDbIngredient}:`, error)
    return []
  }
}

const MIN_DETECTED_INGREDIENTS = 3
const MIN_RECIPE_MATCH_SCORE = 3

const FRUIT_MEALDB_NAMES = new Set([
  'Apples', 'Banana', 'Orange', 'Lemon', 'Lime', 'Mango', 'Peaches', 'Pears',
  'Strawberries', 'Blueberries', 'Pineapple', 'Avocado', 'Grapes', 'Grapefruit',
])

const LOCAL_FRUIT_IMAGES = {
  salad: 'https://images.unsplash.com/photo-1564093497599-593b96d80180?w=480&h=320&fit=crop',
  smoothie: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=480&h=320&fit=crop',
}

function getRecipeIngredients(meal) {
  const list = []
  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`]
    if (ing?.trim()) list.push(ing.trim())
  }
  return list
}

/** lemon ↔ lemon juice, Apples ↔ apple, etc. */
function ingredientMatches(recipeIngredient, detectedMealDbName) {
  const r = recipeIngredient.toLowerCase().trim()
  const d = detectedMealDbName.toLowerCase().trim()
  if (!r || !d) return false
  if (r === d || r.includes(d) || d.includes(r)) return true
  const dStem = d.replace(/ies$/, 'y').replace(/es$/, '').replace(/s$/, '')
  return r.split(/\s+/).some((word) => {
    const w = word.replace(/ies$/, 'y').replace(/es$/, '').replace(/s$/, '')
    return w === dStem || w.startsWith(dStem) || dStem.startsWith(w)
  })
}

function countMatchedIngredients(meal, detectedMealDbNames) {
  const recipeIngs = getRecipeIngredients(meal)
  const matched = []
  for (const detected of detectedMealDbNames) {
    if (recipeIngs.some((r) => ingredientMatches(r, detected))) {
      matched.push(detected)
    }
  }
  return matched
}

function buildLocalFruitRecipes(detectedMealDbNames) {
  const fruits = detectedMealDbNames.filter((n) => FRUIT_MEALDB_NAMES.has(n))
  if (fruits.length < MIN_DETECTED_INGREDIENTS) return []

  const fruitList = fruits.join(', ')
  const steps = fruits.map((f) => `1 portion ${f}`).join('\n')

  return [
    {
      id: 'local-fruit-salad',
      title: 'Fresh Fruit Salad',
      image: LOCAL_FRUIT_IMAGES.salad,
      time: '10 min',
      categories: 'Fruit · Home',
      tags: [`Uses your ${fruits.length} fruits`],
      rating: 4.8,
      accent: 'green',
      matchScore: fruits.length,
      matchedIngredients: fruits,
      isLocal: true,
      localDetail: {
        strMeal: 'Fresh Fruit Salad',
        strInstructions:
          `1. Wash and peel the fruit as needed.\n` +
          `2. Cut ${fruitList} into bite-sized pieces.\n` +
          `3. Combine in a bowl and toss gently.\n` +
          `4. Chill 10 minutes and serve.`,
        ingredients: fruits.map((f) => ({ measure: '1 portion', name: f })),
      },
    },
    {
      id: 'local-fruit-smoothie',
      title: 'Mixed Fruit Smoothie',
      image: LOCAL_FRUIT_IMAGES.smoothie,
      time: '5 min',
      categories: 'Fruit · Drink',
      tags: [`Uses your ${fruits.length} fruits`],
      rating: 4.7,
      accent: 'pink',
      matchScore: fruits.length,
      matchedIngredients: fruits,
      isLocal: true,
      localDetail: {
        strMeal: 'Mixed Fruit Smoothie',
        strInstructions:
          `1. Add to a blender:\n${steps}\n` +
          `2. Add 200 ml milk or yogurt (optional).\n` +
          `3. Blend until smooth.\n` +
          `4. Serve immediately.`,
        ingredients: [
          ...fruits.map((f) => ({ measure: '1', name: f })),
          { measure: '200 ml', name: 'Milk or yogurt (optional)' },
        ],
      },
    },
  ]
}

function mapMealToRecipe(meal, matched, index) {
  return {
    id: meal.idMeal,
    title: meal.strMeal,
    image: meal.strMealThumb,
    time: '30 min',
    categories: matched.join(', '),
    tags: [`${matched.length} ingredients matched`],
    rating: 4 + Math.min(matched.length * 0.2, 0.8),
    accent: ACCENT_COLORS[index % ACCENT_COLORS.length],
    matchScore: matched.length,
    matchedIngredients: matched,
    isLocal: false,
  }
}

/**
 * Suggest meals that contain at least 3 of the detected ingredients.
 * Uses full recipe details for accurate matching; adds fruit salad/smoothie when needed.
 */
export async function fetchRecipesByIngredients(ingredientNames, { limit = 12 } = {}) {
  const uniqueRaw = [...new Set(ingredientNames.map((n) => n.trim()).filter(Boolean))]
  if (uniqueRaw.length === 0) {
    return { recipes: [], matchedBy: {}, unresolved: [], needMoreIngredients: false }
  }

  const resolvedPairs = await Promise.all(
    uniqueRaw.map(async (raw) => ({
      raw,
      mealDb: await resolveMealDbIngredient(raw),
    }))
  )

  const matchedBy = {}
  const unresolved = []

  for (const { raw, mealDb } of resolvedPairs) {
    if (mealDb) matchedBy[raw] = mealDb
    else unresolved.push(raw)
  }

  const mealDbNames = [...new Set(Object.values(matchedBy))]
  if (mealDbNames.length === 0) {
    return { recipes: [], matchedBy, unresolved, needMoreIngredients: false }
  }

  if (mealDbNames.length < MIN_DETECTED_INGREDIENTS) {
    return {
      recipes: [],
      matchedBy,
      unresolved,
      needMoreIngredients: true,
      requiredCount: MIN_DETECTED_INGREDIENTS,
      foundCount: mealDbNames.length,
    }
  }

  const candidateIds = new Set()
  await Promise.all(
    mealDbNames.map(async (mealDbIngredient) => {
      const meals = await fetchRecipesByIngredient(mealDbIngredient)
      for (const meal of meals) candidateIds.add(meal.idMeal)
    })
  )

  const details = await Promise.all(
    [...candidateIds].map(async (id) => {
      try {
        return await fetchMealDetail(id)
      } catch (error) {
        console.warn(`Failed to fetch meal detail for ${id}:`, error)
        return null
      }
    })
  )

  const apiRecipes = details
    .filter(Boolean)
    .map((meal) => ({
      meal,
      matched: countMatchedIngredients(meal, mealDbNames),
    }))
    .filter(({ matched }) => matched.length >= MIN_RECIPE_MATCH_SCORE)
    .sort((a, b) => b.matched.length - a.matched.length || a.meal.strMeal.localeCompare(b.meal.strMeal))
    .map(({ meal, matched }, index) => mapMealToRecipe(meal, matched, index))

  let recipes = apiRecipes.slice(0, limit)
  const local = buildLocalFruitRecipes(mealDbNames)
  const includesLocalSuggestions = local.length > 0
  if (includesLocalSuggestions) {
    const apiIds = new Set(apiRecipes.map((r) => r.id))
    recipes = [...local, ...apiRecipes.filter((r) => !apiIds.has(r.id))].slice(0, limit)
  }

  return { recipes, matchedBy, unresolved, needMoreIngredients: false, includesLocalSuggestions }
}

export async function fetchMealDetail(mealId) {
  try {
    const res = await fetch(`${MEALDB_BASE}/lookup.php?i=${mealId}`)
    if (!res.ok) {
      console.warn(`TheMealDB lookup error for meal ${mealId}: ${res.status}`)
      return null
    }
    const data = await res.json()
    return data.meals?.[0] ?? null
  } catch (error) {
    console.warn(`Failed to fetch meal detail for ${mealId}:`, error)
    return null
  }
}
