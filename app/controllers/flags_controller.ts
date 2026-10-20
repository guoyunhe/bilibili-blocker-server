import type { HttpContext } from '@adonisjs/core/http'

import Flag from '#models/flag'
import FlagTransformer from '#transformers/flag_transformer'

export default class FlagsController {
  async index({ serialize }: HttpContext) {
    const flags = await Flag.query()
      .select('code', 'name', 'description', 'recommended')
      .orderBy('code')

    return serialize(FlagTransformer.transform(flags))
  }
}
