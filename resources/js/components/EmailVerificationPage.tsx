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
import { EnvelopeSimpleIcon } from '@phosphor-icons/react/EnvelopeSimple'
import { WarningCircleIcon } from '@phosphor-icons/react/WarningCircle'
import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'wouter'

import { resendVerificationEmail, verifyEmail } from '../services/auth.js'
import { errorMessage } from '../utils/error_message.js'
import styles from './EmailVerificationPage.module.css'

type EmailVerificationPageProps = {
  email?: string
  onEmailVerified: (email: string) => void
  token?: string
}

type VerificationStatus = 'pending' | 'verifying' | 'success' | 'error'

export default function EmailVerificationPage({
  email,
  onEmailVerified,
  token,
}: EmailVerificationPageProps) {
  const [, navigate] = useLocation()
  const [status, setStatus] = useState<VerificationStatus>(token ? 'verifying' : 'pending')
  const [error, setError] = useState('')
  const [resendError, setResendError] = useState('')
  const [resendSent, setResendSent] = useState(false)
  const [resending, setResending] = useState(false)
  const requestedToken = useRef<string | null>(null)

  useEffect(() => {
    if (!token || requestedToken.current === token) return

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
      .then((response) => {
        onEmailVerified(response.email)
        setStatus('success')
      })
      .catch((reason: unknown) => {
        setError(errorMessage(reason))
        setStatus('error')
      })
  }, [token])

  const isPending = status === 'pending'
  const isVerifying = status === 'verifying'
  const isSuccess = status === 'success'
  const canResend = isPending || status === 'error'

  async function handleResend() {
    setResendError('')
    setResendSent(false)
    setResending(true)
    try {
      await resendVerificationEmail()
      setResendSent(true)
    } catch (reason) {
      setResendError(errorMessage(reason))
    } finally {
      setResending(false)
    }
  }

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
            {isPending ? (
              <EnvelopeSimpleIcon size={34} />
            ) : isVerifying ? (
              <Loader size="sm" />
            ) : isSuccess ? (
              <CheckCircleIcon size={36} />
            ) : (
              <WarningCircleIcon size={36} />
            )}
          </ThemeIcon>

          <Stack align="center" gap="xs">
            <Title order={1} size="h2" ta="center">
              {isPending
                ? '请验证您的邮箱'
                : isVerifying
                  ? '正在验证邮箱'
                  : isSuccess
                    ? '邮箱验证成功'
                    : '邮箱验证失败'}
            </Title>
            <Text c="dimmed" ta="center">
              {isPending
                ? `我们已向${email ? ` ${email} ` : '您'}发送验证邮件，请点击邮件中的链接完成验证。`
                : isVerifying
                  ? '正在确认您的邮箱地址，请稍候。'
                  : isSuccess
                    ? '您的邮箱地址已验证，可以继续使用账户功能。'
                    : '请检查验证链接是否有效，或重新获取验证邮件。'}
            </Text>
          </Stack>

          {status === 'error' && (
            <Alert color="red" icon={<WarningCircleIcon size={20} />} title="无法完成验证" w="100%">
              {error}
            </Alert>
          )}
          {canResend && resendSent && (
            <Alert color="green" icon={<CheckCircleIcon size={20} />} title="邮件已发送" w="100%">
              请查收邮箱并点击验证链接。
            </Alert>
          )}
          {canResend && resendError && (
            <Alert color="red" icon={<WarningCircleIcon size={20} />} title="发送失败" w="100%">
              {resendError}
            </Alert>
          )}

          <Group justify="center">
            {canResend && (
              <Button loading={resending} onClick={handleResend} variant="light">
                重新发送验证邮件
              </Button>
            )}
            <Button disabled={isVerifying} onClick={() => navigate('/')}>
              返回首页
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Container>
  )
}
