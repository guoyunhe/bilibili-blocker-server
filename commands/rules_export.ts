import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'

import { exportRules } from '#services/rule_exporter'

export default class RulesExport extends BaseCommand {
  static commandName = 'rules:export'
  static description = 'Export approved account rules to storage'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    const { flagCount, exportedUidCount } = await exportRules()
    this.logger.info(
      `Exported ${exportedUidCount} approved account rules across ${flagCount} flags`
    )
  }
}
