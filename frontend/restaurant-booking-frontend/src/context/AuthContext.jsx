import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authService } from '../services'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  // Rehydrate from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) {
      try { setUser(JSON.parse(stored)) } catch { localStorage.clear() }
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (credentials) => {
    const { data } = await authService.login(credentials)
    const { accessToken, refreshToken, ...userData } = data.data
    localStorage.setItem('accessToken',  accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    localStorage.setItem('user',         JSON.stringify(userData))
    setUser(userData)
    return userData
  }, [])

  const register = useCallback(async (payload) => {
    const { data } = await authService.register(payload)
    const { accessToken, refreshToken, ...userData } = data.data
    localStorage.setItem('accessToken',  accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    localStorage.setItem('user',         JSON.stringify(userData))
    setUser(userData)
    return userData
  }, [])

  const logout = useCallback(() => {
    localStorage.clear()
    setUser(null)
    toast.success('Logged out successfully')
  }, [])

  const hasRole = useCallback((role) => {
    return user?.roles?.includes(role) ?? false
  }, [user])

  const isAdmin    = hasRole('ROLE_ADMIN')
  const isOwner    = hasRole('ROLE_OWNER')
  const isCustomer = hasRole('ROLE_CUSTOMER')

  return (
    <AuthContext.Provider value={{
      user, loading,
      login, register, logout,
      isAuthenticated: !!user,
      isAdmin, isOwner, isCustomer, hasRole,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
