import logger from '@adonisjs/core/services/logger'
import { Job } from '@adonisjs/queue'
import type { JobOptions } from '@adonisjs/queue/types'

import { exportRules } from '#services/rule_exporter'

type ExportRulesPayload = Record<string, never>

export default class ExportRules extends Job<ExportRulesPayload> {
  static options: JobOptions = {
    queue: 'default',
    maxRetries: 3,
  }

  async execute() {
    const { flagCount, exportedUidCount } = await exportRules()
    logger.info(`Exported ${exportedUidCount} approved account rules across ${flagCount} flags`)
  }

  async failed(error: Error) {
    logger.error({ err: error }, 'Exporting approved rules failed')
  }
}
