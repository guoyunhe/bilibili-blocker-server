import type { HttpContext } from '@adonisjs/core/http'

import AccountFlagVote from '#models/account_flag_vote'
import AccountRating from '#models/account_rating'
import User from '#models/user'
import AccountFlagVoteTransformer from '#transformers/account_flag_vote_transformer'
import UserTransformer from '#transformers/user_transformer'

const votesPerPage = 25
const ratingsPerPage = 25

export default class UsersController {
  async show({ params, request, response, serialize }: HttpContext) {
    if (!/^\d+$/.test(params.id)) {
      return response.badRequest({ message: '用户 ID 无效' })
    }

    const id = Number(params.id)
    const page = Number(request.input('page', 1))
    const ratingPage = Number(request.input('ratingPage', 1))
    if (!Number.isSafeInteger(id) || id < 1) {
      return response.badRequest({ message: '用户 ID 无效' })
    }
    if (!Number.isInteger(page) || page < 1) {
      return response.badRequest({ message: '页码必须为正整数' })
    }
    if (!Number.isInteger(ratingPage) || ratingPage < 1) {
      return response.badRequest({ message: '评分页码必须为正整数' })
    }

    const user = await User.query()
      .select('id', 'name', 'createdAt')
      .withCount('votes', (query) => query.whereNot('vote', 0))
      .withCount('ratings')
      .where('id', id)
      .firstOrFail()

    const [votePaginator, ratingPaginator] = await Promise.all([
      AccountFlagVote.query()
        .where('userId', user.id)
        .preload('accountFlag', (query) => {
          query
            .preload('account', (accountQuery) => accountQuery.select('id', 'uid'))
            .preload('flag', (flagQuery) => flagQuery.select('id', 'code', 'name'))
        })
        .orderBy('updatedAt', 'desc')
        .paginate(page, votesPerPage),
      AccountRating.query()
        .where('userId', user.id)
        .preload('account', (query) => query.select('id', 'uid'))
        .orderBy('updatedAt', 'desc')
        .paginate(ratingPage, ratingsPerPage),
    ])

    return serialize({
      user: UserTransformer.transform(user).useVariant('toPublic'),
      votes: AccountFlagVoteTransformer.transform(votePaginator.all()).useVariant('toPublic'),
      pagination: votePaginator.getMeta(),
      ratings: ratingPaginator.all().map((rating) => ({
        id: rating.id,
        uid: rating.account.uid,
        rating: rating.rating,
        updatedAt: rating.updatedAt.toISO(),
      })),
      ratingPagination: ratingPaginator.getMeta(),
    })
  }
}
