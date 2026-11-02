import { AccountSchema } from '#database/schema'
import { computed, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'

import AccountFlag from '#models/account_flag'
import AccountFlagVote from '#models/account_flag_vote'
import AccountRating from '#models/account_rating'

export default class Account extends AccountSchema {
  @hasMany(() => AccountFlag)
  declare accountFlags: HasMany<typeof AccountFlag>

  @hasMany(() => AccountRating)
  declare ratings: HasMany<typeof AccountRating>

  @hasMany(() => AccountFlagVote)
  declare votes: HasMany<typeof AccountFlagVote>

  @computed()
  get ratingCount() {
    return Number(this.$extras.ratings_count ?? 0)
  }
}
