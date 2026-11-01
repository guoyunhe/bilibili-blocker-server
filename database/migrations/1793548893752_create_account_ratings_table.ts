import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'account_ratings'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()

      table.integer('user_id').unsigned().notNullable().references('users.id').onDelete('CASCADE')
      table
        .integer('account_id')
        .unsigned()
        .notNullable()
        .references('accounts.id')
        .onDelete('CASCADE')

      table.smallint('rating').unsigned().notNullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      table.unique(['account_id', 'user_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
