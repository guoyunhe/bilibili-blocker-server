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
import { useForm } from '@mantine/form'
import { SignInIcon } from '@phosphor-icons/react/SignIn'
import { WarningCircleIcon } from '@phosphor-icons/react/WarningCircle'
import { useState } from 'react'
import { Link, useLocation } from 'wouter'

import { useAuth } from '../contexts/AuthContext.js'
import { login } from '../services/auth.js'
import { errorMessage } from '../utils/error_message.js'
import { clearSavedReturnPath, getSavedReturnPath } from '../utils/return_path.js'
import styles from './AuthPage.module.css'

export default function LoginPage() {
  const [, navigate] = useLocation()
  const { setAuth } = useAuth()
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: { email: '', password: '' },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : '请输入有效的邮箱地址'),
      password: (value) => (value ? null : '请输入密码'),
    },
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const handleSubmit = form.onSubmit(async (values) => {
    setError('')
    setBusy(true)

    try {
      const session = await login(values.email, values.password)
      setAuth(session)
      if (session.user.emailVerifiedAt) {
        const returnTo = getSavedReturnPath()
        clearSavedReturnPath()
        navigate(returnTo ?? '/')
      } else {
        navigate('/email/verification/send')
      }
    } catch (reason) {
      setError(errorMessage(reason))
    } finally {
      setBusy(false)
    }
  })

  return (
    <Container className={styles.authPage} size="xs">
      <Paper className={styles.authPaper} p={{ base: 'lg', sm: 'xl' }} radius="lg" shadow="sm">
        <Stack gap="lg">
          <Group align="center" gap="sm">
            <ThemeIcon color="bilibili" radius="md" size="lg" variant="light">
              <SignInIcon size={22} />
            </ThemeIcon>
            <div>
              <Title order={1} size="h2">
                欢迎回来
              </Title>
              <Text c="dimmed" size="sm">
                登录以继续使用你的账户。
              </Text>
            </div>
          </Group>

          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              <TextInput
                autoComplete="email"
                label="邮箱"
                maxLength={254}
                type="email"
                key={form.key('email')}
                {...form.getInputProps('email')}
              />
              <PasswordInput
                autoComplete="current-password"
                label="密码"
                maxLength={32}
                key={form.key('password')}
                {...form.getInputProps('password')}
              />
              {error && (
                <Alert color="red" icon={<WarningCircleIcon size={20} />} title="操作失败">
                  {error}
                </Alert>
              )}
              <Button fullWidth leftSection={<SignInIcon size={18} />} loading={busy} type="submit">
                登录
              </Button>
            </Stack>
          </form>

          <Text c="dimmed" size="sm" ta="center">
            还没有账户？{' '}
            <Anchor component={Link} href="/register">
              立即注册
            </Anchor>
          </Text>
        </Stack>
      </Paper>
    </Container>
  )
}
