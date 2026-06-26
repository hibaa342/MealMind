import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getApiBase, getAuthHeaders } from '../api/client'
import { getDisplayNameFromUser } from '../utils/userDisplay'
import {
  ALLERGY_OPTIONS,
  CUISINE_OPTIONS,
  DIET_OPTIONS,
  GOAL_OPTIONS,
  labelForId,
} from '../constants/profileOptions'

const UserContext = createContext(null)

const API_BASE = getApiBase()

export function UserProvider({ children, sessionUser }) {
  const [profile, setProfile] = useState(null)
  const [topRecipes, setTopRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const fetchProfile = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setProfile(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const headers = getAuthHeaders()
      
      const [profileRes, recipesRes] = await Promise.all([
        fetch(`${API_BASE}/api/user/profile`, { headers }),
        fetch(`${API_BASE}/api/user/profile/top-recipes`, { headers }),
      ])
      
      if (!profileRes.ok || !recipesRes.ok) {
        throw new Error('Failed to fetch profile data from server')
      }
      
      const profileData = await profileRes.json()
      const recipesData = await recipesRes.json()
      
      setProfile(profileData)
      setTopRecipes(recipesData?.recipes ?? [])
    } catch (err) {
      console.error('Failed to fetch profile via fetch()', err)
      setError(err.message || 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile, sessionUser?._id])

  const updateProfile = useCallback(async (updates) => {
    setSaving(true)
    setError(null)
    try {
      const headers = getAuthHeaders()
      const res = await fetch(`${API_BASE}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify(updates),
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || 'Failed to update database profile')
      }
      
      const data = await res.json()
      setProfile(data)
      return data
    } catch (err) {
      const msg = err.message || 'Failed to save profile'
      setError(msg)
      throw err
    } finally {
      setSaving(false)
    }
  }, [])

  const displayName = useMemo(() => {
    const override = profile?.nameSidebarOverride?.trim()
    if (override) return override
    return getDisplayNameFromUser(profile || sessionUser)
  }, [profile, sessionUser])

  const sidebarPrefs = useMemo(() => ({
    diets: (profile?.diet ?? []).map((id) => labelForId(DIET_OPTIONS, id)),
    allergies: (profile?.allergies ?? []).map((id) => labelForId(ALLERGY_OPTIONS, id)),
    cuisines: profile?.cuisines ?? [],
    goals: (profile?.goals ?? []).map((id) => labelForId(GOAL_OPTIONS, id)),
  }), [profile])

  const value = useMemo(
    () => ({
      profile,
      topRecipes,
      loading,
      saving,
      error,
      displayName,
      sidebarPrefs,
      fetchProfile,
      updateProfile,
      setProfile,
    }),
    [profile, topRecipes, loading, saving, error, displayName, sidebarPrefs, fetchProfile, updateProfile],
  )

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) {
    throw new Error('useUser must be used within UserProvider')
  }
  return ctx
}

export { DIET_OPTIONS, ALLERGY_OPTIONS, GOAL_OPTIONS, CUISINE_OPTIONS, labelForId }