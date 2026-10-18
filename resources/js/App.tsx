import { Alert, AppShell } from '@mantine/core'
import { lazy, Suspense, useEffect, useState } from 'react'

import AccountDetailsPage from './components/AccountDetailsPage.js'
import AppFooter from './components/AppFooter.js'
import AppHeader from './components/AppHeader.js'
import AuthPage from './components/AuthPage.js'
import HomePage from './components/HomePage.js'
import {
  ApiError,
  clearAuthToken,
  getAuthToken,
  getCurrentUser,
  logout,
  type AuthUser,
} from './services/auth.js'
import { errorMessage } from './utils/error_message.js'
import styles from './App.module.css'

const AdminPage = lazy(() => import('./components/AdminPage.js'))
const UserProfilePage = lazy(() => import('./components/UserProfilePage.js'))

export default function App() {
  const [pathname, setPathname] = useState(window.location.pathname)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [authReady, setAuthReady] = useState(!getAuthToken())
  const [logoutBusy, setLogoutBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    function handlePopState() {
      setPathname(window.location.pathname)
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    if (!getAuthToken()) return

    getCurrentUser()
      .then(setUser)
      .catch((reason: unknown) => {
        if (reason instanceof ApiError && (reason.status === 401 || reason.status === 403)) {
          clearAuthToken()
        }
        setError(errorMessage(reason))
      })
      .finally(() => setAuthReady(true))
  }, [])

  function navigateTo(path: string) {
    window.history.pushState({}, '', path)
    setPathname(path)
    setError('')
  }

  async function handleLogout() {
    setError('')
    setLogoutBusy(true)
    try {
      await logout()
      setUser(null)
      navigateTo('/')
    } catch (reason) {
      setError(errorMessage(reason))
    } finally {
      setLogoutBusy(false)
    }
  }

  const accountRoute = pathname.match(/^\/accounts\/([^/]+)$/)
  const userRoute = pathname.match(/^\/users\/([^/]+)$/)
  const authMode = pathname === '/login' ? 'login' : pathname === '/register' ? 'register' : null
  const isAdminRoute = pathname === '/admin'

  function renderPage() {
    if (accountRoute) {
      return (
        <AccountDetailsPage
          authReady={authReady}
          onNavigate={navigateTo}
          uid={accountRoute[1]}
          user={user}
        />
      )
    }
    if (authMode) {
      return <AuthPage mode={authMode} onAuthenticated={setUser} onNavigate={navigateTo} />
    }
    if (isAdminRoute) {
      return (
        <Suspense fallback={null}>
          <AdminPage authReady={authReady} onNavigate={navigateTo} user={user} />
        </Suspense>
      )
    }
    if (userRoute) {
      return (
        <Suspense fallback={null}>
          <UserProfilePage onNavigate={navigateTo} userId={userRoute[1]} />
        </Suspense>
      )
    }
    return <HomePage onSearch={(uid) => navigateTo(`/accounts/${uid}`)} />
  }

  return (
    <AppShell className={styles.appShell} header={{ height: 68 }}>
      <AppHeader
        authReady={authReady}
        logoutBusy={logoutBusy}
        user={user}
        onLogout={handleLogout}
        onNavigate={navigateTo}
        onSearch={(uid) => navigateTo(`/accounts/${uid}`)}
      />
      <AppShell.Main className={styles.appMain}>
        {error && (
          <Alert className={styles.appError} color="red" role="alert" title="请求失败">
            {error}
          </Alert>
        )}
        {renderPage()}
      </AppShell.Main>
      <AppFooter />
    </AppShell>
  )
}
