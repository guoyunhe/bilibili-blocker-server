import type { HttpContext } from '@adonisjs/core/http'

import Account from '#models/account'
import AccountFlag from '#models/account_flag'
import Flag from '#models/flag'
import { voteValueForDirection } from '#models/account_flag_vote'
import { getAccountDetails } from '#services/account_details_service'
import db from '@adonisjs/lucid/services/db'
import { accountFlagVoteValidator } from '#validators/account_flag_vote'

export default class AccountFlagVotesController {
  async store({ auth, params, request, response, serialize }: HttpContext) {
    const { uid, code } = params
    if (!/^\d+$/.test(uid)) {
      return response.badRequest({ message: 'UID 必须为纯数字' })
    }

    const { direction } = await request.validateUsing(accountFlagVoteValidator)
    const user = auth.getUserOrFail()
    const [account, flag] = await Promise.all([
      Account.findBy('uid', uid),
      Flag.findBy('code', code),
    ])

    if (!account) {
      return response.notFound({ message: '未找到该 UID 对应的账号' })
    }
    if (!flag) {
      return response.notFound({ message: '未找到该 flag' })
    }

    const now = new Date()
    await db
      .table('accounts_flags')
      .insert({
        account_id: account.id,
        flag_id: flag.id,
        status: null,
        created_at: now,
        updated_at: now,
      })
      .onConflict(['account_id', 'flag_id'])
      .ignore()

    const accountFlag = await AccountFlag.query()
      .where('accountId', account.id)
      .where('flagId', flag.id)
      .first()
    if (!accountFlag) {
      throw new Error(`Failed to create account-flag relation for UID "${uid}" and "${code}"`)
    }
    const vote = voteValueForDirection(direction)
    await db.rawQuery(
      `INSERT INTO account_flag_votes
        (user_id, account_flag_id, vote, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         vote = IF(vote = VALUES(vote), 0, VALUES(vote)),
         updated_at = VALUES(updated_at)`,
      [user.id, accountFlag.id, vote, now, now]
    )

    return serialize(await getAccountDetails(account, user.id))
  }
}
