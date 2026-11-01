import { AccountRatingSchema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import db from '@adonisjs/lucid/services/db'

import Account from '#models/account'
import User from '#models/user'

/**
 * Recalculates the aggregated account rating as an integer from 0 to 100.
 * The average of all user ratings is rounded to the nearest integer.
 */
export async function recalculateAccountRating(
  accountId: number,
  client: Pick<TransactionClientContract, 'from'> = db
) {
  const [summary] = await client
    .from('account_ratings')
    .where('account_id', accountId)
    .select(db.raw('ROUND(AVG(rating)) as rating'))
  const rating =
    summary?.rating === undefined || summary?.rating === null ? null : Number(summary.rating)

  await client.from('accounts').where('id', accountId).update({ rating, updated_at: new Date() })

  return rating
}

export default class AccountRating extends AccountRatingSchema {
  static table = 'account_ratings'

  declare rating: number

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Account)
  declare account: BelongsTo<typeof Account>
}
