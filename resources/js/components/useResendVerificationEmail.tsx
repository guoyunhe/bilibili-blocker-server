import { Alert } from '@mantine/core'
import { CheckCircleIcon } from '@phosphor-icons/react/CheckCircle'
import { WarningCircleIcon } from '@phosphor-icons/react/WarningCircle'
import { useState } from 'react'

import { resendVerificationEmail } from '../services/auth.js'
import { errorMessage } from '../utils/error_message.js'

export function ResendVerificationStatus({ error, sent }: { error: string; sent: boolean }) {
  if (sent) {
    return (
      <Alert color="green" icon={<CheckCircleIcon size={20} />} title="邮件已发送" w="100%">
        请查收邮箱并点击验证链接。
      </Alert>
    )
  }
  if (error) {
    return (
      <Alert color="red" icon={<WarningCircleIcon size={20} />} title="发送失败" w="100%">
        {error}
      </Alert>
    )
  }
  return null
}

export default function useResendVerificationEmail() {
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [resending, setResending] = useState(false)

  async function send() {
    setError('')
    setSent(false)
    setResending(true)
    try {
      await resendVerificationEmail()
      setSent(true)
    } catch (reason) {
      setError(errorMessage(reason))
    } finally {
      setResending(false)
    }
  }

  return { error, resending, send, sent }
}
