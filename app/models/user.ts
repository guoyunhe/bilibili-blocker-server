import { UserSchema } from '#database/schema'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { type AccessToken, DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import { hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'

import AccountFlagVote from '#models/account_flag_vote'
import AccountRating from '#models/account_rating'
import { withEmailVerification } from 'adonisjs-auth-mail'

export default class User extends compose(UserSchema, withAuthFinder(hash), withEmailVerification) {
  static accessTokens = DbAccessTokensProvider.forModel(User)
  declare currentAccessToken?: AccessToken

  @hasMany(() => AccountFlagVote)
  declare votes: HasMany<typeof AccountFlagVote>

  @hasMany(() => AccountRating)
  declare ratings: HasMany<typeof AccountRating>
}
