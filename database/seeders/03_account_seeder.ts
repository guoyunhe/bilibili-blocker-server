import { BaseSeeder } from '@adonisjs/lucid/seeders'
import db from '@adonisjs/lucid/services/db'

import Account from '#models/account'
import Flag from '#models/flag'

const batchSize = 1000
const ruleUrl = 'https://bilibili-blocker.netlify.app/rules'

async function downloadFlagAccounts(code: string) {
  const response = await fetch(`${ruleUrl}/${code}.txt`, {
    signal: AbortSignal.timeout(30_000),
  })
  if (!response.ok) {
    throw new Error(`Failed to download rule "${code}": HTTP ${response.status}`)
  }

  const uids = new Set<string>()
  const body = await response.text()
  const lines = body.split(/\r?\n/)
  for (const line of lines) {
    const uid = line.trim()
    if (!uid || uid.startsWith('#')) continue
    if (!/^\d+$/.test(uid)) continue
    uids.add(uid)
  }

  if (uids.size === 0) {
    throw new Error(`Rule "${code}" contained no UIDs`)
  }

  return { code, uids: [...uids] }
}

export default class AccountSeeder extends BaseSeeder {
  async run() {
    const flags = await Flag.query().select('id', 'code')
    if (flags.length === 0) throw new Error('Cannot seed accounts: no flags are defined')

    const flagAccounts = await Promise.all(flags.map(({ code }) => downloadFlagAccounts(code)))
    const accountUids = [...new Set(flagAccounts.flatMap(({ uids }) => uids))]
    const accountRecords = accountUids.map((uid) => ({ uid }))
    for (let index = 0; index < accountRecords.length; index += batchSize) {
      await Account.updateOrCreateMany('uid', accountRecords.slice(index, index + batchSize))
    }

    const flagIdByCode = new Map(flags.map(({ id, code }) => [code, id]))
    const accounts = await Account.query().select('id', 'uid')
    const accountIdByUid = new Map(accounts.map(({ id, uid }) => [uid, id]))
    const flagIds = flagAccounts.map(({ code }) => {
      const id = flagIdByCode.get(code)
      if (id === undefined) throw new Error(`Flag "${code}" was not created`)
      return id
    })

    const now = new Date()
    await db
      .from('accounts_flags')
      .whereIn('flag_id', flagIds)
      .update({ is_associated: false, updated_at: now })

    const associations: Array<{
      account_id: number
      flag_id: number
      is_associated: boolean
      created_at: Date
      updated_at: Date
    }> = []
    for (const { code, uids } of flagAccounts) {
      const flagId = flagIdByCode.get(code)
      if (flagId === undefined) throw new Error(`Flag "${code}" was not created`)

      for (const uid of new Set(uids)) {
        const accountId = accountIdByUid.get(uid)
        if (accountId === undefined) throw new Error(`Account UID "${uid}" was not created`)
        associations.push({
          account_id: accountId,
          flag_id: flagId,
          is_associated: true,
          created_at: now,
          updated_at: now,
        })
      }
    }

    for (let index = 0; index < associations.length; index += batchSize) {
      await db
        .table('accounts_flags')
        .insert(associations.slice(index, index + batchSize))
        .onConflict(['account_id', 'flag_id'])
        .merge(['is_associated', 'updated_at'])
    }
  }
}
