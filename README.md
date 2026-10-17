# Bilibili Blocker Server

Bilibili Blocker 的服务端项目，提供账户认证 API 和 React 登录页面。当前实现包括注册、登录、访问令牌认证、用户角色和管理员中间件；MariaDB 负责保存用户和访问令牌数据。

## 功能

- React 登录、注册和账户页面
- JSON API：注册、登录、获取当前用户和退出登录
- `user` / `admin` 角色及可用于路由授权的管理员中间件
- `user:role` 命令，用邮箱查找用户并修改角色
- Podman Compose 管理本地 MariaDB 开发容器
- 仅在 development/test 环境运行的演示用户 seeder

## 技术栈

- Node.js、TypeScript、AdonisJS
- Lucid ORM、MariaDB
- React、Vite
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

Seeder 只会在 development/test 环境创建以下演示账户，不要在真实部署中使用这些凭据：

| 角色 | 邮箱 | 密码 |
|---|---|---|
| 管理员 | `admin@example.com` | `Admin123!` |
| 普通用户 | `user@example.com` | `User123!` |

### API

API 前缀为 `/api`。注册、登录和获取当前用户接口的响应数据包装在 `data` 字段中；健康检查和注销接口返回普通 JSON 对象。

| 方法 | 路径 | 认证 | 说明 |
|---|---|---|---|
| `GET` | `/api/` | 否 | API 健康检查 |
| `POST` | `/api/auth/register` | 否 | 注册账户，提交 `name`、`email`、`password`、`passwordConfirmation` |
| `POST` | `/api/auth/login` | 否 | 登录并获取 Bearer token |
| `GET` | `/api/auth/user` | 是 | 获取当前用户 |
| `POST` | `/api/auth/logout` | 是 | 注销当前 token |

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
