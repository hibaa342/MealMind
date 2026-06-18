import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'

const AdminRoute = ({ user }) => {
  // Check if user object exists and their role is admin
  if (!user || user.role !== 'admin') {
    console.warn('[AUTH] Access denied. User is not an admin.')
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}

export default AdminRoute
