import { AccountSchema } from '#database/schema'
import { hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'

import AccountFlag from '#models/account_flag'
import AccountFlagVote from '#models/account_flag_vote'

export default class Account extends AccountSchema {
  @hasMany(() => AccountFlag)
  declare accountFlags: HasMany<typeof AccountFlag>

  @hasMany(() => AccountFlagVote)
  declare votes: HasMany<typeof AccountFlagVote>
}
