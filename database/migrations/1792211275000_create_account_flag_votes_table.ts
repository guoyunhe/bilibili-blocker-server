import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'account_flag_votes'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.integer('user_id').unsigned().notNullable().references('users.id').onDelete('CASCADE')
      table
        .integer('account_flag_id')
        .unsigned()
        .notNullable()
        .references('accounts_flags.id')
        .onDelete('CASCADE')
      table.smallint('vote').notNullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
      table.unique(['user_id', 'account_flag_id'])
      table.index(['account_flag_id', 'vote'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
