import { Alert, Anchor, Grid, Text, Title } from '@mantine/core'
import { WarningCircleIcon } from '@phosphor-icons/react/WarningCircle'
import { useEffect, useState } from 'react'
import { Link, useLocation, useSearch } from 'wouter'

import FlagVoteCard from './FlagVoteCard.js'
import { useAuth } from '../contexts/AuthContext.js'
import {
  getAccount,
  getFlagVote,
  type AccountDetails,
  type VoteDirection,
  voteForFlag,
} from '../services/accounts.js'
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
  const [userVotes, setUserVotes] = useState<Record<string, VoteDirection | null>>({})
  const [loadingVotes, setLoadingVotes] = useState(false)
  const flagCodes = account.flags.map(({ code }) => code).join(',')
  const returnTo = createReturnPath(pathname, search, window.location.hash)

  useEffect(() => {
    let active = true
    setUserVotes({})
    setVoteError('')

    if (!authReady || !user) {
      setLoadingVotes(false)
      return () => {
        active = false
      }
    }

    setLoadingVotes(true)
    const codes = flagCodes ? flagCodes.split(',') : []
    Promise.all(codes.map(async (code) => [code, await getFlagVote(uid, code)] as const))
      .then((votes) => {
        if (active) setUserVotes(Object.fromEntries(votes))
      })
      .catch((reason: unknown) => {
        if (active) setVoteError(errorMessage(reason))
      })
      .finally(() => {
        if (active) setLoadingVotes(false)
      })

    return () => {
      active = false
    }
  }, [authReady, flagCodes, uid, user?.id])

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
      await voteForFlag(uid, code, direction)
      const [updatedAccount, userVote] = await Promise.all([
        getAccount(uid),
        getFlagVote(uid, code),
      ])
      onAccountUpdated(updatedAccount)
      setUserVotes((current) => ({ ...current, [code]: userVote }))
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
        <Alert color="red" icon={<WarningCircleIcon size={20} />} title="投票状态或提交失败">
          {voteError}
        </Alert>
      )}
      {account.flags.length > 0 ? (
        <Grid gap="sm">
          {account.flags.map((flag) => (
            <Grid.Col key={flag.code} span={{ base: 12, md: 6, lg: 4, xl: 3 }}>
              <FlagVoteCard
                flag={{ ...flag, userVote: userVotes[flag.code] ?? null }}
                voteDisabled={
                  !authReady ||
                  votingFlag !== null ||
                  (!!user && (!user.emailVerifiedAt || loadingVotes))
                }
                votingDirection={votingFlag?.code === flag.code ? votingFlag.direction : null}
                onVote={(direction) => void handleVote(flag.code, direction)}
              />
            </Grid.Col>
          ))}
        </Grid>
      ) : (
        <Text c="dimmed">尚未定义任何标记。</Text>
      )}
    </>
  )
}
