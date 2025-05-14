# JSON分享服务 - 后端

这是一个基于Node.js、Koa、TypeORM和MySQL的JSON分享服务后端，允许用户上传JSON文件并生成分享链接。

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

复制`.env.example`为`.env`并根据需要修改配置：

```bash
cp .env.example .env
```

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
npm start
```

### 运行测试

```bash
npm test
```

## Docker部署

### 单独部署后端

```bash
# 在server目录下运行
docker build -t json-share-server .
docker run -p 3000:3000 json-share-server
```

### 与前端一起使用Docker Compose部署

```bash
# 在项目根目录运行
docker-compose up -d
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
