import { useCallback, useEffect, useState } from 'react'
import { AuthContext } from './contexts'
import { api, tokenStore } from '../lib/api'

export default function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null)
  const [status, setStatus] = useState(() => (tokenStore.get() ? 'checking' : 'guest'))

  // Validate a saved token on first load.
  useEffect(() => {
    if (!tokenStore.get()) return undefined
    let active = true
    api
      .get('/api/auth/me')
      .then(({ data }) => {
        if (!active) return
        setAdmin(data)
        setStatus('authenticated')
      })
      .catch(() => {
        if (!active) return
        tokenStore.clear()
        setStatus('guest')
      })
    return () => {
      active = false
    }
  }, [])

  // Any 401 from the API logs the user out.
  useEffect(() => {
    const onLogout = () => {
      setAdmin(null)
      setStatus('guest')
    }
    window.addEventListener('auth:logout', onLogout)
    return () => window.removeEventListener('auth:logout', onLogout)
  }, [])

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/api/auth/login', { email, password })
    tokenStore.set(data.token)
    setAdmin(data.admin)
    setStatus('authenticated')
  }, [])

  const logout = useCallback(() => {
    tokenStore.clear()
    setAdmin(null)
    setStatus('guest')
  }, [])

  return <AuthContext.Provider value={{ admin, status, login, logout }}>{children}</AuthContext.Provider>
}
