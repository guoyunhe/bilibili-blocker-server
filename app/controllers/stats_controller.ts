import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

import { getExtensionStoreStats } from '#services/extension_store_stats_service'

export default class StatsController {
  async extensions({ serialize }: HttpContext) {
    return serialize(await getExtensionStoreStats())
  }

  async contributors({ serialize }: HttpContext) {
    const [{ count }] = await db
      .from('account_flag_votes')
      .whereNot('vote', 0)
      .countDistinct('user_id as count')

    return serialize({ count: Number(count) })
  }

  async markedAccounts({ serialize }: HttpContext) {
    const [{ count }] = await db.from('accounts_flags').countDistinct('account_id as count')

    return serialize({ count: Number(count) })
  }

  async votes({ serialize }: HttpContext) {
    const [{ count }] = await db.from('account_flag_votes').whereNot('vote', 0).count('* as count')

    return serialize({ count: Number(count) })
  }
}
