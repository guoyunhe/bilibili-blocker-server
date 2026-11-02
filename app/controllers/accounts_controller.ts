import type { HttpContext } from '@adonisjs/core/http'

import Account from '#models/account'
import { getAccountDetails } from '#services/account_details_service'
import { accountUidParamsMessages, accountUidParamsValidator } from '#validators/account'

export default class AccountsController {
  async show({ auth, params, request, serialize }: HttpContext) {
    const { uid } = await request.validateUsing(accountUidParamsValidator, {
      data: params,
      messagesProvider: accountUidParamsMessages,
    })

    const account = await Account.findBy('uid', uid)

    return serialize(await getAccountDetails(uid, account, auth.user?.id))
  }
}
