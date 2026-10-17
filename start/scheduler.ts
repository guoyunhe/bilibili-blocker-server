import ExportRules from '#jobs/export_rules'

await ExportRules.schedule({}).id('export-rules').cron('0 3 * * *').run()
