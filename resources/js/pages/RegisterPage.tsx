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
import { UserPlusIcon } from '@phosphor-icons/react/UserPlus'
import { WarningCircleIcon } from '@phosphor-icons/react/WarningCircle'
import { useState } from 'react'
import { useLocation } from 'wouter'

import { useAuth } from '../contexts/AuthContext.js'
import { register } from '../services/auth.js'
import { errorMessage } from '../utils/error_message.js'
import styles from './AuthPage.module.css'

export default function RegisterPage() {
  const [, navigate] = useLocation()
  const { setAuth } = useAuth()
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: { name: '', email: '', password: '', passwordConfirmation: '' },
    validate: {
      name: (value) => (value.trim() ? null : '请输入姓名'),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : '请输入有效的邮箱地址'),
      password: (value) => (value.length >= 8 ? null : '密码至少需要 8 个字符'),
      passwordConfirmation: (value, values) =>
        value === values.password ? null : '两次输入的密码不一致',
    },
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const handleSubmit = form.onSubmit(async (values) => {
    setError('')
    setBusy(true)

    try {
      setAuth(
        await register(
          values.name.trim(),
          values.email,
          values.password,
          values.passwordConfirmation
        )
      )
      navigate('/email/verification/send')
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
              <UserPlusIcon size={22} />
            </ThemeIcon>
            <div>
              <Title order={1} size="h2">
                创建账户
              </Title>
              <Text c="dimmed" size="sm">
                注册后可使用账户功能。
              </Text>
            </div>
          </Group>

          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              <TextInput
                autoComplete="name"
                label="姓名"
                maxLength={32}
                key={form.key('name')}
                {...form.getInputProps('name')}
              />
              <TextInput
                autoComplete="email"
                label="邮箱"
                maxLength={254}
                type="email"
                key={form.key('email')}
                {...form.getInputProps('email')}
              />
              <PasswordInput
                autoComplete="new-password"
                label="密码"
                maxLength={32}
                minLength={8}
                key={form.key('password')}
                {...form.getInputProps('password')}
              />
              <PasswordInput
                autoComplete="new-password"
                label="确认密码"
                maxLength={32}
                minLength={8}
                key={form.key('passwordConfirmation')}
                {...form.getInputProps('passwordConfirmation')}
              />
              {error && (
                <Alert color="red" icon={<WarningCircleIcon size={20} />} title="操作失败">
                  {error}
                </Alert>
              )}
              <Button
                fullWidth
                leftSection={<UserPlusIcon size={18} />}
                loading={busy}
                type="submit"
              >
                注册
              </Button>
            </Stack>
          </form>

          <Text c="dimmed" size="sm" ta="center">
            已有账户？{' '}
            <Anchor component="button" type="button" onClick={() => navigate('/login')}>
              登录
            </Anchor>
          </Text>
        </Stack>
      </Paper>
    </Container>
  )
}
