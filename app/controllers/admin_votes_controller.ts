import type { HttpContext } from '@adonisjs/core/http'

import AccountFlagVote from '#models/account_flag_vote'
import AccountFlagVoteTransformer from '#transformers/account_flag_vote_transformer'

const recentVotesPerPage = 25

export default class AdminVotesController {
  async index({ request, response, serialize }: HttpContext) {
    const page = Number(request.input('page', 1))
    if (!Number.isInteger(page) || page < 1) {
      return response.badRequest({ message: '页码必须为正整数' })
    }

    const paginator = await AccountFlagVote.query()
      .preload('user', (query) => query.select('id', 'name', 'email'))
      .preload('accountFlag', (query) => {
        query
          .preload('account', (accountQuery) => accountQuery.select('id', 'uid'))
          .preload('flag', (flagQuery) => flagQuery.select('id', 'code', 'name'))
      })
      .orderBy('updatedAt', 'desc')
      .paginate(page, recentVotesPerPage)

    return serialize({
      votes: AccountFlagVoteTransformer.transform(paginator.all()).useVariant('toAdmin'),
      pagination: paginator.getMeta(),
    })
  }
}
