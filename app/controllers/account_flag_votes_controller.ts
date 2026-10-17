import type { HttpContext } from '@adonisjs/core/http'

import Account from '#models/account'
import AccountFlag from '#models/account_flag'
import Flag from '#models/flag'
import AccountFlagVote, { voteValueForDirection } from '#models/account_flag_vote'
import { getAccountDetails } from '#services/account_details_service'
import { accountFlagVoteValidator } from '#validators/account_flag_vote'

export default class AccountFlagVotesController {
  async store({ auth, params, request, response, serialize }: HttpContext) {
    const { uid, code } = params
    if (!/^\d+$/.test(uid)) {
      return response.badRequest({ message: 'UID 必须为纯数字' })
    }

    const { direction } = await request.validateUsing(accountFlagVoteValidator)
    const user = auth.getUserOrFail()
    const flag = await Flag.findBy('code', code)
    if (!flag) {
      return response.notFound({ message: '未找到该 flag' })
    }
    const account = await Account.firstOrCreate({ uid })

    // find or create the account flag record
    const accountFlag = await AccountFlag.firstOrCreate({ accountId: account.id, flagId: flag.id })

    // admin's vote auto-approves or auto-rejects the account flag
    if (user.role === 'admin') {
      accountFlag.status = direction === 'up' ? 'approved' : 'rejected'
      await accountFlag.save()
    }

    // create or update vote
    const vote = voteValueForDirection(direction)
    const accountFlagVote = await AccountFlagVote.firstOrNew({
      userId: user.id,
      accountFlagId: accountFlag.id,
    })
    accountFlagVote.vote = accountFlagVote.vote === vote ? 0 : vote
    await accountFlagVote.save()

    return serialize(await getAccountDetails(uid, account, user.id))
  }
}
