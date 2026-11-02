import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

import Account from '#models/account'
import AccountRating, { recalculateAccountRating } from '#models/account_rating'
import AccountTransformer from '#transformers/account_transformer'
import { accountUidParamsMessages, accountUidParamsValidator } from '#validators/account'
import { accountRatingValidator } from '#validators/account_rating'

export default class AccountRatingsController {
  async show({ auth, params, request, serialize }: HttpContext) {
    const { uid } = await request.validateUsing(accountUidParamsValidator, {
      data: params,
      messagesProvider: accountUidParamsMessages,
    })
    const user = auth.getUserOrFail()
    const account = await Account.findBy('uid', uid)
    const rating = account
      ? await AccountRating.query().where('accountId', account.id).where('userId', user.id).first()
      : null

    return serialize({ rating: rating?.rating ?? null })
  }

  async store({ auth, params, request, serialize }: HttpContext) {
    const { uid } = await request.validateUsing(accountUidParamsValidator, {
      data: params,
      messagesProvider: accountUidParamsMessages,
    })

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

    const accountWithRatingCount = await Account.query()
      .where('id', account.id)
      .withCount('ratings')
      .firstOrFail()

    return serialize(AccountTransformer.transform(accountWithRatingCount))
  }

  async destroy({ auth, params, request, serialize }: HttpContext) {
    const { uid } = await request.validateUsing(accountUidParamsValidator, {
      data: params,
      messagesProvider: accountUidParamsMessages,
    })

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
    }

    const accountForTransform = account
      ? await Account.query().where('id', account.id).withCount('ratings').firstOrFail()
      : new Account()
    if (!accountForTransform.$isPersisted) accountForTransform.uid = uid

    return serialize(AccountTransformer.transform(accountForTransform))
  }
}
