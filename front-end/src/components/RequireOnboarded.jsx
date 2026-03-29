import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { isOnboardingComplete, userKey } from '../utils/onboardingStorage'

const RequireOnboarded = () => {
  const raw = localStorage.getItem('user')
  let user = null
  try {
    user = raw ? JSON.parse(raw) : null
  } catch {
    user = null
  }

  if (!user || !userKey(user)) {
    return <Navigate to="/login" replace />
  }

  if (!isOnboardingComplete(user)) {
    return <Navigate to="/onboarding" replace />
  }

  return <Outlet />
}

export default RequireOnboarded
