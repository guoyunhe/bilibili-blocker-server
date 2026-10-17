import type { HttpContext } from '@adonisjs/core/http'

import Account from '#models/account'

export default class AccountsController {
  async show({ params, response, serialize }: HttpContext) {
    const uid = params.uid
    if (!/^\d+$/.test(uid)) {
      return response.badRequest({ message: 'UID 必须为纯数字' })
    }

    const account = await Account.query()
      .where('uid', uid)
      .preload('flags', (query) => query.orderBy('code'))
      .first()

    if (!account) {
      return response.notFound({ message: '未找到该 UID 对应的账号' })
    }

    return serialize({
      uid: account.uid,
      flags: account.flags.map(({ code, name }) => ({ code, name })),
    })
  }
}
