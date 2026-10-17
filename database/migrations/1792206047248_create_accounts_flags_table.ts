import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'accounts_flags'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('account_id')
        .unsigned()
        .notNullable()
        .references('accounts.id')
        .onDelete('CASCADE')
      table.integer('flag_id').unsigned().notNullable().references('flags.id').onDelete('CASCADE')
      table.string('status', 16).nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
      table.unique(['account_id', 'flag_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
