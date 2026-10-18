import type AccountFlagVote from '#models/account_flag_vote'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class AccountFlagVoteTransformer extends BaseTransformer<AccountFlagVote> {
  toObject() {
    return this.toAdmin()
  }

  toAdmin() {
    return {
      id: this.resource.id,
      userId: this.resource.user.id,
      userName: this.resource.user.name,
      userEmail: this.resource.user.email,
      uid: this.resource.accountFlag.account.uid,
      flagCode: this.resource.accountFlag.flag.code,
      flagName: this.resource.accountFlag.flag.name,
      vote: this.resource.vote,
      createdAt: this.resource.createdAt.toISO(),
      updatedAt: this.resource.updatedAt.toISO(),
    }
  }

  toPublic() {
    return {
      id: this.resource.id,
      uid: this.resource.accountFlag.account.uid,
      flagCode: this.resource.accountFlag.flag.code,
      flagName: this.resource.accountFlag.flag.name,
      vote: this.resource.vote,
      updatedAt: this.resource.updatedAt.toISO(),
    }
  }
}
