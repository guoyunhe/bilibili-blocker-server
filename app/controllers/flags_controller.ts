import type { HttpContext } from '@adonisjs/core/http'

import Flag from '#models/flag'

export default class FlagsController {
  async index({ serialize }: HttpContext) {
    const flags = await Flag.query().select('code', 'name', 'description').orderBy('code')

    return serialize(flags)
  }
}
