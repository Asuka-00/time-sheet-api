# Time Sheet API - 项目工时管理系统

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

基于 NestJS、TypeORM 构建的全功能工时管理系统，支持多种数据库。

## 📖 项目简介

Time Sheet
API 是一个功能完整的 RESTful 后端服务，用于管理员工工时、项目和工作记录。系统具备完善的认证机制、基于角色的权限控制，以及对多种数据库类型的支持。

### 核心功能

- ✅ **多数据库支持**：SQLite、MySQL、PostgreSQL、Oracle
- ✅ **JWT 双令牌认证**：访问令牌 + 刷新令牌机制
- ✅ **基于角色的权限控制（RBAC）**：细粒度权限管理
- ✅ **审计日志**：自动记录数据变更及用户操作上下文
- ✅ **Swagger 文档**：交互式 API 文档
- ✅ **TypeScript**：完整的类型安全和现代开发体验
- ✅ **模块化架构**：清晰、可维护的代码结构

## 🛠️ 技术栈

- **框架**: NestJS 11.x
- **语言**: TypeScript 5.x
- **ORM**: TypeORM 0.3.x
- **认证**: JWT with Passport
- **密码加密**: Argon2
- **数据验证**: class-validator & class-transformer
- **API 文档**: Swagger/OpenAPI
- **数据库**: SQLite（默认）、MySQL、PostgreSQL、Oracle

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0 或 yarn
- 数据库（SQLite 已包含，MySQL/PostgreSQL/Oracle 可选）

### 安装步骤

#### 1. 克隆仓库

```bash
git clone <repository-url>
cd time-sheet-api
```

#### 2. 安装依赖

```bash
npm install
```

#### 3. 配置环境变量

本项目使用不同的环境配置文件来管理开发和生产环境的配置：

- `.env.development` - 开发环境配置
- `.env.production` - 生产环境配置
- `.env.example` - 配置模板（参考示例）

**首次设置**：

```bash
# Windows
copy .env.example .env.development
copy .env.example .env.production

# Linux/macOS
cp .env.example .env.development
cp .env.example .env.production
```

编辑 `.env.development` 和 `.env.production` 文件，配置数据库、JWT 等参数（详见下方配置说明）。

#### 4. 启动开发服务器

```bash
npm run start:dev
```

服务器将在 `http://localhost:8090` 启动（或您配置的端口）。

#### 5. 访问 Swagger 文档

在浏览器中打开：`http://localhost:8090/api`

## 📁 项目结构

```
time-sheet-api/
├── src/
│   ├── modules/              # 业务模块
│   │   ├── auth/            # 认证与授权
│   │   │   ├── decorators/  # 自定义装饰器（Public、CurrentUser 等）
│   │   │   ├── dto/         # 认证 DTOs（登录、注册等）
│   │   │   ├── guards/      # JWT 守卫
│   │   │   └── strategies/  # Passport 策略（JWT Access、Refresh）
│   │   ├── users/           # 用户管理
│   │   ├── roles/           # 角色管理
│   │   ├── permissions/     # 权限管理
│   │   ├── departments/     # 部门管理
│   │   ├── projects/        # 项目管理
│   │   └── timesheets/      # 工时管理
│   ├── common/              # 共享工具
│   │   ├── constants/       # 应用常量和错误码
│   │   ├── context/         # 请求上下文服务
│   │   ├── decorators/      # 自定义装饰器
│   │   ├── dto/             # 基础 DTOs（分页等）
│   │   ├── exceptions/      # 自定义异常
│   │   ├── filters/         # 异常过滤器
│   │   ├── interceptors/    # 请求/响应拦截器
│   │   └── subscribers/     # TypeORM 订阅器（审计日志）
│   ├── config/              # 配置文件
│   │   └── database.config.ts  # 数据库配置工厂
│   ├── app.module.ts        # 根模块
│   ├── app.controller.ts    # 根控制器
│   ├── app.service.ts       # 根服务
│   └── main.ts              # 应用入口
├── test/                    # E2E 测试
├── .env                     # 环境变量（需从 .env.example 创建）
├── .env.example             # 环境变量模板
├── database.sqlite          # SQLite 数据库（自动生成）
├── package.json             # 依赖和脚本
└── tsconfig.json            # TypeScript 配置
```

## ⚙️ 配置说明

### 多环境配置

本项目支持开发和生产环境的独立配置，通过不同的环境配置文件实现配置隔离。

#### 环境配置文件

- `.env.development` - 开发环境配置（用于本地开发和测试）
- `.env.production` - 生产环境配置（用于生产部署）
- `.env.example` - 配置模板文件（提供参考，会提交到代码仓库）

#### 运行不同环境

项目根据启动脚本自动加载对应的环境配置：

**开发环境**：

```bash
# 开发模式（监听文件变化）
npm run start:dev

# 开发模式（普通启动）
npm run start

# 开发模式（调试模式）
npm run start:debug
```

以上命令会自动加载 `.env.development` 配置文件。

**生产环境**：

```bash
# 构建生产版本
npm run build:prod

# 运行生产版本
npm run start:prod
```

以上命令会自动加载 `.env.production` 配置文件。

#### 配置文件优先级

项目通过 `NODE_ENV` 环境变量决定加载哪个配置文件：

- `NODE_ENV=development` → 加载 `.env.development`
- `NODE_ENV=production` → 加载 `.env.production`
- 未设置时默认为 `development`

**注意事项**：

- `.env.development` 和 `.env.production` 不会提交到代码仓库（已在 `.gitignore` 中排除）
- `.env.example` 会提交到代码仓库，作为配置模板供开发者参考
- 首次克隆项目后，需要手动创建 `.env.development` 和 `.env.production` 文件

### 环境变量

应用使用环境变量进行配置。将 `.env.example` 复制为 `.env.development` 和 `.env.production`
并配置以下内容：

### 数据库配置

#### SQLite（默认）

```env
DB_TYPE=sqlite
DATABASE_PATH=./database.sqlite
DB_SYNCHRONIZE=true
DB_LOGGING=true
```

SQLite 数据库文件会在首次启动时自动创建。

#### MySQL

```env
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=timesheet
DB_SYNCHRONIZE=true
DB_LOGGING=true
```

**注意**：确保 MySQL 已安装并运行。驱动已包含在依赖中。

#### PostgreSQL

```env
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=timesheet
DB_SYNCHRONIZE=true
DB_LOGGING=true
```

**注意**：确保 PostgreSQL 已安装并运行。驱动已包含在依赖中。

#### Oracle

```env
DB_TYPE=oracle
DB_HOST=localhost
DB_PORT=1521
DB_USERNAME=system
DB_PASSWORD=your_password
DB_DATABASE=xe
DB_SYNCHRONIZE=false
DB_LOGGING=true
```

**注意**：需要 Oracle 客户端库。参考 [node-oracledb 文档](https://node-oracledb.readthedocs.io/)。

### JWT 配置

本项目使用双令牌认证机制：

#### Access Token（访问令牌）

- **用途**：API 接口认证
- **有效期**：30 分钟（默认）
- **存储**：客户端内存或短期存储

#### Refresh Token（刷新令牌）

- **用途**：刷新访问令牌
- **有效期**：7 天（默认）
- **存储**：安全的 HTTP-only Cookie（推荐）

```env
# Access Token 配置
JWT_ACCESS_SECRET=your-secure-access-secret-change-in-production
JWT_ACCESS_EXPIRATION=30m

# Refresh Token 配置
JWT_REFRESH_SECRET=your-secure-refresh-secret-change-in-production
JWT_REFRESH_EXPIRATION=7d
```

**安全建议**：

1. 生产环境必须使用强随机密钥
2. Access Secret 和 Refresh Secret 必须不同
3. 定期更换密钥
4. 永远不要将密钥提交到版本控制系统

### CORS 配置

配置跨域资源共享，允许前端应用访问：

```env
# 允许的源地址（逗号分隔，或 * 表示所有）
CORS_ORIGIN=http://localhost:3000,http://localhost:5173

# 是否允许携带凭证（cookies、authorization headers）
CORS_CREDENTIALS=true
```

**开发环境 vs 生产环境**：

- 开发环境：可以使用 `CORS_ORIGIN=*` 方便开发
- 生产环境：必须指定具体的前端 URL

### 服务器配置

```env
# 服务器端口
PORT=8090

# 开发模式（启用额外的日志和功能）
DEV_MODE=true

# 开发 Token（仅用于开发环境，生产环境必须禁用）
DEV_TOKEN=dev-token-2024
```

### 环境变量参考表

| 变量名                   | 说明                                         | 默认值            | 必需                 |
| ------------------------ | -------------------------------------------- | ----------------- | -------------------- |
| `DB_TYPE`                | 数据库类型 (sqlite\|mysql\|postgres\|oracle) | sqlite            | 否                   |
| `DB_HOST`                | 数据库主机地址                               | localhost         | MySQL/PG/Oracle 需要 |
| `DB_PORT`                | 数据库端口                                   | 3306/5432/1521    | MySQL/PG/Oracle 需要 |
| `DB_USERNAME`            | 数据库用户名                                 | -                 | MySQL/PG/Oracle 需要 |
| `DB_PASSWORD`            | 数据库密码                                   | -                 | MySQL/PG/Oracle 需要 |
| `DB_DATABASE`            | 数据库名/SID                                 | timesheet         | MySQL/PG/Oracle 需要 |
| `DATABASE_PATH`          | SQLite 文件路径                              | ./database.sqlite | SQLite 需要          |
| `DB_SYNCHRONIZE`         | 自动同步表结构                               | true              | 否                   |
| `DB_LOGGING`             | 启用 SQL 日志                                | true              | 否                   |
| `JWT_ACCESS_SECRET`      | 访问令牌密钥                                 | -                 | 是                   |
| `JWT_ACCESS_EXPIRATION`  | 访问令牌有效期                               | 30m               | 否                   |
| `JWT_REFRESH_SECRET`     | 刷新令牌密钥                                 | -                 | 是                   |
| `JWT_REFRESH_EXPIRATION` | 刷新令牌有效期                               | 7d                | 否                   |
| `PORT`                   | 服务器端口                                   | 8090              | 否                   |
| `CORS_ORIGIN`            | 允许的跨域源                                 | \*                | 否                   |
| `CORS_CREDENTIALS`       | 允许携带凭证                                 | false             | 否                   |
| `DEV_MODE`               | 开发模式                                     | false             | 否                   |
| `DEV_TOKEN`              | 开发 Token                                   | -                 | 否                   |

## 📚 API 文档

### Swagger UI

启动服务器后，访问交互式 API 文档：

- **开发环境**：`http://localhost:8090/api`
- **生产环境**：`http://your-domain/api`

### 主要端点

#### 认证模块

- `POST /auth/login` - 用户登录
- `POST /auth/refresh` - 刷新访问令牌
- `POST /auth/logout` - 用户退出
- `POST /auth/register` - 注册新用户

#### 用户管理

- `GET /users` - 获取用户列表（支持分页）
- `POST /users` - 创建用户
- `GET /users/:id` - 获取用户详情
- `PUT /users/:id` - 更新用户信息
- `DELETE /users/:id` - 删除用户

#### 角色管理

- `GET /roles` - 获取角色列表
- `POST /roles` - 创建角色
- `GET /roles/:id` - 获取角色详情
- `PUT /roles/:id` - 更新角色
- `DELETE /roles/:id` - 删除角色

#### 项目管理

- `GET /projects` - 获取项目列表
- `POST /projects` - 创建项目
- `GET /projects/:id` - 获取项目详情
- `PUT /projects/:id` - 更新项目
- `DELETE /projects/:id` - 删除项目

#### 工时管理

- `GET /timesheets` - 获取工时记录
- `POST /timesheets` - 创建工时条目
- `GET /timesheets/:id` - 获取工时详情
- `PUT /timesheets/:id` - 更新工时记录
- `DELETE /timesheets/:id` - 删除工时记录
- `POST /timesheets/:id/submit` - 提交审批
- `POST /timesheets/:id/approve` - 批准工时

## 🔐 认证流程

1. **登录**：向 `/auth/login` 发送凭证
    - 返回：访问令牌（短期）+ 刷新令牌（长期）

2. **API 请求**：在 Authorization 头中包含访问令牌
    - 格式：`Authorization: Bearer <access_token>`

3. **令牌刷新**：访问令牌过期后，使用刷新令牌调用 `/auth/refresh`
    - 返回：新的访问令牌 + 新的刷新令牌

4. **退出登录**：调用 `/auth/logout` 使令牌失效

## 🛠️ 开发指南

### 可用脚本

```bash
# 开发模式（带热重载）
npm run start:dev

# 开发模式（普通启动）
npm run start

# 开发模式（调试模式）
npm run start:debug

# 开发环境构建
npm run build

# 生产环境构建
npm run build:prod

# 运行生产版本
npm run start:prod

# 使用 Prettier 格式化代码
npm run format

# 检查代码格式
npm run format:check

# 检查代码规范
npm run lint:check

# 检查并自动修复代码问题
npm run lint

# 运行单元测试
npm run test

# 测试监听模式
npm run test:watch

# 运行 E2E 测试
npm run test:e2e

# 生成测试覆盖率报告
npm run test:cov
```

### 代码规范

- **代码检查**：ESLint + TypeScript 支持
- **代码格式化**：Prettier 自定义配置
- **提交前检查**：运行 `npm run lint` 和 `npm run format`

### 推荐的提交规范

- `feat:` 新功能
- `fix:` 修复 bug
- `docs:` 文档更新
- `style:` 代码格式调整（不影响功能）
- `refactor:` 代码重构
- `test:` 测试相关
- `chore:` 构建/工具相关

## 📦 生产环境部署

### 构建

```bash
npm run build:prod
```

编译输出将在 `dist/` 目录中。

### 环境设置

1. 确保已创建 `.env.production` 文件（从 `.env.example` 复制并修改）
2. 在 `.env.production` 中配置以下关键项：
    - 使用强随机密钥配置 `JWT_SECRET` 和 `JWT_REFRESH_SECRET`
    - 将 `DB_SYNCHRONIZE` 设为 `false`（使用迁移管理数据库）
    - 配置具体的 `CORS_ORIGIN`（不要使用 `*`）
    - 使用生产环境的数据库凭证
    - 设置 `NODE_ENV=production`（脚本会自动设置）
3. 确保生产数据库已正确设置和初始化

### 运行生产版本

```bash
npm run start:prod
```

该命令会自动使用 `.env.production` 配置文件。

或使用进程管理器如 PM2：

```bash
# 设置环境变量后启动
pm2 start dist/main.js --name time-sheet-api --env production

# 或者在启动命令中指定环境变量
pm2 start dist/main.js --name time-sheet-api --node-args="NODE_ENV=production"
```

## 🐛 常见问题

### 数据库连接失败

**问题**：应用启动时无法连接数据库

**解决方案**：

- 检查 `.env` 文件中的数据库配置是否正确
- 确保数据库服务已启动
- 检查防火墙设置
- 验证数据库是否存在（MySQL/PostgreSQL）
- 检查数据库用户权限

### JWT 认证错误

**问题**：API 请求返回 401 Unauthorized

**解决方案**：

- 检查令牌是否过期
- 验证 `JWT_ACCESS_SECRET` 配置正确
- 确保请求头格式：`Authorization: Bearer <token>`
- 尝试使用 `/auth/refresh` 刷新令牌
- 检查令牌是否被篡改

### CORS 错误

**问题**：前端请求被 CORS 策略阻止

**解决方案**：

- 在 `.env` 中将前端 URL 添加到 `CORS_ORIGIN`
- 如果使用 cookies，设置 `CORS_CREDENTIALS=true`
- 开发环境可临时使用 `CORS_ORIGIN=*`
- 生产环境必须指定具体的源地址
- 检查前端请求是否包含正确的 Origin 头

### 端口已被占用

**问题**：错误：端口 8090 已被使用

**解决方案**：

- 在 `.env` 中修改 `PORT` 为其他值
- 停止占用端口 8090 的其他应用
- 查找并终止进程：`npx kill-port 8090`（Windows）
- 或使用：`lsof -ti:8090 | xargs kill`（Linux/macOS）

### TypeORM 同步错误

**问题**：数据库表结构不匹配

**解决方案**：

- 开发环境：设置 `DB_SYNCHRONIZE=true` 自动同步
- 生产环境：使用迁移管理数据库变更
- 备份数据后删除数据库重新创建
- 检查实体定义是否有语法错误

### 依赖安装失败

**问题**：npm install 报错

**解决方案**：

- 清除 npm 缓存：`npm cache clean --force`
- 删除 `node_modules` 和 `package-lock.json`
- 重新安装：`npm install`
- 检查 Node.js 版本是否 >= 18
- 如果 Oracle 驱动安装失败，这是正常的（可选依赖）

## 📄 许可证

本项目采用 [UNLICENSED](LICENSE) 许可。

## 🤝 技术支持

如有问题或疑问：

- 查看 [常见问题](#-常见问题) 章节
- 查阅 [Swagger 文档](http://localhost:8090/api)
- 在 GitHub 上提交 Issue

## 🔗 相关资源

- [NestJS 中文文档](https://docs.nestjs.cn)
- [NestJS 官方文档](https://docs.nestjs.com)
- [TypeORM 文档](https://typeorm.io)
- [Swagger/OpenAPI 规范](https://swagger.io/specification/)
- [JWT 最佳实践](https://tools.ietf.org/html/rfc8725)

## 💡 开发建议

### 首次启动

1. 使用默认的 SQLite 配置快速开始
2. 访问 Swagger 文档了解 API 结构
3. 先创建管理员用户
4. 了解权限系统的工作方式

### 数据库选择

- **开发/测试**：推荐使用 SQLite（零配置）
- **小型项目**：MySQL 或 PostgreSQL
- **企业应用**：PostgreSQL 或 Oracle
- **高性能需求**：PostgreSQL（支持更多高级特性）

### 安全提示

- 定期更新依赖包
- 使用强密码策略
- 启用 HTTPS（生产环境）
- 实施速率限制
- 记录和监控异常访问
- 定期备份数据库

---

**使用 ❤️ 和 NestJS 构建**
