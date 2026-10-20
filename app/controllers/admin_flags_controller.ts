import type { HttpContext } from '@adonisjs/core/http'

import Flag from '#models/flag'
import FlagTransformer from '#transformers/flag_transformer'
import { adminFlagValidator } from '#validators/admin_flag'

export default class AdminFlagsController {
  async index({ serialize }: HttpContext) {
    const flags = await Flag.query()
      .select('id', 'code', 'name', 'description', 'recommended')
      .orderBy('code')

    return serialize({
      flags: FlagTransformer.transform(flags),
    })
  }

  async show({ params, response, serialize }: HttpContext) {
    const id = Number(params.id)
    if (!Number.isSafeInteger(id) || id < 1) {
      return response.badRequest({ message: 'Flag ID 无效' })
    }

    const flag = await Flag.query()
      .select('id', 'code', 'name', 'description', 'recommended')
      .where('id', id)
      .firstOrFail()
    return serialize({
      flag: FlagTransformer.transform(flag),
    })
  }

  async store({ request, response, serialize }: HttpContext) {
    const data = await request.validateUsing(adminFlagValidator)
    const existingFlag = await Flag.findBy('code', data.code)
    if (existingFlag) {
      return response.conflict({ message: 'Flag 代码已存在' })
    }

    const flag = await Flag.create(data)
    return serialize({
      flag: FlagTransformer.transform(flag),
    })
  }

  async update({ params, request, response, serialize }: HttpContext) {
    const id = Number(params.id)
    if (!Number.isSafeInteger(id) || id < 1) {
      return response.badRequest({ message: 'Flag ID 无效' })
    }

    const data = await request.validateUsing(adminFlagValidator)
    const flag = await Flag.findOrFail(id)
    const existingFlag = await Flag.query().where('code', data.code).whereNot('id', flag.id).first()
    if (existingFlag) {
      return response.conflict({ message: 'Flag 代码已存在' })
    }

    flag.merge(data)
    await flag.save()
    return serialize({
      flag: FlagTransformer.transform(flag),
    })
  }

  async destroy({ params, response, serialize }: HttpContext) {
    const id = Number(params.id)
    if (!Number.isSafeInteger(id) || id < 1) {
      return response.badRequest({ message: 'Flag ID 无效' })
    }

    const flag = await Flag.findOrFail(id)
    await flag.delete()

    return serialize({ message: 'Flag 已删除' })
  }
}
