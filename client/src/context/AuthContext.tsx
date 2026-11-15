import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { shopApi } from '../services/api'
import type { User } from '../types'

interface AuthValue { user: User | null; loading: boolean; signIn: (email: string, password: string) => Promise<void>; signUp: (name: string, email: string, password: string) => Promise<void>; updateProfile: (name: string, email: string) => Promise<void>; signOut: () => void }
const AuthContext = createContext<AuthValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try { const raw = localStorage.getItem('etleva-user'); return raw ? JSON.parse(raw) as User : null } catch { return null }
  })
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('etleva-token')))
  const signOut = useCallback(() => { localStorage.removeItem('etleva-token'); localStorage.removeItem('etleva-user'); setUser(null) }, [])
  useEffect(() => {
    const reset = () => { setUser(null); setLoading(false) }
    window.addEventListener('etleva:unauthorized', reset)
    if (localStorage.getItem('etleva-token')) shopApi.me().then((nextUser) => { setUser(nextUser); localStorage.setItem('etleva-user', JSON.stringify(nextUser)) }).catch(() => signOut()).finally(() => setLoading(false))
    return () => window.removeEventListener('etleva:unauthorized', reset)
  }, [signOut])
  const signIn = useCallback(async (email: string, password: string) => { const result = await shopApi.login(email, password); localStorage.setItem('etleva-token', result.token); localStorage.setItem('etleva-user', JSON.stringify(result.user)); setUser(result.user) }, [])
  const signUp = useCallback(async (name: string, email: string, password: string) => { await shopApi.register(name, email, password); await signIn(email, password) }, [signIn])
  const updateProfile = useCallback(async (name: string, email: string) => { const nextUser = await shopApi.updateProfile(name, email); localStorage.setItem('etleva-user', JSON.stringify(nextUser)); setUser(nextUser) }, [])
  const value = useMemo(() => ({ user, loading, signIn, signUp, updateProfile, signOut }), [user, loading, signIn, signUp, updateProfile, signOut])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() { const value = useContext(AuthContext); if (!value) throw new Error('useAuth must be used inside AuthProvider'); return value }
