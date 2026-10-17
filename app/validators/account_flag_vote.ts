import vine from '@vinejs/vine'

export const accountFlagVoteValidator = vine.create({
  direction: vine.enum(['up', 'down']),
})
