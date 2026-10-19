import { Alert, AppShell, Button, Group } from '@mantine/core'
import { lazy, Suspense, useState } from 'react'
import { Route, Switch, useLocation, useRoute } from 'wouter'

import AppFooter from './components/AppFooter.js'
import AppHeader from './components/AppHeader.js'
import AccountDetailsPage from './pages/AccountDetailsPage.js'
import EmailVerificationPage from './pages/EmailVerificationPage.js'
import EmailVerificationSendPage from './pages/EmailVerificationSendPage.js'
import HomePage from './pages/HomePage.js'
import LoginPage from './pages/LoginPage.js'
import RegisterPage from './pages/RegisterPage.js'
import { useAuth } from './contexts/AuthContext.js'
import { logout } from './services/auth.js'
import { errorMessage } from './utils/error_message.js'
import styles from './App.module.css'

const AdminPage = lazy(() => import('./pages/AdminPage.js'))
const UserProfilePage = lazy(() => import('./pages/UserProfilePage.js'))

export default function App() {
  const [pathname, navigate] = useLocation()
  const [matchesVerificationLink] = useRoute('/email/verification/:token')
  const [logoutBusy, setLogoutBusy] = useState(false)
  const [error, setError] = useState('')
  const { authReady, clearAuth, clearError, error: authError, user } = useAuth()

  function navigateTo(path: string) {
    navigate(path)
    setError('')
    clearError()
  }

  async function handleLogout() {
    setError('')
    setLogoutBusy(true)
    try {
      await logout()
      navigateTo('/')
    } catch (reason) {
      setError(errorMessage(reason))
    } finally {
      clearAuth()
      setLogoutBusy(false)
    }
  }

  const showEmailVerificationNotice =
    authReady &&
    user !== null &&
    !user.emailVerifiedAt &&
    pathname !== '/email/verification/send' &&
    !matchesVerificationLink

  return (
    <AppShell className={styles.appShell} header={{ height: 68 }}>
      <AppHeader
        logoutBusy={logoutBusy}
        onLogout={handleLogout}
        onSearch={(uid) => navigateTo(`/accounts/${uid}`)}
      />
      <AppShell.Main className={styles.appMain}>
        {error && (
          <Alert className={styles.appError} color="red" role="alert" title="请求失败">
            {error}
          </Alert>
        )}
        {authError && (
          <Alert className={styles.appError} color="red" role="alert" title="认证状态加载失败">
            {authError}
          </Alert>
        )}
        {showEmailVerificationNotice && (
          <Alert className={styles.appError} color="yellow" role="status" title="请验证您的邮箱">
            <Group justify="space-between" gap="sm">
              <span>验证邮箱后即可完整使用账户功能。</span>
              <Button
                size="xs"
                variant="light"
                onClick={() => navigateTo('/email/verification/send')}
              >
                前往验证
              </Button>
            </Group>
          </Alert>
        )}
        <Switch>
          <Route path="/accounts/:uid">
            <AccountDetailsPage />
          </Route>
          <Route path="/login">
            <LoginPage />
          </Route>
          <Route path="/register">
            <RegisterPage />
          </Route>
          <Route path="/email/verification/send">
            <EmailVerificationSendPage email={user?.email} />
          </Route>
          <Route path="/email/verification/:token">
            <EmailVerificationPage />
          </Route>
          <Route path="/admin">
            <Suspense fallback={null}>
              <AdminPage />
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
