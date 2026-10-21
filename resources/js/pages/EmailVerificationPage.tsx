import {
  Alert,
  Button,
  Container,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core'
import { CheckCircleIcon } from '@phosphor-icons/react/CheckCircle'
import { WarningCircleIcon } from '@phosphor-icons/react/WarningCircle'
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useParams } from 'wouter'

import styles from './EmailVerificationPage.module.css'
import useResendVerificationEmail, {
  ResendVerificationStatus,
} from '../components/useResendVerificationEmail.js'
import { useAuth } from '../contexts/AuthContext.js'
import { verifyEmail } from '../services/auth.js'
import { errorMessage } from '../utils/error_message.js'
import { clearSavedReturnPath, getSavedReturnPath } from '../utils/return_path.js'

type VerificationStatus = 'verifying' | 'success' | 'error'

export default function EmailVerificationPage() {
  const [, navigate] = useLocation()
  const { token } = useParams<{ token?: string }>()
  const { refreshUser } = useAuth()
  const [status, setStatus] = useState<VerificationStatus>(token ? 'verifying' : 'error')
  const [error, setError] = useState('')
  const resend = useResendVerificationEmail()
  const requestedToken = useRef<string | null>(null)

  useEffect(() => {
    if (status !== 'success') return

    const timeout = window.setTimeout(() => {
      const returnTo = getSavedReturnPath()
      clearSavedReturnPath()
      navigate(returnTo ?? '/')
    }, 2000)
    return () => window.clearTimeout(timeout)
  }, [status, navigate])

  useEffect(() => {
    if (!token) {
      setError('验证链接缺少令牌，请重新获取验证邮件。')
      setStatus('error')
      return
    }
    if (requestedToken.current === token) return

    requestedToken.current = token
    setStatus('verifying')
    let decodedToken: string
    try {
      decodedToken = decodeURIComponent(token)
    } catch {
      setError('验证链接格式无效，请重新获取验证邮件。')
      setStatus('error')
      return
    }

    verifyEmail(decodedToken)
      .then(async () => {
        setStatus('success')
        await refreshUser()
      })
      .catch((reason: unknown) => {
        setError(errorMessage(reason))
        setStatus('error')
      })
  }, [token, refreshUser])

  const isVerifying = status === 'verifying'
  const isSuccess = status === 'success'

  return (
    <Container className={styles.verificationPage} size="xs">
      <Paper
        className={styles.verificationPaper}
        p={{ base: 'lg', sm: 'xl' }}
        radius="lg"
        shadow="sm"
      >
        <Stack align="center" gap="lg">
          <ThemeIcon
            color={isSuccess ? 'green' : status === 'error' ? 'red' : 'bilibili'}
            radius="xl"
            size={64}
            variant="light"
          >
            {isVerifying ? (
              <Loader size="sm" />
            ) : isSuccess ? (
              <CheckCircleIcon size={36} />
            ) : (
              <WarningCircleIcon size={36} />
            )}
          </ThemeIcon>

          <Stack align="center" gap="xs">
            <Title order={1} size="h2" ta="center">
              {isVerifying ? '正在验证邮箱' : isSuccess ? '邮箱验证成功' : '邮箱验证失败'}
            </Title>
            <Text c="dimmed" ta="center">
              {isVerifying
                ? '正在确认您的邮箱地址，请稍候。'
                : isSuccess
                  ? '您的邮箱地址已验证，可以继续使用账户功能。'
                  : '请检查验证链接是否有效，或重新获取验证邮件。'}
            </Text>
          </Stack>

          {status === 'error' && (
            <>
              <Alert
                color="red"
                icon={<WarningCircleIcon size={20} />}
                title="无法完成验证"
                w="100%"
              >
                {error}
              </Alert>
              <ResendVerificationStatus error={resend.error} sent={resend.sent} />
            </>
          )}

          <Group justify="center">
            {status === 'error' && (
              <Button loading={resend.resending} onClick={resend.send} variant="light">
                重新发送验证邮件
              </Button>
            )}
            {isVerifying ? (
              <Button disabled>返回首页</Button>
            ) : (
              <Button
                component={Link}
                href={getSavedReturnPath() ?? '/'}
                onClick={() => {
                  if (isSuccess) clearSavedReturnPath()
                }}
              >
                {isSuccess ? '返回原页面' : '返回首页'}
              </Button>
            )}
          </Group>
        </Stack>
      </Paper>
    </Container>
  )
}
