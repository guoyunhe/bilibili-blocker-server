import type Account from '#models/account'
import AccountFlag from '#models/account_flag'
import { voteDirectionForValue } from '#models/account_flag_vote'
import db from '@adonisjs/lucid/services/db'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class AccountTransformer extends BaseTransformer<Account> {
  async toObject() {
    const account = this.resource
    const uid = account.uid
    const accountIsPersisted = account.$isPersisted
    const accountFlags = accountIsPersisted
      ? await AccountFlag.query()
          .where('accountId', account.id)
          .select('id', 'flagId', 'status')
          .preload('flag', (query) =>
            query.select('id', 'code', 'name', 'description', 'recommended')
          )
      : []
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

    return {
      uid,
      rating: account.rating ?? null,
      ratingCount: account.ratingCount,
      flags: accountFlags
        .map(({ id, status, flag }) => {
          const counts = countsByAccountFlagId.get(id) ?? { up: 0, down: 0, score: 0 }
          return {
            code: flag.code,
            name: flag.name,
            description: flag.description,
            recommended: flag.recommended,
            status,
            upVotes: counts.up,
            downVotes: counts.down,
            score: counts.score,
          }
        })
        .sort(
          (left, right) =>
            Number(right.status === 'approved') - Number(left.status === 'approved') ||
            right.score - left.score ||
            left.code.localeCompare(right.code)
        ),
    }
  }
}
