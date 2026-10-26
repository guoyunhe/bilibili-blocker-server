import { writeFile } from 'node:fs/promises'

import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'

import { generateOgImage } from '#services/og_image_service'

export default class OgImageGenerate extends BaseCommand {
  static commandName = 'og-image:generate'
  static description = 'Generate the static Open Graph image from live flags'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    const image = await generateOgImage()
    await writeFile(new URL('../public/og-image.png', import.meta.url), image)
    this.logger.info(`Generated public/og-image.png (${image.byteLength} bytes)`)
  }
}
