import vine from '@vinejs/vine'

export const accountFlagStatusValidator = vine.create({
  status: vine.enum(['approved', 'rejected']).nullable(),
})
