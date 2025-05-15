# JSON分享服务器

基于NestJS框架的JSON分享应用后端服务器，提供JSON文件存储、分享和管理功能。

## 功能特点

- 上传JSON文件并生成唯一分享链接
- 设置分享链接的有效期（1天、7天或永久）
- 查看JSON预览和下载原始文件
- 管理用户自己的分享记录
- 删除/使分享失效

## 技术栈

- [TypeScript](https://www.typescriptlang.org/)
- [NestJS](https://nestjs.com/) - 现代化Node.js框架
- [Express](https://expressjs.com/) - Web服务器框架
- [Jest](https://jestjs.io/) - 测试框架
- [Docker](https://www.docker.com/) - 容器化部署
- [pnpm](https://pnpm.io/) - 包管理器

## 环境要求

- Node.js 18+
- pnpm
- Docker (可选，用于容器化部署)

## 环境变量配置

应用支持不同环境的配置。创建以下文件来配置不同环境：

1. `.env` - 默认配置
2. `.env.development` - 开发环境配置 (优先级高于默认配置)
3. `.env.production` - 生产环境配置 (优先级高于默认配置)

## 启动命令

项目提供了多种启动命令，适用于不同的环境和需求：

- `pnpm dev` - 使用开发环境配置启动开发服务器（带热重载）
- `pnpm dev:debug` - 使用开发环境配置启动调试模式
- `pnpm build` - 编译TypeScript代码
- `pnpm start` - 启动服务器（不含热重载）
- `pnpm start:prod` - 使用生产环境配置启动生产服务器

## 代码质量工具

- `pnpm format` - 使用Prettier格式化代码
- `pnpm lint` - 使用ESLint检查并修复代码

## 测试命令

- `pnpm test` - 运行Jest测试
- `pnpm test:watch` - 运行Jest测试，并监视文件变化自动重新测试
- `pnpm test:cov` - 运行Jest测试并生成覆盖率报告
- `pnpm test:debug` - 运行Jest测试调试模式
- `pnpm test:e2e` - 运行端到端测试

## 开发指南

### 安装依赖

```bash
pnpm install
```

### 开发模式运行

```bash
pnpm dev
```

### 构建项目

```bash
pnpm build
```

### 运行生产模式

```bash
pnpm start:prod
```

## Docker部署

### 开发环境

使用Docker Compose启动开发环境：

```bash
pnpm docker:dev
```

### 生产环境

使用Docker Compose启动生产环境：

```bash
pnpm docker:up
```

### 手动构建与运行

```bash
# 构建镜像
docker build -t json-share-server .

# 运行容器
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  -e DB_HOST=your-db-host \
  -e DB_PORT=3306 \
  -e DB_USERNAME=your-db-user \
  -e DB_PASSWORD=your-db-password \
  -e DB_DATABASE=json_share_prod \
  -e JWT_SECRET=your-secret-key \
  -v /path/to/uploads:/app/uploads \
  json-share-server
```

## API文档

### 创建分享

**POST /api/shares**

请求头:

- `X-User-ID`: 用户ID (可选，如未提供将生成新ID)

请求体:

```json
{
  "fileName": "example.json",
  "jsonContent": "{ \"example\": \"data\" }",
  "expiryType": "7days" // 可选值: "1day", "7days", "permanent"
}
```

### 获取分享

**GET /api/shares/:id**

### 获取用户分享列表

**GET /api/shares**

请求头:

- `X-User-ID`: 用户ID (必须)

### 删除分享

**DELETE /api/shares/:id**

请求头:

- `X-User-ID`: 用户ID (必须)

## Git提交规范

项目使用simple-git-hooks和lint-staged确保代码质量：

- 提交前会自动运行代码格式化和代码检查
- 确保提交的代码符合项目的代码风格和质量标准
