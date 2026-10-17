import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'

import Flag from '#models/flag'

export default class Account extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare uid: string

  @manyToMany(() => Flag, { pivotTable: 'accounts_flags' })
  declare flags: ManyToMany<typeof Flag>
}
