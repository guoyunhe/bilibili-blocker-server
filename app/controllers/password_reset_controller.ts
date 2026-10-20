import type { HttpContext } from '@adonisjs/core/http'
import passwordResetService from 'adonisjs-auth-mail/services/password_reset'
import { PasswordBrokerStatus } from 'adonisjs-auth-mail'

import { forgotPasswordValidator, resetPasswordValidator } from '#validators/password_reset'

export default class PasswordResetController {
  async forgot({ request, response }: HttpContext) {
    const { email } = await request.validateUsing(forgotPasswordValidator)

    await passwordResetService.sendResetLink(email)

    return response.accepted({ message: 'If the account exists, an email was sent' })
  }

  async reset({ request, response }: HttpContext) {
    const { email, token, password } = await request.validateUsing(resetPasswordValidator)

    const status = await passwordResetService.reset({ email, token, password })

    if (status !== PasswordBrokerStatus.PASSWORD_RESET) {
      return response.badRequest({ message: 'Invalid or expired reset token' })
    }

    return response.ok({ message: 'Password updated' })
  }
}
