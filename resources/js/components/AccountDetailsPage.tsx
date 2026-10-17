import { Alert, Badge, Container, Group, Loader, Paper, Stack, Text, Title } from '@mantine/core'
import { WarningCircleIcon } from '@phosphor-icons/react/WarningCircle'
import { useEffect, useState } from 'react'

import { getAccount, type AccountDetails } from '../services/accounts.js'
import { errorMessage } from '../utils/error_message.js'

export default function AccountDetailsPage({ uid }: { uid: string }) {
  const [account, setAccount] = useState<AccountDetails | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setAccount(null)
    setError('')

    if (!/^\d+$/.test(uid)) {
      setError('UID 必须为纯数字')
      setLoading(false)
      return () => {
        active = false
      }
    }

    setLoading(true)
    getAccount(uid)
      .then((result) => {
        if (active) setAccount(result)
      })
      .catch((reason: unknown) => {
        if (active) setError(errorMessage(reason))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [uid])

  return (
    <Container className="details-page" size="md">
      <Stack gap="lg">
        <Stack gap="lg">
          <div>
            <Text c="dimmed" fw={600} size="sm">
              账号详情
            </Text>
            <Title order={1} size="h2">
              UID {uid}
            </Title>
          </div>
          {loading && (
            <Group c="dimmed" gap="sm">
              <Loader size="sm" />
              <Text>正在查询账号…</Text>
            </Group>
          )}
          {error && (
            <Alert color="red" icon={<WarningCircleIcon size={20} />} title="查询失败">
              {error}
            </Alert>
          )}
          {account && (
            <>
              <Group>
                <Text c="dimmed">关联屏蔽规则</Text>
                <Badge color="bilibiliPink" variant="light">
                  {account.flags.length} 条
                </Badge>
              </Group>
              {account.flags.length > 0 ? (
                <Stack gap="sm">
                  {account.flags.map((flag) => (
                    <Paper className="flag-item" key={flag.code} p="md" radius="md" withBorder>
                      <Group justify="space-between" wrap="nowrap">
                        <Text fw={600}>{flag.name}</Text>
                        <Badge color="bilibili" variant="light">
                          {flag.code}
                        </Badge>
                      </Group>
                    </Paper>
                  ))}
                </Stack>
              ) : (
                <Text c="dimmed">该账号目前没有关联的屏蔽规则。</Text>
              )}
            </>
          )}
        </Stack>
      </Stack>
    </Container>
  )
}
