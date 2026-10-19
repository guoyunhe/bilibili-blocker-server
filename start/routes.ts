/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

router
  .group(() => {
    router.get('/', () => ({ hello: 'world' }))
    router.get('flags', [controllers.Flags, 'index'])
    router.get('accounts/:uid', [controllers.Accounts, 'show'])
    router.get('users/:id', [controllers.Users, 'show'])
    router.post('email/verify/send', [controllers.EmailVerification, 'send']).use(middleware.auth())
    router.post('email/verify', [controllers.EmailVerification, 'verify'])
    router
      .post('accounts/:uid/flags/:code/votes', [controllers.AccountFlagVotes, 'store'])
      .use(middleware.auth())
      .use(middleware.verified())

    router
      .group(() => {
        router.resource('users', controllers.AdminUsers).only(['index', 'destroy'])
        router.resource('votes', controllers.AdminVotes).only(['index'])
      })
      .prefix('admin')
      .use(middleware.auth())
      .use(middleware.admin())

    router
      .group(() => {
        router.post('register', [controllers.Auth, 'register'])
        router.post('login', [controllers.Auth, 'login'])
        router.post('logout', [controllers.Auth, 'logout']).use(middleware.auth())
        router.get('user', [controllers.Auth, 'user']).use(middleware.auth())
      })
      .prefix('auth')
      .as('auth')
  })
  .prefix('/api')

router.on('*').setHandler(({ view }) => view.render('app'))
