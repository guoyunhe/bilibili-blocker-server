import vine, { SimpleMessagesProvider } from '@vinejs/vine'

export const accountUidParamsValidator = vine.create({
  uid: vine.string().regex(/^\d+$/),
})

export const accountUidParamsMessages = new SimpleMessagesProvider({
  'uid.required': 'UID 必须为纯数字',
  'uid.regex': 'UID 必须为纯数字',
})
