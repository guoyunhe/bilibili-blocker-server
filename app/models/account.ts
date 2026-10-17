import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'

import AccountFlag from '#models/account_flag'
import AccountFlagVote from '#models/account_flag_vote'

export default class Account extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare uid: string

  @hasMany(() => AccountFlag)
  declare accountFlags: HasMany<typeof AccountFlag>

  @hasMany(() => AccountFlagVote)
  declare votes: HasMany<typeof AccountFlagVote>
}
