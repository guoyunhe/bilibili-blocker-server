import type { HttpContext } from '@adonisjs/core/http'

import User from '#models/user'
import UserTransformer from '#transformers/user_transformer'

const usersPerPage = 25

export default class AdminUsersController {
  async index({ request, response, serialize }: HttpContext) {
    const page = Number(request.input('page', 1))
    if (!Number.isInteger(page) || page < 1) {
      return response.badRequest({ message: '页码必须为正整数' })
    }

    const paginator = await User.query()
      .select('id', 'name', 'email', 'role', 'createdAt')
      .withCount('votes', (query) => query.whereNot('vote', 0))
      .orderBy('id', 'desc')
      .paginate(page, usersPerPage)

    return serialize({
      users: UserTransformer.transform(paginator.all()).useVariant('toAdmin'),
      pagination: paginator.getMeta(),
    })
  }

  async destroy({ auth, params, response, serialize }: HttpContext) {
    const id = Number(params.id)
    if (!Number.isInteger(id) || id < 1) {
      return response.badRequest({ message: '用户 ID 无效' })
    }
    if (id === auth.getUserOrFail().id) {
      return response.badRequest({ message: '不能删除当前登录的管理员账户' })
    }

    const user = await User.findOrFail(id)
    await user.delete()

    return serialize({ message: '用户已删除' })
  }
}
