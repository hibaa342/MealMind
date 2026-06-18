const KEY_PREFIX = 'cookpal-onboarding-done-'

export function userKey(user) {
  if (!user) return null
  // API returns Mongo _id; JWT / some paths may use id
  return String(user.id ?? user._id ?? user.email ?? '')
}

export function isOnboardingComplete(user) {
  const key = userKey(user)
  if (!key) return false
  return localStorage.getItem(KEY_PREFIX + key) === '1'
}

export function markOnboardingComplete(user) {
  const key = userKey(user)
  if (key) localStorage.setItem(KEY_PREFIX + key, '1')
}

export function getPostAuthPath(user) {
  if (!user) return '/login'
  if (user.role === 'admin') return '/admin/dashboard'
  return isOnboardingComplete(user) ? '/dashboard' : '/onboarding'
}
