import type { HttpContext } from '@adonisjs/core/http'

import Account from '#models/account'
import Flag from '#models/flag'
import { getAccountDetails } from '#services/account_details_service'
import { accountFlagStatusValidator } from '#validators/account_flag_status'
import db from '@adonisjs/lucid/services/db'

export default class AccountFlagStatusController {
  async update({ auth, params, request, response, serialize }: HttpContext) {
    const { uid, code } = params
    if (!/^\d+$/.test(uid)) {
      return response.badRequest({ message: 'UID 必须为纯数字' })
    }

    const { status } = await request.validateUsing(accountFlagStatusValidator)
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
        status,
        created_at: now,
        updated_at: now,
      })
      .onConflict(['account_id', 'flag_id'])
      .merge({
        status,
        updated_at: now,
      })

    return serialize(await getAccountDetails(account, auth.getUserOrFail().id))
  }
}
