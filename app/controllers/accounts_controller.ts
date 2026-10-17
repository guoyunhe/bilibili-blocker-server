import type { HttpContext } from '@adonisjs/core/http'

import Account from '#models/account'
import { getAccountDetails } from '#services/account_details_service'

export default class AccountsController {
  async show({ auth, params, response, serialize }: HttpContext) {
    const uid = params.uid
    if (!/^\d+$/.test(uid)) {
      return response.badRequest({ message: 'UID 必须为纯数字' })
    }

    const account = await Account.findBy('uid', uid)

    return serialize(await getAccountDetails(uid, account, auth.user?.id))
  }
}
