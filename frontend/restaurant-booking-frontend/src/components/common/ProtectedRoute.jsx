import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import LoadingSpinner from './index'

export default function ProtectedRoute({ roles = [] }) {
  const { isAuthenticated, user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <LoadingSpinner fullPage />
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />

  if (roles.length > 0) {
    const hasAccess = roles.some(r => user?.roles?.includes(r))
    if (!hasAccess) return <Navigate to="/" replace />
  }

  return <Outlet />
}
