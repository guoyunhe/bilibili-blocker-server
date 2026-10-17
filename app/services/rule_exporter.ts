import db from '@adonisjs/lucid/services/db'
import drive from '@adonisjs/drive/services/main'

import Flag from '#models/flag'

export async function exportRules() {
  const flags = await Flag.query().select('code').orderBy('code')
  const uidsByCode = new Map(flags.map(({ code }) => [code, [] as string[]]))
  const approvedRules = await db
    .from('accounts_flags')
    .join('accounts', 'accounts.id', 'accounts_flags.account_id')
    .join('flags', 'flags.id', 'accounts_flags.flag_id')
    .where('accounts_flags.status', 'approved')
    .select('flags.code as code', 'accounts.uid as uid')
    .orderBy('flags.code')
    .orderBy('accounts.uid')

  for (const { code, uid } of approvedRules) {
    const uids = uidsByCode.get(code)
    if (!uids) throw new Error(`Cannot export rules: flag "${code}" is missing`)
    uids.push(uid)
  }

  const disk = drive.use('fs')
  for (const [code, uids] of uidsByCode) {
    const body = uids.length > 0 ? `${uids.join('\n')}\n` : ''
    await disk.put(`rules/${code}.txt`, body, {
      contentType: 'text/plain; charset=utf-8',
    })
  }

  return { flagCount: flags.length, exportedUidCount: approvedRules.length }
}
