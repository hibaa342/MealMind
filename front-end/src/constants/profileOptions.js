export const DIET_OPTIONS = [
  { id: 'meat', label: 'Meat' },
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'pescatarian', label: 'Pescatarian' },
  { id: 'gluten-free', label: 'Gluten-Free' },
  { id: 'keto', label: 'Keto' },
  { id: 'paleo', label: 'Paleo' },
  { id: 'halal', label: 'Halal' },
  { id: 'kosher', label: 'Kosher' },
]

export const ALLERGY_OPTIONS = [
  { id: 'wheat', label: 'Wheat' },
  { id: 'dairy', label: 'Dairy' },
  { id: 'peanuts', label: 'Peanuts' },
  { id: 'tree-nuts', label: 'Tree Nuts' },
  { id: 'eggs', label: 'Eggs' },
  { id: 'soy', label: 'Soy' },
  { id: 'fish', label: 'Fish' },
  { id: 'shellfish', label: 'Shellfish' },
  { id: 'sesame', label: 'Sesame' },
]

export const GOAL_OPTIONS = [
  { id: 'weight-loss', label: 'Weight Loss' },
  { id: 'muscle', label: 'Build Muscle' },
  { id: 'balance', label: 'Balanced Eating' },
  { id: 'reduce-waste', label: 'Reduce Food Waste' },
  { id: 'eat-healthier', label: 'Eat Healthier' },
  { id: 'save-money', label: 'Save Money' },
  { id: 'quick-meals', label: 'Quick Meals' },
]

export const CUISINE_OPTIONS = [
  'American', 'Italian', 'Mexican', 'Chinese', 'Japanese', 'Indian', 'Thai',
  'French', 'Spanish', 'Greek', 'Turkish', 'Lebanese', 'Moroccan', 'Korean',
  'Vietnamese', 'Brazilian', 'Argentinian', 'Peruvian', 'Caribbean', 'Ethiopian',
  'German', 'British', 'Irish', 'Portuguese', 'Russian', 'Polish', 'Hungarian',
  'Swedish', 'Norwegian', 'Danish', 'Filipino', 'Indonesian', 'Malaysian',
  'Singaporean', 'Pakistani', 'Bangladeshi', 'Persian', 'Egyptian', 'Tunisian',
  'Algerian', 'South African', 'Nigerian', 'Australian', 'New Zealand',
  'Hawaiian', 'Cajun', 'Creole', 'Tex-Mex', 'Fusion', 'Mediterranean',
  'Middle Eastern', 'Scandinavian', 'Latin American', 'West African',
  'East African', 'Central American', 'Czech', 'Austrian', 'Swiss',
  'Belgian', 'Dutch', 'Ukrainian', 'Georgian', 'Armenian', 'Israeli',
  'Syrian', 'Iraqi', 'Afghan', 'Nepalese', 'Sri Lankan', 'Cambodian',
  'Laotian', 'Burmese', 'Mongolian', 'Tibetan', 'Cuban', 'Jamaican',
  'Puerto Rican', 'Colombian', 'Chilean', 'Ecuadorian', 'Venezuelan',
]

export function labelForId(options, id) {
  return options.find((o) => o.id === id)?.label ?? id
}

export function labelsFromIds(options, ids) {
  return (ids || []).map((id) => labelForId(options, id))
}
