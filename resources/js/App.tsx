import { Alert, AppShell, Button, Group } from '@mantine/core'
import { lazy, Suspense, useEffect, useState } from 'react'
import { Route, Switch, useLocation, useRoute } from 'wouter'

import AccountDetailsPage from './components/AccountDetailsPage.js'
import AppFooter from './components/AppFooter.js'
import AppHeader from './components/AppHeader.js'
import AuthPage from './components/AuthPage.js'
import EmailVerificationPage from './components/EmailVerificationPage.js'
import EmailVerificationSendPage from './components/EmailVerificationSendPage.js'
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
  const [pathname, navigate] = useLocation()
  const [matchesVerificationLink] = useRoute('/email/verify/:token')
  const [user, setUser] = useState<AuthUser | null>(null)
  const [authReady, setAuthReady] = useState(!getAuthToken())
  const [logoutBusy, setLogoutBusy] = useState(false)
  const [error, setError] = useState('')

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
    navigate(path)
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

  const showEmailVerificationNotice =
    authReady &&
    user !== null &&
    !user.emailVerifiedAt &&
    pathname !== '/verify-email' &&
    !matchesVerificationLink

  return (
    <AppShell className={styles.appShell} header={{ height: 68 }}>
      <AppHeader
        authReady={authReady}
        logoutBusy={logoutBusy}
        user={user}
        onLogout={handleLogout}
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
        <Switch>
          <Route path="/accounts/:uid">
            <AccountDetailsPage authReady={authReady} user={user} />
          </Route>
          <Route path="/login">
            <AuthPage mode="login" onAuthenticated={setUser} />
          </Route>
          <Route path="/register">
            <AuthPage mode="register" onAuthenticated={setUser} />
          </Route>
          <Route path="/verify-email">
            <EmailVerificationSendPage email={user?.email} />
          </Route>
          <Route path="/email/verify/:token">
            <EmailVerificationPage />
          </Route>
          <Route path="/admin">
            <Suspense fallback={null}>
              <AdminPage authReady={authReady} user={user} />
            </Suspense>
          </Route>
          <Route path="/users/:userId">
            <Suspense fallback={null}>
              <UserProfilePage />
            </Suspense>
          </Route>
          <Route>
            <HomePage onSearch={(uid) => navigateTo(`/accounts/${uid}`)} />
          </Route>
        </Switch>
      </AppShell.Main>
      <AppFooter />
    </AppShell>
  )
}
