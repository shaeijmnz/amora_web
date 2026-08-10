import { createContext, useContext, useEffect, useState } from 'react'
import { api, clearAdminSession, getAdminToken, saveAdminSession } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    function dropSession() {
      clearAdminSession()
      setUser(null)
      setProfile(null)
    }

    async function boot() {
      // Drop legacy local-only preview sessions (pre-Laravel admin API)
      localStorage.removeItem('amora_local_admin')

      const token = getAdminToken()
      if (!token) {
        dropSession()
        setLoading(false)
        return
      }
      try {
        const { user: me } = await api.adminMe()
        setUser(me)
        setProfile({ full_name: me.name, role: me.role })
        saveAdminSession(token, me)
      } catch {
        // Invalid/expired token → force re-login so pages don't show empty live data
        dropSession()
      } finally {
        setLoading(false)
      }
    }
    boot()

    window.addEventListener('amora-admin-auth-lost', dropSession)
    return () => window.removeEventListener('amora-admin-auth-lost', dropSession)
  }, [])

  async function signInWithEmail(email, password) {
    const data = await api.adminLogin(email, password)
    saveAdminSession(data.token, data.user)
    setUser(data.user)
    setProfile({ full_name: data.user.name, role: data.user.role })
    return data
  }

  async function signUpWithEmail() {
    throw new Error('Admin accounts are created by the team. Use admin login.')
  }

  async function resendConfirmation() {}

  async function signOut() {
    try {
      await api.adminLogout()
    } catch {
      // ignore
    }
    clearAdminSession()
    setUser(null)
    setProfile(null)
  }

  async function resetPassword() {
    throw new Error('Ask your developer to reset admin password in Laravel.')
  }

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      hasSupabase: false,
      signInWithEmail,
      signUpWithEmail,
      resendConfirmation,
      signOut,
      resetPassword,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
