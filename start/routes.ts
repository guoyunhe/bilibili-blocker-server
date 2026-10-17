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
