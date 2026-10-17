# Bilibili Blocker Server

Bilibili Blocker 的服务端项目，提供账户认证 API、按 UID 查询账号的 API 和 React 页面。当前实现包括注册、登录、访问令牌认证、用户角色和管理员中间件；MariaDB 负责保存用户、访问令牌、屏蔽规则、账号及其关联数据。

## 功能

- 无需登录即可按 UID 查询账号与屏蔽规则；登录、注册入口位于页面顶栏
- 登录用户可对账号的任意已定义 flag 进行 up/down vote，详情页展示票数及关联状态
- 提供 Chrome、Firefox 和 Edge 浏览器插件商店下载链接
- JSON API：注册、登录、获取当前用户、退出登录和按 UID 查询账号
- `user` / `admin` 角色及可用于路由授权的管理员中间件
- `user:role` 命令，用邮箱查找用户并修改角色
- 从浏览器扩展规则清单导入规则、UID 账号和多对多关联
- 每天凌晨 3 点导出已审核通过的规则到 public Drive，可从 `/uploads/rules/{规则 code}.txt` 下载
- 仅在 development 环境运行的演示投票 seeder
- Podman Compose 管理本地 MariaDB 开发容器
- 仅在 development/test 环境运行的演示用户 seeder

## 技术栈

- Node.js、TypeScript、AdonisJS
- Lucid ORM、MariaDB
- React、Vite、Mantine UI、Phosphor 图标
- pnpm

## 本地开发

### 环境要求

- Node.js 和 pnpm
- Podman，以及支持 `podman compose` 的 Compose provider

### 安装和配置

在项目根目录运行：

```sh
pnpm install
cp .env.example .env
node ace generate:key
```

为避免开发项目间的端口冲突，编辑 `.env`，将 `DB_PORT` 设为可用的非默认端口，例如 `3307`。该端口同时供应用连接 MariaDB，并由 Compose 映射到容器的 `3306` 端口。

### 启动数据库和应用

```sh
podman compose up -d mariadb
node ace migration:run
node ace db:seed
pnpm dev
```

浏览器打开 <http://localhost:3520>。登录和注册页面分别位于 `/login` 和 `/register`。
计划任务使用数据库队列：首次部署需执行 `node ace migration:run`，并保持 `pnpm worker` 进程运行。规则文件写入项目 `storage/rules` 目录，下载地址为 `/uploads/rules/{规则 code}.txt`。
需要立即重新生成规则文件时，可运行 `node ace rules:export`。

### PM2 部署

准备好生产 `.env` 并安装 PM2 后，在项目根目录运行：

```sh
pnpm install --frozen-lockfile
pnpm build
node ace migration:run
pm2 start ecosystem.config.cjs --env production
pm2 save
```

`ecosystem.config.cjs` 会以 cluster 模式启动 Web 服务，并以单实例启动队列 worker。发布新版本后重新构建并运行 `pm2 reload ecosystem.config.cjs --env production`。

Seeder 只会在 development/test 环境创建以下演示账户，不要在真实部署中使用这些凭据：

| 角色     | 邮箱                | 密码        |
| -------- | ------------------- | ----------- |
| 管理员   | `admin@example.com` | `Admin123!` |
| 普通用户 | `user@example.com`  | `User123!`  |

`node ace db:seed` 还会运行规则数据 seeder，从 Bilibili Blocker CDN 下载规则文件，将规则写入 `flags`，将去重后的 UID 写入 `accounts`，并同步 `accounts_flags` 关联。执行该 seeder 需要网络连接；规则 code 和中文名称保存在 seeder 中，UID 列表不会随项目仓库分发。

投票 seeder 使用演示用户和已导入的账号、flag 创建可重复运行的示例投票，仅在 development 环境执行。

### API

API 前缀为 `/api`。除健康检查和注销外，接口响应数据包装在 `data` 字段中。

| 方法   | 路径                                   | 认证 | 说明                                                                                    |
| ------ | -------------------------------------- | ---- | --------------------------------------------------------------------------------------- |
| `GET`  | `/api/`                                | 否   | API 健康检查                                                                            |
| `GET`  | `/api/accounts/:uid`                   | 否   | 按 UID 查询账号、所有 flag 的关联状态、up/down 票数和净得分；登录时也返回自己的投票状态 |
| `POST` | `/api/accounts/:uid/flags/:code/votes` | 是   | 提交 `{"direction":"up"}` 或 `{"direction":"down"}`；每位用户对每个账号/flag 只有一票   |
| `POST` | `/api/auth/register`                   | 否   | 注册账户，提交 `name`、`email`、`password`、`passwordConfirmation`                      |
| `POST` | `/api/auth/login`                      | 否   | 登录并获取 Bearer token                                                                 |
| `GET`  | `/api/auth/user`                       | 是   | 获取当前用户                                                                            |
| `POST` | `/api/auth/logout`                     | 是   | 注销当前 token                                                                          |

认证接口需要在请求头中发送 `Authorization: Bearer <token>`。管理员路由可组合使用 `auth` 和 `admin` 中间件；修改用户角色的命令示例：

```sh
node ace user:role user@example.com admin
```

### 常用检查

```sh
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

## 数据库注意事项

用户表由 `database/migrations` 中的初始 migration 创建，包含 `name` 和默认值为 `user` 的 `role` 字段。若本地数据库已执行过旧版用户表 migration，`node ace migration:run` 不会重新执行已记录的 migration。需要重建本地开发数据库时可运行：

```sh
node ace migration:fresh
```

**该命令会删除数据库中的所有表和数据；运行前确认数据库中没有需要保留的数据。**
