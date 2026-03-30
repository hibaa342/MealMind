const KEY_PREFIX = 'cookpal-onboarding-done-'

export function userKey(user) {
  if (!user) return null
  return String(user.id ?? user.email ?? '')
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
  return isOnboardingComplete(user) ? '/dashboard' : '/onboarding'
}
