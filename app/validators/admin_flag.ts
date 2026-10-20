import vine from '@vinejs/vine'

export const adminFlagValidator = vine.create({
  code: vine
    .string()
    .trim()
    .minLength(1)
    .regex(/^[a-z0-9_-]+$/)
    .maxLength(32),
  name: vine.string().trim().minLength(1).maxLength(128),
  description: vine.string().trim().minLength(1),
  recommended: vine.boolean(),
})
