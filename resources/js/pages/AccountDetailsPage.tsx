import { Alert, Anchor, Badge, Container, Group, Loader, Stack, Text, Title } from '@mantine/core'
import { WarningCircleIcon } from '@phosphor-icons/react/WarningCircle'
import { useEffect, useState } from 'react'
import { useParams } from 'wouter'

import AccountFlagVotingSection from '../components/AccountFlagVotingSection.js'
import { getAccount, type AccountDetails } from '../services/accounts.js'
import { errorMessage } from '../utils/error_message.js'
import styles from './AccountDetailsPage.module.css'

export default function AccountDetailsPage() {
  const { uid = '' } = useParams<{ uid?: string }>()
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

  const associatedFlagCount =
    account?.flags.filter((flag) => flag.status === 'approved').length ?? 0

  return (
    <Container className={styles.detailsPage} size="md">
      <Stack gap="lg">
        <Stack gap="lg">
          <div>
            <Text c="dimmed" fw={600} size="sm">
              账号详情
            </Text>
            <Group align="center" justify="space-between" wrap="wrap">
              <Title order={1} size="h2">
                UID {uid}
              </Title>
              <Anchor
                href={`https://space.bilibili.com/${uid}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                打开 Bilibili 个人空间
              </Anchor>
            </Group>
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
                <Text c="dimmed">已关联屏蔽规则</Text>
                <Badge color="bilibiliPink" variant="light">
                  {associatedFlagCount} 条
                </Badge>
              </Group>
              {associatedFlagCount === 0 && <Text c="dimmed">该账号目前没有关联的屏蔽规则。</Text>}
              <AccountFlagVotingSection account={account} uid={uid} onAccountUpdated={setAccount} />
            </>
          )}
        </Stack>
      </Stack>
    </Container>
  )
}
