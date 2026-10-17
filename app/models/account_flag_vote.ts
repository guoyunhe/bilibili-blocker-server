import { AccountFlagVoteSchema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

import AccountFlag from '#models/account_flag'
import User from '#models/user'

export type VoteDirection = 'up' | 'down'
export type VoteValue = 1 | -1 | 0

export function voteValueForDirection(direction: VoteDirection): VoteValue {
  return direction === 'up' ? 1 : -1
}

export function voteDirectionForValue(value: number): VoteDirection | null {
  if (value === 0) return null
  if (value === 1) return 'up'
  if (value === -1) return 'down'

  throw new Error(`Invalid account flag vote value: ${value}`)
}

export default class AccountFlagVote extends AccountFlagVoteSchema {
  static table = 'account_flag_votes'

  declare vote: VoteValue

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => AccountFlag)
  declare accountFlag: BelongsTo<typeof AccountFlag>
}
