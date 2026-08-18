import { createContext, useContext, useEffect, useState } from 'react'
import { api, getToken, setToken, clearToken } from './api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // 启动时如果本地有 token，就恢复登录状态
  useEffect(() => {
    if (!getToken()) { setLoading(false); return }
    api('/me')
      .then((d) => setUser(d.user))
      .catch(() => clearToken())
      .finally(() => setLoading(false))
  }, [])

  async function login(username, password) {
    const d = await api('/login', { method: 'POST', body: JSON.stringify({ username, password }) })
    setToken(d.token)
    setUser(d.user)
  }

  async function register(inviteCode, username, password, displayName) {
    const d = await api('/register', {
      method: 'POST',
      body: JSON.stringify({ inviteCode, username, password, displayName })
    })
    setToken(d.token)
    setUser(d.user)
  }

  async function logout() {
    await api('/logout', { method: 'POST' }).catch(() => {})
    clearToken()
    setUser(null)
  }

  async function refreshUser() {
    const d = await api('/me')
    setUser(d.user)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() { return useContext(AuthContext) }
