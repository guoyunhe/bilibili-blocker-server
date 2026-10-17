import type Account from '#models/account'
import AccountFlag from '#models/account_flag'
import { voteDirectionForValue } from '#models/account_flag_vote'
import Flag from '#models/flag'
import db from '@adonisjs/lucid/services/db'

export async function getAccountDetails(account: Account, currentUserId?: number) {
  const [flags, accountFlags] = await Promise.all([
    Flag.query().orderBy('code'),
    AccountFlag.query().where('accountId', account.id).select('id', 'flagId', 'isAssociated'),
  ])
  const accountFlagIdByFlagId = new Map(accountFlags.map(({ id, flagId }) => [flagId, id]))
  const isAssociatedByFlagId = new Map(
    accountFlags.map(({ flagId, isAssociated }) => [flagId, isAssociated])
  )
  const accountFlagIds = accountFlags.map(({ id }) => id)
  const voteCounts =
    accountFlagIds.length === 0
      ? []
      : await db
          .from('account_flag_votes')
          .whereIn('account_flag_id', accountFlagIds)
          .select('account_flag_id', 'vote')
          .count('* as count')
          .sum('vote as score')
          .groupBy('account_flag_id', 'vote')
  const userVotes =
    currentUserId === undefined || accountFlagIds.length === 0
      ? []
      : await db
          .from('account_flag_votes')
          .whereIn('account_flag_id', accountFlagIds)
          .where('user_id', currentUserId)
          .select('account_flag_id', 'vote')

  const countsByAccountFlagId = new Map<number, { up: number; down: number; score: number }>()
  for (const row of voteCounts) {
    const counts = countsByAccountFlagId.get(row.account_flag_id) ?? {
      up: 0,
      down: 0,
      score: 0,
    }
    const direction = voteDirectionForValue(Number(row.vote))
    if (direction === 'up') counts.up = Number(row.count)
    if (direction === 'down') counts.down = Number(row.count)
    counts.score += Number(row.score)
    countsByAccountFlagId.set(row.account_flag_id, counts)
  }

  const userVoteByFlagId = new Map(
    userVotes.map(({ account_flag_id, vote }) => [
      account_flag_id,
      voteDirectionForValue(Number(vote)),
    ])
  )

  return {
    uid: account.uid,
    flags: flags
      .map(({ id, code, name, description }) => {
        const accountFlagId = accountFlagIdByFlagId.get(id)
        const counts =
          accountFlagId === undefined
            ? { up: 0, down: 0, score: 0 }
            : (countsByAccountFlagId.get(accountFlagId) ?? { up: 0, down: 0, score: 0 })
        return {
          code,
          name,
          description,
          isAssociated: isAssociatedByFlagId.get(id) ?? false,
          upVotes: counts.up,
          downVotes: counts.down,
          score: counts.score,
          userVote:
            accountFlagId === undefined ? null : (userVoteByFlagId.get(accountFlagId) ?? null),
        }
      })
      .sort(
        (left, right) =>
          Number(right.isAssociated) - Number(left.isAssociated) ||
          right.score - left.score ||
          left.code.localeCompare(right.code)
      ),
  }
}
