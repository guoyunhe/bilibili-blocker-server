import { BaseSeeder } from '@adonisjs/lucid/seeders'
import db from '@adonisjs/lucid/services/db'

import Account from '#models/account'
import Flag from '#models/flag'
import User from '#models/user'

const seededVoteDefinitions = [
  { userEmail: 'admin@example.com', flagCode: 'aislop', vote: 1 },
  { userEmail: 'user@example.com', flagCode: 'aislop', vote: 1 },
  { userEmail: 'admin@example.com', flagCode: 'aivoice', vote: -1 },
  { userEmail: 'user@example.com', flagCode: 'aivoice', vote: 1 },
  { userEmail: 'admin@example.com', flagCode: 'spam', vote: -1 },
  { userEmail: 'user@example.com', flagCode: 'spam', vote: -1 },
] as const

export default class AccountFlagVoteSeeder extends BaseSeeder {
  static environment = ['development']

  async run() {
    const [account, admin, user, aiSlopFlag, aiVoiceFlag, spamFlag] = await Promise.all([
      Account.query().orderBy('uid').first(),
      User.findBy('email', 'admin@example.com'),
      User.findBy('email', 'user@example.com'),
      Flag.findBy('code', 'aislop'),
      Flag.findBy('code', 'aivoice'),
      Flag.findBy('code', 'spam'),
    ])

    if (!account) throw new Error('Cannot seed votes: no accounts are available')
    if (!admin) throw new Error('Cannot seed votes: demo admin user is missing')
    if (!user) throw new Error('Cannot seed votes: demo user is missing')
    if (!aiSlopFlag) throw new Error('Cannot seed votes: "aislop" flag is missing')
    if (!aiVoiceFlag) throw new Error('Cannot seed votes: "aivoice" flag is missing')
    if (!spamFlag) throw new Error('Cannot seed votes: "spam" flag is missing')

    const userIdByEmail = new Map([
      [admin.email, admin.id],
      [user.email, user.id],
    ])
    const flagIdByCode = new Map([
      [aiSlopFlag.code, aiSlopFlag.id],
      [aiVoiceFlag.code, aiVoiceFlag.id],
      [spamFlag.code, spamFlag.id],
    ])
    const flagIds = [...flagIdByCode.values()]
    await db
      .table('accounts_flags')
      .insert(
        flagIds.map((flagId) => ({
          account_id: account.id,
          flag_id: flagId,
          is_associated: false,
        }))
      )
      .onConflict(['account_id', 'flag_id'])
      .ignore()
    const accountFlags = await db
      .from('accounts_flags')
      .where('account_id', account.id)
      .whereIn('flag_id', flagIds)
      .select('id', 'flag_id')
    const accountFlagIdByFlagId = new Map(accountFlags.map(({ id, flag_id }) => [flag_id, id]))

    const now = new Date()
    const votes = seededVoteDefinitions.map(({ userEmail, flagCode, vote }) => {
      const userId = userIdByEmail.get(userEmail)
      const flagId = flagIdByCode.get(flagCode)
      const accountFlagId = flagId === undefined ? undefined : accountFlagIdByFlagId.get(flagId)
      if (userId === undefined || accountFlagId === undefined) {
        throw new Error(`Cannot seed vote for "${userEmail}" and "${flagCode}"`)
      }

      return {
        user_id: userId,
        account_flag_id: accountFlagId,
        vote,
        created_at: now,
        updated_at: now,
      }
    })

    await db
      .table('account_flag_votes')
      .insert(votes)
      .onConflict(['user_id', 'account_flag_id'])
      .merge(['vote', 'updated_at'])
  }
}
