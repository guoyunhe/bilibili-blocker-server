import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

import Account from '#models/account'
import AccountRating, { recalculateAccountRating } from '#models/account_rating'
import { getAccountDetails } from '#services/account_details_service'
import { accountRatingValidator } from '#validators/account_rating'

export default class AccountRatingsController {
  async store({ auth, params, request, response, serialize }: HttpContext) {
    const { uid } = params
    if (!/^\d+$/.test(uid)) {
      return response.badRequest({ message: 'UID 必须为纯数字' })
    }

    const { rating } = await request.validateUsing(accountRatingValidator)
    const user = auth.getUserOrFail()
    const account = await Account.firstOrCreate({ uid })

    await db.transaction(async (trx) => {
      const accountRating = await AccountRating.firstOrNew(
        { accountId: account.id, userId: user.id },
        undefined,
        { client: trx }
      )
      accountRating.rating = rating
      await accountRating.save()
      await recalculateAccountRating(account.id, trx)
    })

    await account.refresh()

    return serialize(await getAccountDetails(uid, account, user.id))
  }

  async destroy({ auth, params, response, serialize }: HttpContext) {
    const { uid } = params
    if (!/^\d+$/.test(uid)) {
      return response.badRequest({ message: 'UID 必须为纯数字' })
    }

    const user = auth.getUserOrFail()
    const account = await Account.findBy('uid', uid)

    if (account) {
      await db.transaction(async (trx) => {
        await AccountRating.query({ client: trx })
          .where('accountId', account.id)
          .where('userId', user.id)
          .delete()
        await recalculateAccountRating(account.id, trx)
      })

      await account.refresh()
    }

    return serialize(await getAccountDetails(uid, account, user.id))
  }
}
