import { useEffect, useState, type FormEvent } from 'react'

import {
  ApiError,
  clearAuthToken,
  getAuthToken,
  getCurrentUser,
  login,
  logout,
  register,
  type AuthUser,
} from './services/auth.js'

type AuthMode = 'login' | 'register'

function errorMessage(reason: unknown) {
  return reason instanceof Error ? reason.message : '请求失败，请稍后重试'
}

function initialMode(): AuthMode {
  return window.location.pathname === '/register' ? 'register' : 'login'
}

export default function App() {
  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [ready, setReady] = useState(!getAuthToken())
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    function handlePopState() {
      setMode(initialMode())
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
      .finally(() => setReady(true))
  }, [])

  function navigate(nextMode: AuthMode) {
    window.history.pushState({}, '', nextMode === 'register' ? '/register' : '/login')
    setMode(nextMode)
    setError('')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setBusy(true)

    try {
      if (mode === 'register') {
        setUser(await register(name.trim(), email, password, passwordConfirmation))
      } else {
        setUser(await login(email, password))
      }
      window.history.pushState({}, '', '/')
    } catch (reason) {
      setError(errorMessage(reason))
    } finally {
      setBusy(false)
    }
  }

  async function handleLogout() {
    setError('')
    setBusy(true)
    try {
      await logout()
      setUser(null)
      setMode('login')
      window.history.pushState({}, '', '/login')
    } catch (reason) {
      setError(errorMessage(reason))
    } finally {
      setBusy(false)
    }
  }

  if (!ready) {
    return (
      <main className="page">
        <section className="card" aria-live="polite">
          <p className="eyebrow">BILIBILI BLOCKER</p>
          <p>正在载入账户…</p>
        </section>
      </main>
    )
  }

  if (user) {
    return (
      <main className="page">
        <section className="card account-card">
          <p className="eyebrow">BILIBILI BLOCKER</p>
          <div className="avatar" aria-hidden="true">
            {user.initials}
          </div>
          <h1>欢迎回来，{user.fullName || user.email}</h1>
          <p className="muted">{user.email}</p>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <button className="primary-button" type="button" disabled={busy} onClick={handleLogout}>
            {busy ? '正在退出…' : '退出登录'}
          </button>
        </section>
      </main>
    )
  }

  const isRegister = mode === 'register'

  return (
    <main className="page">
      <section className="card">
        <p className="eyebrow">BILIBILI BLOCKER</p>
        <h1>{isRegister ? '创建账户' : '欢迎回来'}</h1>
        <p className="muted">{isRegister ? '注册账户以继续使用。' : '登录以继续使用你的账户。'}</p>
        <form className="form" onSubmit={handleSubmit}>
          {isRegister && (
            <label>
              姓名
              <input
                autoComplete="name"
                maxLength={32}
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </label>
          )}
          <label>
            邮箱
            <input
              autoComplete="email"
              type="email"
              maxLength={254}
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label>
            密码
            <input
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              type="password"
              minLength={isRegister ? 8 : undefined}
              maxLength={32}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          {isRegister && (
            <label>
              确认密码
              <input
                autoComplete="new-password"
                type="password"
                minLength={8}
                maxLength={32}
                required
                value={passwordConfirmation}
                onChange={(event) => setPasswordConfirmation(event.target.value)}
              />
            </label>
          )}
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <button className="primary-button" type="submit" disabled={busy}>
            {busy ? '请稍候…' : isRegister ? '注册' : '登录'}
          </button>
        </form>
        <p className="switch-mode">
          {isRegister ? '已有账户？' : '还没有账户？'}{' '}
          <a
            href={isRegister ? '/login' : '/register'}
            onClick={(event) => {
              event.preventDefault()
              navigate(isRegister ? 'login' : 'register')
            }}
          >
            {isRegister ? '登录' : '立即注册'}
          </a>
        </p>
      </section>
    </main>
  )
}
