import type { HttpContext } from '@adonisjs/core/http'

import Flag from '#models/flag'
import FlagTransformer from '#transformers/flag_transformer'
import { adminFlagValidator } from '#validators/admin_flag'

export default class AdminFlagsController {
  async index({ serialize }: HttpContext) {
    const flags = await Flag.query().orderBy('code')

    return serialize(FlagTransformer.transform(flags))
  }

  async show({ params, serialize }: HttpContext) {
    const flag = await Flag.findOrFail(params.id)

    return serialize(FlagTransformer.transform(flag))
  }

  async store({ request, response, serialize }: HttpContext) {
    const data = await request.validateUsing(adminFlagValidator)

    const existingFlag = await Flag.findBy('code', data.code)
    if (existingFlag) {
      return response.conflict({ message: 'Flag 代码已存在' })
    }

    const flag = await Flag.create(data)

    await flag.refresh()

    return serialize(FlagTransformer.transform(flag))
  }

  async update({ params, request, response, serialize }: HttpContext) {
    const data = await request.validateUsing(adminFlagValidator)
    const flag = await Flag.findOrFail(params.id)
    const existingFlag = await Flag.query().where('code', data.code).whereNot('id', flag.id).first()
    if (existingFlag) {
      return response.conflict({ message: 'Flag 代码已存在' })
    }

    flag.merge(data)
    await flag.save()
    await flag.refresh()

    return serialize(FlagTransformer.transform(flag))
  }

  async destroy({ params, response }: HttpContext) {
    const flag = await Flag.findOrFail(params.id)
    await flag.delete()

    return response.ok({ message: 'Flag 已删除' })
  }
}
