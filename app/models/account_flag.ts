import { AccountsFlagSchema } from '#database/schema'
import { belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'

import AccountFlagVote from '#models/account_flag_vote'
import Account from '#models/account'
import Flag from '#models/flag'

export type AccountFlagStatus = 'approved' | 'rejected' | null

export default class AccountFlag extends AccountsFlagSchema {
  static table = 'accounts_flags'

  declare status: AccountFlagStatus

  @belongsTo(() => Account)
  declare account: BelongsTo<typeof Account>

  @belongsTo(() => Flag)
  declare flag: BelongsTo<typeof Flag>

  @hasMany(() => AccountFlagVote)
  declare votes: HasMany<typeof AccountFlagVote>
}
