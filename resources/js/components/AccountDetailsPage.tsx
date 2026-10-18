import {
  Alert,
  Anchor,
  Badge,
  Button,
  Container,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  Title,
} from '@mantine/core'
import { ThumbsDownIcon } from '@phosphor-icons/react/ThumbsDown'
import { ThumbsUpIcon } from '@phosphor-icons/react/ThumbsUp'
import { WarningCircleIcon } from '@phosphor-icons/react/WarningCircle'
import { useEffect, useState } from 'react'

import {
  getAccount,
  type AccountDetails,
  type VoteDirection,
  voteForFlag,
} from '../services/accounts.js'
import type { AuthUser } from '../services/auth.js'
import { errorMessage } from '../utils/error_message.js'
import styles from './AccountDetailsPage.module.css'

type AccountDetailsPageProps = {
  authReady: boolean
  onNavigate: (path: string) => void
  uid: string
  user: AuthUser | null
}

export default function AccountDetailsPage({
  authReady,
  onNavigate,
  uid,
  user,
}: AccountDetailsPageProps) {
  const [account, setAccount] = useState<AccountDetails | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [voteError, setVoteError] = useState('')
  const [votingFlag, setVotingFlag] = useState<{
    code: string
    direction: VoteDirection
  } | null>(null)

  useEffect(() => {
    let active = true
    setAccount(null)
    setError('')
    setVoteError('')

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

  async function handleVote(code: string, direction: VoteDirection) {
    if (!user) {
      onNavigate('/login')
      return
    }

    setVoteError('')
    setVotingFlag({ code, direction })
    try {
      setAccount(await voteForFlag(uid, code, direction))
    } catch (reason) {
      setVoteError(errorMessage(reason))
    } finally {
      setVotingFlag(null)
    }
  }

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
              <div>
                <Title order={3} size="h4">
                  规则标签投票
                </Title>
                <Text c="dimmed" mt={4} size="sm">
                  为该账号的每个 flag 投 up 或 down vote。每位用户对每个 flag 只能投一票。
                </Text>
              </div>
              {authReady && !user && (
                <Text c="dimmed" size="sm">
                  <Anchor component="button" type="button" onClick={() => onNavigate('/login')}>
                    登录
                  </Anchor>
                  后即可参与投票。
                </Text>
              )}
              {voteError && (
                <Alert color="red" icon={<WarningCircleIcon size={20} />} title="投票失败">
                  {voteError}
                </Alert>
              )}
              {account.flags.length > 0 ? (
                <Stack gap="sm">
                  {account.flags.map((flag) => (
                    <Paper
                      className={styles.flagItem}
                      key={flag.code}
                      p="md"
                      radius="md"
                      withBorder
                    >
                      <Group align="flex-start" justify="space-between" wrap="wrap">
                        <div>
                          <Group gap="sm">
                            <Text fw={600}>{flag.name}</Text>
                            <Badge
                              color={
                                flag.status === 'approved'
                                  ? 'bilibili'
                                  : flag.status === 'rejected'
                                    ? 'bilibiliPink'
                                    : 'gray'
                              }
                              variant="light"
                            >
                              {flag.status === 'approved'
                                ? '认可'
                                : flag.status === 'rejected'
                                  ? '不认可'
                                  : '待定'}
                            </Badge>
                          </Group>
                          <Text c="dimmed" mt={4} size="sm">
                            {flag.description}
                          </Text>
                        </div>
                        <Group gap="xs">
                          <Text
                            aria-label={`净得分 ${flag.score}`}
                            c={flag.score < 0 ? 'red' : 'bilibili'}
                            component="span"
                            size="sm"
                          >
                            {flag.score > 0 ? `+${flag.score}` : flag.score}
                          </Text>
                          <Button
                            aria-label={`赞成 ${flag.name}，${flag.upVotes} 票`}
                            aria-pressed={flag.userVote === 'up'}
                            color="bilibili"
                            disabled={!authReady || !user || votingFlag !== null}
                            loading={
                              votingFlag?.code === flag.code && votingFlag.direction === 'up'
                            }
                            leftSection={<ThumbsUpIcon size={18} />}
                            size="sm"
                            variant={flag.userVote === 'up' ? 'filled' : 'light'}
                            onClick={() => handleVote(flag.code, 'up')}
                          >
                            {flag.upVotes}
                          </Button>
                          <Button
                            aria-label={`反对 ${flag.name}，${flag.downVotes} 票`}
                            aria-pressed={flag.userVote === 'down'}
                            color="bilibiliPink"
                            disabled={!authReady || !user || votingFlag !== null}
                            loading={
                              votingFlag?.code === flag.code && votingFlag.direction === 'down'
                            }
                            leftSection={<ThumbsDownIcon size={18} />}
                            size="sm"
                            variant={flag.userVote === 'down' ? 'filled' : 'light'}
                            onClick={() => handleVote(flag.code, 'down')}
                          >
                            {flag.downVotes}
                          </Button>
                        </Group>
                      </Group>
                    </Paper>
                  ))}
                </Stack>
              ) : (
                <Text c="dimmed">尚未定义任何 flag。</Text>
              )}
            </>
          )}
        </Stack>
      </Stack>
    </Container>
  )
}
