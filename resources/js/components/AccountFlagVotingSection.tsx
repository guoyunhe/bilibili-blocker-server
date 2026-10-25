import { Alert, Anchor, Divider, Grid, Text, Title } from '@mantine/core'
import { WarningCircleIcon } from '@phosphor-icons/react/WarningCircle'
import { Fragment, useState } from 'react'
import { Link, useLocation, useSearch } from 'wouter'

import FlagVoteCard from './FlagVoteCard.js'
import { useAuth } from '../contexts/AuthContext.js'
import { type AccountDetails, type VoteDirection, voteForFlag } from '../services/accounts.js'
import { sendAddRuleUidsMessage } from '../services/extension.js'
import { errorMessage } from '../utils/error_message.js'
import { createReturnPath, saveReturnPath } from '../utils/return_path.js'

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
      if (direction === 'up') {
        sendAddRuleUidsMessage(code, [uid])
      }
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
          规则标记投票
        </Title>
        <Text c="dimmed" mt={4} size="sm">
          为该账号的每个标记投赞成票或反对票。每位用户对每个标记只能投一票。
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
        <Grid gap="sm">
          {account.flags.map((flag, index) => (
            <Fragment key={flag.code}>
              {index > 0 && !flag.recommended && account.flags[index - 1]?.recommended && (
                <Grid.Col span={12}>
                  <Divider label="其他规则" labelPosition="left" />
                </Grid.Col>
              )}
              <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
                <FlagVoteCard
                  flag={flag}
                  voteDisabled={
                    !authReady || votingFlag !== null || (!!user && !user.emailVerifiedAt)
                  }
                  votingDirection={votingFlag?.code === flag.code ? votingFlag.direction : null}
                  onVote={(direction) => void handleVote(flag.code, direction)}
                />
              </Grid.Col>
            </Fragment>
          ))}
        </Grid>
      ) : (
        <Text c="dimmed">尚未定义任何标记。</Text>
      )}
    </>
  )
}
