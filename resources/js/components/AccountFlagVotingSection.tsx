import {
  Alert,
  Anchor,
  Badge,
  Button,
  Divider,
  Group,
  Paper,
  Stack,
  Text,
  Title,
} from '@mantine/core'
import { ThumbsDownIcon } from '@phosphor-icons/react/ThumbsDown'
import { ThumbsUpIcon } from '@phosphor-icons/react/ThumbsUp'
import { WarningCircleIcon } from '@phosphor-icons/react/WarningCircle'
import { Fragment, useState } from 'react'
import { Link, useLocation, useSearch } from 'wouter'

import { useAuth } from '../contexts/AuthContext.js'
import { type AccountDetails, type VoteDirection, voteForFlag } from '../services/accounts.js'
import { errorMessage } from '../utils/error_message.js'
import { createReturnPath, saveReturnPath } from '../utils/return_path.js'
import styles from './AccountFlagVotingSection.module.css'

type AccountFlagVotingSectionProps = {
  account: AccountDetails
  uid: string
  onAccountUpdated: (account: AccountDetails) => void
}

export default function AccountFlagVotingSection({
  account,
  uid,
  onAccountUpdated,
}: AccountFlagVotingSectionProps) {
  const [pathname, navigate] = useLocation()
  const search = useSearch()
  const { authReady, user } = useAuth()
  const [voteError, setVoteError] = useState('')
  const [votingFlag, setVotingFlag] = useState<{
    code: string
    direction: VoteDirection
  } | null>(null)
  const returnTo = createReturnPath(pathname, search, window.location.hash)

  async function handleVote(code: string, direction: VoteDirection) {
    if (!user) {
      if (returnTo) saveReturnPath(returnTo)
      navigate('/login')
      return
    }
    if (!user.emailVerifiedAt) {
      if (returnTo) saveReturnPath(returnTo)
      navigate('/email/verification/send')
      return
    }

    setVoteError('')
    setVotingFlag({ code, direction })
    try {
      onAccountUpdated(await voteForFlag(uid, code, direction))
    } catch (reason) {
      setVoteError(errorMessage(reason))
    } finally {
      setVotingFlag(null)
    }
  }

  return (
    <>
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
          <Anchor
            component={Link}
            href="/login"
            onClick={() => {
              if (returnTo) saveReturnPath(returnTo)
            }}
          >
            登录
          </Anchor>
          后即可参与投票。
        </Text>
      )}
      {authReady && user && !user.emailVerifiedAt && (
        <Text c="dimmed" size="sm">
          请先验证邮箱后再参与投票。
          <Anchor
            component={Link}
            href="/email/verification/send"
            ml={4}
            onClick={() => {
              if (returnTo) saveReturnPath(returnTo)
            }}
          >
            前往验证
          </Anchor>
        </Text>
      )}
      {voteError && (
        <Alert color="red" icon={<WarningCircleIcon size={20} />} title="投票失败">
          {voteError}
        </Alert>
      )}
      {account.flags.length > 0 ? (
        <Stack gap="sm">
          {account.flags.map((flag, index) => (
            <Fragment key={flag.code}>
              {index > 0 && !flag.recommended && account.flags[index - 1]?.recommended && (
                <Divider label="其他规则" labelPosition="left" />
              )}
              <Paper className={styles.flagItem} p="md" radius="md" withBorder>
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
                      disabled={
                        !authReady || votingFlag !== null || (!!user && !user.emailVerifiedAt)
                      }
                      loading={votingFlag?.code === flag.code && votingFlag.direction === 'up'}
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
                      disabled={
                        !authReady || votingFlag !== null || (!!user && !user.emailVerifiedAt)
                      }
                      loading={votingFlag?.code === flag.code && votingFlag.direction === 'down'}
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
            </Fragment>
          ))}
        </Stack>
      ) : (
        <Text c="dimmed">尚未定义任何 flag。</Text>
      )}
    </>
  )
}
