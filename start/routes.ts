/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import { appUrl } from '#config/app'
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

router
  .group(() => {
    router.get('/', () => ({ hello: 'world' }))
    router.get('flags', [controllers.Flags, 'index'])
    router.get('accounts/:uid', [controllers.Accounts, 'show'])
    router
      .group(() => {
        router.get('extensions', [controllers.Stats, 'extensions'])
        router.get('contributors', [controllers.Stats, 'contributors'])
        router.get('marked-accounts', [controllers.Stats, 'markedAccounts'])
        router.get('votes', [controllers.Stats, 'votes'])
      })
      .prefix('stats')
    router.get('users/:id', [controllers.Users, 'show'])
    router.post('email/verify/send', [controllers.EmailVerification, 'send']).use(middleware.auth())
    router.post('email/verify', [controllers.EmailVerification, 'verify'])
    router
      .post('accounts/:uid/flags/:code/votes', [controllers.AccountFlagVotes, 'store'])
      .use(middleware.auth())
      .use(middleware.verified())

    router
      .group(() => {
        router.resource('flags', controllers.AdminFlags).apiOnly()
        router.resource('users', controllers.AdminUsers).only(['index', 'destroy'])
        router.resource('votes', controllers.AdminVotes).only(['index'])
      })
      .prefix('admin')
      .as('admin')
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
  })
  .prefix('/api')

router.get('/robots.txt', ({ response }) => {
  response.header('Content-Type', 'text/plain; charset=utf-8')
  return `User-agent: *
Allow: /
Disallow: /api/
Sitemap: ${new URL('/sitemap.xml', appUrl).toString()}
`
})

router.get('/sitemap.xml', ({ response }) => {
  response.header('Content-Type', 'application/xml; charset=utf-8')
  const homepageUrl = new URL('/', appUrl).toString().replaceAll('&', '&amp;')
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${homepageUrl}</loc>
  </url>
</urlset>
`
})

router.on('*').setHandler(({ request, view }) => {
  const currentUrl = new URL(request.url(), appUrl)
  const pathname = currentUrl.pathname
  const accountMatch = pathname.match(/^\/accounts\/(\d+)\/?$/)
  const isHomepage = pathname === '/'
  const isIndexable = isHomepage || accountMatch !== null
  const title = accountMatch
    ? `B站账号 UID ${accountMatch[1]} 屏蔽规则查询 | Bilibili Blocker`
    : 'Bilibili Blocker - B站账号屏蔽与社区规则查询'
  const description = accountMatch
    ? `查询 Bilibili 账号 UID ${accountMatch[1]} 的社区标记与屏蔽规则，查看规则关联状态并参与投票。`
    : '使用 Bilibili Blocker 查询 B 站账号屏蔽规则，社区协作标记不良内容账号，并下载 Chrome、Firefox 和 Edge 浏览器插件。'
  const canonicalUrl = new URL(pathname, appUrl).toString()

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'Bilibili Blocker',
    'url': new URL('/', appUrl).toString(),
    'inLanguage': 'zh-CN',
    'publisher': {
      '@type': 'Organization',
      'name': 'Bilibili Blocker',
      'url': new URL('/', appUrl).toString(),
      'sameAs': ['https://github.com/guoyunhe/bilibili-blocker', 'https://t.me/bilibili_blocker'],
    },
  }

  return view.render('app', {
    canonicalUrl,
    description,
    robots: isIndexable ? 'index,follow' : 'noindex,follow',
    schema: JSON.stringify(schema).replaceAll('<', '\\u003c'),
    title,
    ogImageUrl: new URL('/og-image.png', appUrl).toString(),
  })
})
