import vine from '@vinejs/vine'

export const accountRatingValidator = vine.create({
  rating: vine.number().min(0).max(100).withoutDecimals(),
})
