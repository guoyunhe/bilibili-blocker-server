import vine, { SimpleMessagesProvider } from '@vinejs/vine'

const positiveSafeInteger = vine.createRule((value, _options, field) => {
  const id = Number(value)
  if (!Number.isSafeInteger(id) || id < 1) {
    field.report('用户 ID 无效', 'positiveSafeInteger', field)
  }
})

/**
 * Shared rules for email and password.
 */
const email = () => vine.string().email().maxLength(254)
const password = () => vine.string().minLength(8).maxLength(32)

/**
 * Validator to use when performing self-signup
 */
export const signupValidator = vine.create({
  name: vine.string().trim().maxLength(32),
  email: email().unique({ table: 'users', column: 'email' }),
  password: password(),
  passwordConfirmation: password().sameAs('password'),
})

/**
 * Validator to use before validating user credentials
 * during login
 */
export const loginValidator = vine.create({
  email: email(),
  password: vine.string(),
})

/**
 * Route param validator for the numeric user ID.
 */
export const userIdParamsValidator = vine.create({
  id: vine
    .string()
    .regex(/^\d+$/)
    .use(positiveSafeInteger())
    .transform((value) => Number(value)),
})

export const userIdParamsMessages = new SimpleMessagesProvider({
  'id.required': '用户 ID 无效',
  'id.regex': '用户 ID 无效',
})
