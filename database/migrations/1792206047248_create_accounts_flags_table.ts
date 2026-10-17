import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'accounts_flags'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.integer('account_id').unsigned().notNullable()
      table.integer('flag_id').unsigned().notNullable()
      table.primary(['account_id', 'flag_id'])
      table.index('flag_id')
      table.foreign('account_id').references('accounts.id').onDelete('CASCADE')
      table.foreign('flag_id').references('flags.id').onDelete('CASCADE')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
