import { type SchemaRules } from '@adonisjs/lucid/types/schema_generator'

export default {
  tables: {
    flags: {
      columns: {
        recommended: {
          tsType: 'boolean',
          decorator:
            '@column({ prepare: (value) => Number(value), consume: (value) => Boolean(value) })',
        },
      },
    },
  },
} satisfies SchemaRules
