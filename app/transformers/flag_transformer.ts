import type Flag from '#models/flag'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class FlagTransformer extends BaseTransformer<Flag> {
  toObject() {
    return {
      ...this.pick(this.resource, ['id', 'code', 'name', 'description', 'recommended']),
      uidCount: Number(this.resource.$extras.uidCount),
    }
  }
}
