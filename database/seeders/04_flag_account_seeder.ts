import { BaseSeeder } from '@adonisjs/lucid/seeders'
import db from '@adonisjs/lucid/services/db'

import Account from '#models/account'
import Flag from '#models/flag'

const batchSize = 1000
const ruleUrl = 'https://bilibili-blocker.netlify.app/rules'
const flagDefinitions = [
  { code: 'aislop', name: 'AI 泔水' },
  { code: 'aivoice', name: 'AI 配音' },
  { code: 'catfish', name: '钓鱼内容' },
  { code: 'clickbait', name: '标题党' },
  { code: 'copycat', name: '搬运与切片(未授权)' },
  { code: 'fakenews', name: '假新闻' },
  { code: 'finance', name: '投资理财与欺诈风险' },
  { code: 'sales', name: '推销带货' },
  { code: 'spam', name: '垃圾内容' },
  { code: 'superstition', name: '封建迷信与宗教' },
  { code: 'troll', name: '对立引战' },
]

async function downloadFlagAccounts({ code, name }: (typeof flagDefinitions)[number]) {
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

  return { code, name, uids: [...uids] }
}

export default class FlagAccountSeeder extends BaseSeeder {
  async run() {
    const flagAccounts = await Promise.all(flagDefinitions.map(downloadFlagAccounts))
    const flagRecords = flagAccounts.map(({ code, name }) => ({ code, name }))
    for (let index = 0; index < flagRecords.length; index += batchSize) {
      await Flag.updateOrCreateMany('code', flagRecords.slice(index, index + batchSize))
    }

    const accountUids = [...new Set(flagAccounts.flatMap(({ uids }) => uids))]
    const accountRecords = accountUids.map((uid) => ({ uid }))
    for (let index = 0; index < accountRecords.length; index += batchSize) {
      await Account.updateOrCreateMany('uid', accountRecords.slice(index, index + batchSize))
    }

    const flags = await Flag.query().select('id', 'code')
    const flagIdByCode = new Map(flags.map(({ id, code }) => [code, id]))
    const accounts = await Account.query().select('id', 'uid')
    const accountIdByUid = new Map(accounts.map(({ id, uid }) => [uid, id]))
    const flagIds = flagAccounts.map(({ code }) => {
      const id = flagIdByCode.get(code)
      if (id === undefined) throw new Error(`Flag "${code}" was not created`)
      return id
    })

    await db.from('accounts_flags').whereIn('flag_id', flagIds).delete()

    const associations: Array<{ account_id: number; flag_id: number }> = []
    for (const { code, uids } of flagAccounts) {
      const flagId = flagIdByCode.get(code)
      if (flagId === undefined) throw new Error(`Flag "${code}" was not created`)

      for (const uid of new Set(uids)) {
        const accountId = accountIdByUid.get(uid)
        if (accountId === undefined) throw new Error(`Account UID "${uid}" was not created`)
        associations.push({ account_id: accountId, flag_id: flagId })
      }
    }

    for (let index = 0; index < associations.length; index += batchSize) {
      await db.table('accounts_flags').insert(associations.slice(index, index + batchSize))
    }
  }
}
