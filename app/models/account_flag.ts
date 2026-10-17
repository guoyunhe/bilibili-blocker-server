import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'

import AccountFlagVote from '#models/account_flag_vote'
import Account from '#models/account'
import Flag from '#models/flag'

export default class AccountFlag extends BaseModel {
  static table = 'accounts_flags'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare accountId: number

  @column()
  declare flagId: number

  @column()
  declare isAssociated: boolean

  @belongsTo(() => Account)
  declare account: BelongsTo<typeof Account>

  @belongsTo(() => Flag)
  declare flag: BelongsTo<typeof Flag>

  @hasMany(() => AccountFlagVote)
  declare votes: HasMany<typeof AccountFlagVote>
}
