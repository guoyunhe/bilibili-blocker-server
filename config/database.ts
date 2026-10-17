import env from '#start/env'
import app from '@adonisjs/core/services/app'
import { defineConfig } from '@adonisjs/lucid'

const dbPort = env.get('DB_PORT')

const dbConfig = defineConfig({
  connection: 'mysql',

  connections: {
    mysql: {
      client: 'mysql2',
      connection: {
        host: env.get('DB_HOST'),
        port: dbPort ? Number(dbPort) : undefined,
        user: env.get('DB_USER'),
        password: env.get('DB_PASSWORD'),
        database: env.get('DB_DATABASE'),
      },
      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },
      schemaGeneration: {
        /**
         * Enable schema generation from Lucid models.
         */
        enabled: true,

        /**
         * Custom schema rules file paths.
         */
        rulesPaths: ['./database/schema_rules.js'],
      },
      debug: app.inDev,
    },
  },
})

export default dbConfig
