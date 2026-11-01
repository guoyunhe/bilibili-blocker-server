import { BaseSeeder } from '@adonisjs/lucid/seeders'
import db from '@adonisjs/lucid/services/db'

import Account from '#models/account'
import { recalculateAccountRating } from '#models/account_rating'
import User from '#models/user'

const seededRatingDefinitions = [
  { userEmail: 'admin@example.com', rating: 80 },
  { userEmail: 'user@example.com', rating: 30 },
] as const

export default class AccountRatingSeeder extends BaseSeeder {
  static environment = ['development']

  async run() {
    const [account, admin, user] = await Promise.all([
      Account.query().orderBy('uid').first(),
      User.findBy('email', 'admin@example.com'),
      User.findBy('email', 'user@example.com'),
    ])

    if (!account) throw new Error('Cannot seed ratings: no accounts are available')
    if (!admin) throw new Error('Cannot seed ratings: demo admin user is missing')
    if (!user) throw new Error('Cannot seed ratings: demo user is missing')

    const userIdByEmail = new Map([
      [admin.email, admin.id],
      [user.email, user.id],
    ])
    const now = new Date()
    const ratings = seededRatingDefinitions.map(({ userEmail, rating }) => {
      const userId = userIdByEmail.get(userEmail)
      if (userId === undefined) throw new Error(`Cannot seed rating for "${userEmail}"`)

      return {
        user_id: userId,
        account_id: account.id,
        rating,
        created_at: now,
        updated_at: now,
      }
    })

    await db
      .table('account_ratings')
      .insert(ratings)
      .onConflict(['user_id', 'account_id'])
      .merge(['rating', 'updated_at'])

    await recalculateAccountRating(account.id)
  }
}
