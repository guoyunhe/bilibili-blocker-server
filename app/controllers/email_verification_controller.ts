import type { HttpContext } from '@adonisjs/core/http'
import emailVerificationService from 'adonisjs-auth-mail/services/email_verification'

export default class EmailVerificationController {
  /** POST /email/verify/send (authenticated) */
  async send({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    if (user.emailVerifiedAt) return response.badRequest({ message: '您的邮箱已验证' })
    await emailVerificationService.sendVerificationLink(user)
    return response.accepted({ message: '验证邮件已发送' })
  }

  /** POST /api/email/verify */
  async verify({ request, response }: HttpContext) {
    const token: unknown = request.input('token')
    if (typeof token !== 'string' || !token) {
      return response.badRequest({ message: '验证链接无效或已过期' })
    }

    const user = await emailVerificationService.verify(token)
    if (!user) return response.badRequest({ message: '验证链接无效或已过期' })
    return { message: '邮箱验证成功', email: user.email }
  }
}
