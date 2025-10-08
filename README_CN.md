# Time Sheet API - NestJS 后端项目

这是一个使用 NestJS 框架和 SQLite 数据库构建的后端项目。

## 技术栈

- **NestJS** - 渐进式 Node.js 框架
- **TypeORM** - ORM 框架
- **SQLite** - 轻量级数据库
- **TypeScript** - 类型安全的 JavaScript 超集

## 快速开始

### 1. 创建环境变量文件

复制 `.env.example` 文件并重命名为 `.env`：

```bash
copy .env.example .env
```

或手动创建 `.env` 文件，内容如下：

```env
# 数据库配置
DATABASE_PATH=./database.sqlite

# 服务端口
PORT=3000
```

### 2. 安装依赖（如果还没安装）

```bash
npm install
```

### 3. 启动开发服务器

```bash
npm run start:dev
```

服务将在 http://localhost:3000 启动。

## 项目结构

```
time-sheet-api/
├── src/
│   ├── entities/          # 数据库实体
│   │   └── user.entity.ts # 用户实体示例
│   ├── app.module.ts      # 主模块配置
│   ├── app.controller.ts  # 控制器
│   ├── app.service.ts     # 服务
│   └── main.ts           # 应用入口
├── .env                  # 环境变量（需手动创建）
├── .env.example          # 环境变量示例
├── database.sqlite       # SQLite 数据库文件（自动生成）
└── package.json          # 项目依赖
```

## 数据库

项目使用 SQLite 数据库，数据库文件会在首次启动时自动创建在项目根目录下（`database.sqlite`）。

### 实体示例

项目包含一个 `User` 实体示例：

- id: 主键（自增）
- username: 用户名（唯一）
- email: 邮箱
- fullName: 全名（可选）
- createdAt: 创建时间
- updatedAt: 更新时间

### TypeORM 配置

- **synchronize: true** - 开发环境下自动同步数据库结构
- **logging: true** - 开启 SQL 日志

⚠️ **注意**：生产环境请将 `synchronize` 设为 `false`，使用迁移来管理数据库变更。

## 可用命令

```bash
# 开发模式
npm run start:dev

# 生产模式构建
npm run build

# 生产模式启动
npm run start:prod

# 运行测试
npm run test

# 运行 E2E 测试
npm run test:e2e
```

## API 端点

访问 http://localhost:3000 查看默认欢迎页面。

## 下一步

1. 创建更多实体类（如 TimeSheet、Project 等）
2. 创建对应的模块、控制器和服务
3. 实现 CRUD 操作
4. 添加数据验证和错误处理
5. 实现用户认证和授权
6. 连接前端项目

## 相关文档

- [NestJS 文档](https://docs.nestjs.com/)
- [TypeORM 文档](https://typeorm.io/)
- [SQLite 文档](https://www.sqlite.org/docs.html)
