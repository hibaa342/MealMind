const STORAGE_KEY = 'cookpal-display-name'

export function getPreferredDisplayName() {
  try {
    return localStorage.getItem(STORAGE_KEY)?.trim() || ''
  } catch {
    return ''
  }
}

export function setPreferredDisplayName(value) {
  const v = value?.trim() || ''
  try {
    if (v) localStorage.setItem(STORAGE_KEY, v)
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event('cookpal-display-name-changed'))
}

/** Label for sidebar / header when no preferred override: name, then email handle, then neutral default. */
export function getDisplayNameFromUser(user) {
  if (!user) return 'Member'
  const n = user.name?.trim()
  if (n) return n
  const email = user.email?.trim()
  if (email?.includes('@')) {
    const local = email.split('@')[0]
    const words = local.replace(/[._-]+/g, ' ').trim()
    if (words) {
      return words
        .split(/\s+/)
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ')
    }
  }
  return 'Member'
}

export function getSubtitleFromUser(user) {
  const t = user?.title?.trim()
  if (t) return t
  return 'Smarter meals, less waste'
}
