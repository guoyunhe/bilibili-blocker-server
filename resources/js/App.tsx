import { Alert, AppShell, Button, Group } from '@mantine/core'
import { lazy, Suspense, useEffect, useState } from 'react'

import AccountDetailsPage from './components/AccountDetailsPage.js'
import AppFooter from './components/AppFooter.js'
import AppHeader from './components/AppHeader.js'
import AuthPage from './components/AuthPage.js'
import EmailVerificationPage from './components/EmailVerificationPage.js'
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
  const emailVerificationRoute = pathname.match(/^\/email\/verify\/([^/]+)$/)
  const authMode = pathname === '/login' ? 'login' : pathname === '/register' ? 'register' : null
  const isAdminRoute = pathname === '/admin'
  const showEmailVerificationNotice =
    authReady &&
    user !== null &&
    !user.emailVerifiedAt &&
    pathname !== '/verify-email' &&
    !emailVerificationRoute

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
    if (pathname === '/verify-email' || emailVerificationRoute) {
      return (
        <EmailVerificationPage
          email={user?.email}
          onEmailVerified={(email) => {
            setUser((currentUser) =>
              currentUser?.email === email
                ? { ...currentUser, emailVerifiedAt: new Date().toISOString() }
                : currentUser
            )
          }}
          onNavigate={navigateTo}
          token={emailVerificationRoute?.[1]}
        />
      )
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
        {showEmailVerificationNotice && (
          <Alert className={styles.appError} color="yellow" role="status" title="请验证您的邮箱">
            <Group justify="space-between" gap="sm">
              <span>验证邮箱后即可完整使用账户功能。</span>
              <Button size="xs" variant="light" onClick={() => navigateTo('/verify-email')}>
                前往验证
              </Button>
            </Group>
          </Alert>
        )}
        {renderPage()}
      </AppShell.Main>
      <AppFooter />
    </AppShell>
  )
}
