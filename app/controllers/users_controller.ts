import type { HttpContext } from '@adonisjs/core/http'

import AccountFlagVote from '#models/account_flag_vote'
import User from '#models/user'
import AccountFlagVoteTransformer from '#transformers/account_flag_vote_transformer'
import UserTransformer from '#transformers/user_transformer'

const votesPerPage = 25

export default class UsersController {
  async show({ params, request, response, serialize }: HttpContext) {
    if (!/^\d+$/.test(params.id)) {
      return response.badRequest({ message: '用户 ID 无效' })
    }

    const id = Number(params.id)
    const page = Number(request.input('page', 1))
    if (!Number.isSafeInteger(id) || id < 1) {
      return response.badRequest({ message: '用户 ID 无效' })
    }
    if (!Number.isInteger(page) || page < 1) {
      return response.badRequest({ message: '页码必须为正整数' })
    }

    const user = await User.query()
      .select('id', 'name', 'createdAt')
      .withCount('votes', (query) => query.whereNot('vote', 0))
      .where('id', id)
      .firstOrFail()

    const paginator = await AccountFlagVote.query()
      .where('userId', user.id)
      .preload('accountFlag', (query) => {
        query
          .preload('account', (accountQuery) => accountQuery.select('id', 'uid'))
          .preload('flag', (flagQuery) => flagQuery.select('id', 'code', 'name'))
      })
      .orderBy('updatedAt', 'desc')
      .paginate(page, votesPerPage)

    return serialize({
      user: UserTransformer.transform(user).useVariant('toPublic'),
      votes: AccountFlagVoteTransformer.transform(paginator.all()).useVariant('toPublic'),
      pagination: paginator.getMeta(),
    })
  }
}
