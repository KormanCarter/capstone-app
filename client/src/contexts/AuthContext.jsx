import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  const toBoolean = (value) => {
    if (typeof value === 'boolean') return value
    if (typeof value === 'number') return value === 1
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase()
      return normalized === '1' || normalized === 'true' || normalized === 't' || normalized === 'yes' || normalized === 'y' || normalized === 'on'
    }
    return false
  }

  const normalizeUser = (rawUser) => {
    if (!rawUser) return null
    const isAdminValue = rawUser.is_admin ?? rawUser.isAdmin
    const isAdmin = toBoolean(isAdminValue)
    return {
      ...rawUser,
      is_admin: isAdmin
    }
  }

  const checkAdminAccess = async () => {
    try {
      const response = await fetch('/api/admin/users', { credentials: 'include' })
      return response.ok
    } catch {
      return false
    }
  }

  // Check if user is authenticated on app load
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/auth/user', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        const normalized = normalizeUser(data.user)
        setUser(normalized)
        const adminByProbe = await checkAdminAccess()
        setIsAdmin(normalized?.is_admin || adminByProbe)
      } else {
        setUser(null)
        setIsAdmin(false)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setUser(null)
      setIsAdmin(false)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (response.ok) {
        const normalized = normalizeUser(data.user)
        setUser(normalized)
        const adminByProbe = await checkAdminAccess()
        setIsAdmin(normalized?.is_admin || adminByProbe)
        return { success: true }
      } else {
        return { success: false, error: data.message }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Network error. Please try again.' }
    }
  }

  const register = async (email, password, name) => {
    try {
      const response = await fetch('/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ email, password, name })
      })

      const data = await response.json()

      if (response.ok) {
        const normalized = normalizeUser(data.user)
        setUser(normalized)
        const adminByProbe = await checkAdminAccess()
        setIsAdmin(normalized?.is_admin || adminByProbe)
        return { success: true }
      } else {
        return { success: false, error: data.message }
      }
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, error: 'Network error. Please try again.' }
    }
  }

  const logout = async () => {
    try {
      await fetch('/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
      setUser(null)
      setIsAdmin(false)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const loginWithGoogle = () => {
    const backendUrl = (import.meta.env.VITE_BACKEND_URL || (
      window.location.hostname === 'localhost' ? 'http://localhost:3001' : window.location.origin
    )).replace(/\/$/, '')
    window.location.href = `${backendUrl}/auth/google`
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    loginWithGoogle,
    isAdmin,
    isAuthenticated: !!user
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}