import {
  Alert,
  Anchor,
  Button,
  Container,
  Group,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
} from '@mantine/core'
import { SignInIcon } from '@phosphor-icons/react/SignIn'
import { UserPlusIcon } from '@phosphor-icons/react/UserPlus'
import { WarningCircleIcon } from '@phosphor-icons/react/WarningCircle'
import { useState, type FormEvent } from 'react'

import { login, register, type AuthUser } from '../services/auth.js'
import { errorMessage } from '../utils/error_message.js'
import styles from './AuthPage.module.css'

type AuthMode = 'login' | 'register'

type AuthPageProps = {
  mode: AuthMode
  onAuthenticated: (user: AuthUser) => void
  onNavigate: (path: string) => void
}

export default function AuthPage({ mode, onAuthenticated, onNavigate }: AuthPageProps) {
  const isRegister = mode === 'register'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setBusy(true)

    try {
      const user = isRegister
        ? await register(name.trim(), email, password, passwordConfirmation)
        : await login(email, password)
      onAuthenticated(user)
      onNavigate(isRegister ? '/verify-email' : '/')
    } catch (reason) {
      setError(errorMessage(reason))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Container className={styles.authPage} size="xs">
      <Paper className={styles.authPaper} p={{ base: 'lg', sm: 'xl' }} radius="lg" shadow="sm">
        <Stack gap="lg">
          <Group align="center" gap="sm">
            <ThemeIcon color="bilibili" radius="md" size="lg" variant="light">
              {isRegister ? <UserPlusIcon size={22} /> : <SignInIcon size={22} />}
            </ThemeIcon>
            <div>
              <Title order={1} size="h2">
                {isRegister ? '创建账户' : '欢迎回来'}
              </Title>
              <Text c="dimmed" size="sm">
                {isRegister ? '注册后可使用账户功能。' : '登录以继续使用你的账户。'}
              </Text>
            </div>
          </Group>

          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              {isRegister && (
                <TextInput
                  autoComplete="name"
                  label="姓名"
                  maxLength={32}
                  required
                  value={name}
                  onChange={(event) => setName(event.currentTarget.value)}
                />
              )}
              <TextInput
                autoComplete="email"
                label="邮箱"
                maxLength={254}
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.currentTarget.value)}
              />
              <PasswordInput
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                label="密码"
                maxLength={32}
                minLength={isRegister ? 8 : undefined}
                required
                value={password}
                onChange={(event) => setPassword(event.currentTarget.value)}
              />
              {isRegister && (
                <PasswordInput
                  autoComplete="new-password"
                  label="确认密码"
                  maxLength={32}
                  minLength={8}
                  required
                  value={passwordConfirmation}
                  onChange={(event) => setPasswordConfirmation(event.currentTarget.value)}
                />
              )}
              {error && (
                <Alert color="red" icon={<WarningCircleIcon size={20} />} title="操作失败">
                  {error}
                </Alert>
              )}
              <Button
                fullWidth
                leftSection={isRegister ? <UserPlusIcon size={18} /> : <SignInIcon size={18} />}
                loading={busy}
                type="submit"
              >
                {isRegister ? '注册' : '登录'}
              </Button>
            </Stack>
          </form>

          <Text c="dimmed" size="sm" ta="center">
            {isRegister ? '已有账户？' : '还没有账户？'}{' '}
            <Anchor
              component="button"
              type="button"
              onClick={() => onNavigate(isRegister ? '/login' : '/register')}
            >
              {isRegister ? '登录' : '立即注册'}
            </Anchor>
          </Text>
        </Stack>
      </Paper>
    </Container>
  )
}
