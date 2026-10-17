import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'

import Account from '#models/account'

export default class Flag extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare code: string

  @column()
  declare name: string

  @manyToMany(() => Account, { pivotTable: 'accounts_flags' })
  declare accounts: ManyToMany<typeof Account>
}
