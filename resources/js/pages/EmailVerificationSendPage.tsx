import { Button, Container, Group, Paper, Stack, Text, ThemeIcon, Title } from '@mantine/core'
import { EnvelopeSimpleIcon } from '@phosphor-icons/react/EnvelopeSimple'
import { useLocation } from 'wouter'

import styles from './EmailVerificationPage.module.css'
import useResendVerificationEmail, {
  ResendVerificationStatus,
} from '../components/useResendVerificationEmail.js'
import { getSavedReturnPath } from '../utils/return_path.js'

type EmailVerificationSendPageProps = {
  email?: string
}

export default function EmailVerificationSendPage({ email }: EmailVerificationSendPageProps) {
  const [, navigate] = useLocation()
  const resend = useResendVerificationEmail()
  const returnTo = getSavedReturnPath()

  return (
    <Container className={styles.verificationPage} size="xs">
      <Paper
        className={styles.verificationPaper}
        p={{ base: 'lg', sm: 'xl' }}
        radius="lg"
        shadow="sm"
      >
        <Stack align="center" gap="lg">
          <ThemeIcon color="bilibili" radius="xl" size={64} variant="light">
            <EnvelopeSimpleIcon size={34} />
          </ThemeIcon>

          <Stack align="center" gap="xs">
            <Title order={1} size="h2" ta="center">
              请验证您的邮箱
            </Title>
            <Text c="dimmed" ta="center">
              我们已向{email ? ` ${email} ` : '您'}发送验证邮件，请点击邮件中的链接完成验证。
            </Text>
          </Stack>

          <ResendVerificationStatus error={resend.error} sent={resend.sent} />

          <Group justify="center">
            <Button loading={resend.resending} onClick={resend.send} variant="light">
              重新发送验证邮件
            </Button>
            <Button onClick={() => navigate(returnTo ?? '/')}>返回</Button>
          </Group>
        </Stack>
      </Paper>
    </Container>
  )
}
