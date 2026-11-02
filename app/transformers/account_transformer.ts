import type Account from '#models/account'
import AccountFlag from '#models/account_flag'
import { voteDirectionForValue } from '#models/account_flag_vote'
import Flag from '#models/flag'
import db from '@adonisjs/lucid/services/db'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class AccountTransformer extends BaseTransformer<Account> {
  constructor(
    account: Account,
    private currentUserId?: number
  ) {
    super(account)
  }

  async toObject() {
    const account = this.resource
    const uid = account.uid
    const currentUserId = this.currentUserId
    const accountIsPersisted = account.$isPersisted
    const [flags, accountFlags, ratingSummary] = await Promise.all([
      Flag.query().orderBy('code'),
      accountIsPersisted
        ? AccountFlag.query().where('accountId', account.id).select('id', 'flagId', 'status')
        : Promise.resolve([]),
      accountIsPersisted
        ? db
            .from('account_ratings')
            .where('account_id', account.id)
            .select(
              db.raw('COUNT(*) as count'),
              db.raw('MAX(CASE WHEN user_id = ? THEN rating END) as user_rating', [
                currentUserId ?? 0,
              ])
            )
            .first()
        : Promise.resolve(null),
    ])
    const accountFlagIdByFlagId = new Map(accountFlags.map(({ id, flagId }) => [flagId, id]))
    const statusByFlagId = new Map(accountFlags.map(({ flagId, status }) => [flagId, status]))
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
      uid,
      rating: {
        value: account?.rating ?? null,
        count: Number(ratingSummary?.count ?? 0),
        userRating:
          ratingSummary?.user_rating === undefined || ratingSummary?.user_rating === null
            ? null
            : Number(ratingSummary.user_rating),
      },
      flags: flags
        .map(({ id, code, name, description, recommended }) => {
          const accountFlagId = accountFlagIdByFlagId.get(id)
          const counts =
            accountFlagId === undefined
              ? { up: 0, down: 0, score: 0 }
              : (countsByAccountFlagId.get(accountFlagId) ?? { up: 0, down: 0, score: 0 })
          return {
            code,
            name,
            description,
            recommended,
            status: statusByFlagId.get(id) ?? null,
            upVotes: counts.up,
            downVotes: counts.down,
            score: counts.score,
            userVote:
              accountFlagId === undefined ? null : (userVoteByFlagId.get(accountFlagId) ?? null),
          }
        })
        .sort(
          (left, right) =>
            Number(right.recommended) - Number(left.recommended) ||
            Number(right.status === 'approved') - Number(left.status === 'approved') ||
            right.score - left.score ||
            left.code.localeCompare(right.code)
        ),
    }
  }
}
