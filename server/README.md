# JSON分享服务器

这是JSON分享应用的后端服务器部分。

## 环境变量配置

应用支持不同环境的配置。创建以下文件来配置不同环境：

1. `.env` - 默认配置
2. `.env.development` - 开发环境配置 (优先级高于默认配置)
3. `.env.production` - 生产环境配置 (优先级高于默认配置)

### 开发环境示例 (.env.development)

```
# 服务器配置
PORT=3000
NODE_ENV=development

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=password
DB_DATABASE=json_share_dev

# 文件上传配置
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=15000000  # 15MB

# 分享链接配置
BASE_URL=http://localhost:3000
JWT_SECRET=dev_secret_key
```

### 生产环境示例 (.env.production)

```
# 服务器配置
PORT=3000
NODE_ENV=production

# 数据库配置
DB_HOST=mysql
DB_PORT=3306
DB_USERNAME=production_user
DB_PASSWORD=strong_password
DB_DATABASE=json_share_prod

# 文件上传配置
UPLOAD_DIR=/app/uploads
MAX_FILE_SIZE=15000000  # 15MB

# 分享链接配置
BASE_URL=https://jsonshare.example.com
JWT_SECRET=production_secret_key
```

## 启动命令

项目提供了多种启动命令，适用于不同的环境和需求：

- `npm run dev` - 使用开发环境配置启动开发服务器
- `npm run dev:watch` - 使用开发环境配置启动开发服务器，并监视文件变化自动重启
- `npm run build` - 编译TypeScript代码为JavaScript
- `npm run watch` - 监视文件变化，自动编译TypeScript代码
- `npm start` - 启动生产服务器（需要先运行`npm run build`）
- `npm run start:prod` - 使用生产环境配置启动生产服务器（需要先运行`npm run build`）

## 测试命令

- `npm test` - 运行Jest测试
- `npm run test:watch` - 运行Jest测试，并监视文件变化自动重新测试
- `npm run test:mocha` - 使用Mocha框架运行测试

## 功能

- 上传JSON文件并生成唯一分享链接
- 设置分享链接的有效期（1天、7天或永久）
- 查看JSON预览和下载原始文件
- 管理用户自己的分享记录
- 删除/使分享失效

## 技术栈

- TypeScript
- Koa.js
- TypeORM
- MySQL
- Jest/Mocha (测试)
- Docker

## 开发指南

### 环境要求

- Node.js 16+
- MySQL 8.0+

### 安装依赖

```bash
npm install
```

### 配置环境变量

复制`.env.example`为需要的环境变量文件：

```bash
# 默认配置
cp .env.example .env

# 开发环境配置
cp .env.example .env.development

# 生产环境配置
cp .env.example .env.production
```

然后根据需要修改各个环境的配置。

### 开发模式运行

```bash
npm run dev
```

### 构建项目

```bash
npm run build
```

### 运行生产模式

```bash
npm run start:prod
```

### 运行测试

```bash
npm test
```

## Docker部署

### 使用Docker部署

#### 生产环境

```bash
# 构建镜像
docker build -t json-share-server .

# 运行容器
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e DB_HOST=your-db-host \
  -e DB_USERNAME=your-db-user \
  -e DB_PASSWORD=your-db-password \
  -e DB_DATABASE=json_share_prod \
  -e JWT_SECRET=your-secret-key \
  -v /path/to/uploads:/app/uploads \
  json-share-server
```

#### 开发环境

```bash
# 构建开发镜像
docker build -t json-share-server-dev -f Dockerfile.dev .

# 运行开发容器
docker run -p 3000:3000 \
  -v $(pwd):/app \
  -v /app/node_modules \
  json-share-server-dev
```

### 使用Docker Compose部署

#### 生产环境

在项目根目录下运行:

```bash
docker-compose up -d
```

#### 开发环境

在服务器目录下运行:

```bash
docker-compose -f docker-compose.dev.yml up -d
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
