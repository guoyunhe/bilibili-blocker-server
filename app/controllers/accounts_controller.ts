import type { HttpContext } from '@adonisjs/core/http'

import Account from '#models/account'
import AccountTransformer from '#transformers/account_transformer'
import { accountUidParamsMessages, accountUidParamsValidator } from '#validators/account'

export default class AccountsController {
  async show({ params, request, serialize }: HttpContext) {
    const { uid } = await request.validateUsing(accountUidParamsValidator, {
      data: params,
      messagesProvider: accountUidParamsMessages,
    })

    const account = (await Account.findBy('uid', uid)) ?? new Account()
    if (!account.$isPersisted) account.uid = uid

    return serialize(AccountTransformer.transform(account))
  }
}
