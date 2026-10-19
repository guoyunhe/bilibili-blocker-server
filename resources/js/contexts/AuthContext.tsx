import { useLocalStorage } from '@guoyunhe/react-storage'
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

import {
  ApiError,
  getCurrentUser,
  parseAuthState,
  type AuthSession,
  type AuthUser,
  type PersistedAuthState,
} from '../services/auth.js'
import { errorMessage } from '../utils/error_message.js'

type AuthContextValue = PersistedAuthState & {
  authReady: boolean
  error: string
  setAuth: (session: AuthSession) => void
  setUser: (user: AuthUser) => void
  refreshUser: () => Promise<void>
  clearAuth: () => void
  clearError: () => void
}

const authStorageKey = 'auth-state'
const legacyTokenKey = 'auth-token'
const emptyAuthState: PersistedAuthState = { token: null, user: null }
const AuthContext = createContext<AuthContextValue | null>(null)

function getInitialAuthState(): PersistedAuthState {
  const legacyToken = localStorage.getItem(legacyTokenKey)
  return legacyToken ? { token: legacyToken, user: null } : emptyAuthState
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setStoredAuth] = useLocalStorage<PersistedAuthState>(
    authStorageKey,
    getInitialAuthState(),
    { parser: parseAuthState }
  )
  const [authReady, setAuthReady] = useState(!auth.token)
  const [error, setError] = useState('')
  const initialToken = useRef(auth.token).current

  const setAuth = useCallback(
    (session: AuthSession) => {
      setStoredAuth({ token: session.token, user: session.user })
      setAuthReady(true)
      setError('')
    },
    [setStoredAuth]
  )

  const setUser = useCallback(
    (user: AuthUser) => {
      setStoredAuth((current) => ({ ...current, user }))
    },
    [setStoredAuth]
  )

  const clearAuth = useCallback(() => {
    setStoredAuth(emptyAuthState)
    setAuthReady(true)
    setError('')
  }, [setStoredAuth])

  const refreshUser = useCallback(async () => {
    if (!auth.token) return

    try {
      setUser(await getCurrentUser())
      setError('')
    } catch (reason: unknown) {
      if (reason instanceof ApiError && (reason.status === 401 || reason.status === 403)) {
        clearAuth()
      } else {
        setError(errorMessage(reason))
      }
    }
  }, [auth.token, clearAuth, setUser])

  const clearError = useCallback(() => setError(''), [])

  useEffect(() => {
    const legacyToken = localStorage.getItem(legacyTokenKey)
    if (legacyToken) {
      if (!localStorage.getItem(authStorageKey)) {
        setStoredAuth({ token: legacyToken, user: null })
      }
      localStorage.removeItem(legacyTokenKey)
    }
  }, [auth, setStoredAuth])

  useEffect(() => {
    if (!initialToken) return

    let active = true
    getCurrentUser()
      .then((user) => {
        if (active) setUser(user)
      })
      .catch((reason: unknown) => {
        if (!active) return
        if (reason instanceof ApiError && (reason.status === 401 || reason.status === 403)) {
          clearAuth()
        } else {
          setError(errorMessage(reason))
        }
      })
      .finally(() => {
        if (active) setAuthReady(true)
      })

    return () => {
      active = false
    }
  }, [initialToken, setUser, clearAuth])

  return (
    <AuthContext.Provider
      value={{ ...auth, authReady, error, setAuth, setUser, refreshUser, clearAuth, clearError }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
