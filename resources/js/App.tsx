import { Alert, AppShell, Button, Group } from '@mantine/core'
import { lazy, Suspense, useEffect, useState } from 'react'
import { Link, Route, Switch, useLocation, useRoute, useSearch } from 'wouter'

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
import { createReturnPath, saveReturnPath } from './utils/return_path.js'
import styles from './App.module.css'

const AdminPage = lazy(() => import('./pages/AdminPage.js'))
const UserProfilePage = lazy(() => import('./pages/UserProfilePage.js'))

export default function App() {
  const [pathname, navigate] = useLocation()
  const search = useSearch()
  const [matchesVerificationLink] = useRoute('/email/verification/:token')
  const [logoutBusy, setLogoutBusy] = useState(false)
  const [error, setError] = useState('')
  const { authReady, clearAuth, clearError, error: authError, user } = useAuth()
  const returnTo = createReturnPath(pathname, search, window.location.hash)

  useEffect(() => {
    const accountMatch = pathname.match(/^\/accounts\/(\d+)\/?$/)
    const isHomepage = pathname === '/'
    const isIndexable = isHomepage || accountMatch !== null
    const title = accountMatch
      ? `B站账号 UID ${accountMatch[1]} 屏蔽规则查询 | Bilibili Blocker`
      : 'Bilibili Blocker - B站账号屏蔽与社区规则查询'
    const description = accountMatch
      ? `查询 Bilibili 账号 UID ${accountMatch[1]} 的社区标记与屏蔽规则，查看规则关联状态并参与投票。`
      : '使用 Bilibili Blocker 查询 B 站账号屏蔽规则，社区协作标记不良内容账号，并下载 Chrome、Firefox 和 Edge 浏览器插件。'
    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    const canonicalUrl = new URL(
      pathname,
      canonical ? new URL(canonical.href).origin : window.location.origin
    ).toString()

    document.title = title

    const updateMeta = (selector: string, attribute: string, value: string) => {
      let element = document.head.querySelector<HTMLMetaElement>(selector)
      if (!element) {
        element = document.createElement('meta')
        document.head.append(element)
      }
      element.setAttribute(attribute, value)
    }

    updateMeta('meta[name="description"]', 'content', description)
    updateMeta('meta[name="robots"]', 'content', isIndexable ? 'index,follow' : 'noindex,follow')
    updateMeta('meta[property="og:title"]', 'content', title)
    updateMeta('meta[property="og:description"]', 'content', description)
    updateMeta('meta[property="og:url"]', 'content', canonicalUrl)
    updateMeta('meta[name="twitter:title"]', 'content', title)
    updateMeta('meta[name="twitter:description"]', 'content', description)

    if (canonical) canonical.href = canonicalUrl
  }, [pathname])

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
      <AppHeader logoutBusy={logoutBusy} onLogout={handleLogout} />
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
                component={Link}
                href="/email/verification/send"
                size="xs"
                variant="light"
                onClick={() => {
                  if (returnTo) saveReturnPath(returnTo)
                  setError('')
                  clearError()
                }}
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
            <EmailVerificationSendPage />
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
            <HomePage />
          </Route>
        </Switch>
      </AppShell.Main>
      <AppFooter />
    </AppShell>
  )
}
