# JSON分享服务

这是一个完整的JSON分享服务，允许用户上传JSON文件并生成唯一的分享链接，支持设置链接有效期。

## 项目结构

```
├── client/             # 前端Vue项目
├── server/             # 后端Node.js项目
└── docker-compose.yml  # Docker配置文件
```

## 主要功能

- 上传JSON文件并生成唯一分享链接
- 设置分享链接的有效期（1天、7天或永久）
- JSON预览支持（语法高亮、树状结构、折叠）
- 下载原始JSON文件
- 用户分享管理（查看和删除自己的分享）

## 技术栈

### 前端

- Vue 3 + TypeScript
- Vue Router
- UnoCSS
- Vite

### 后端

- Node.js + TypeScript
- Koa
- TypeORM + MySQL
- Jest/Mocha (测试)

## 快速开始

### 使用Docker启动整个应用

```bash
# 在项目根目录运行
docker-compose up -d
```

### 分别开发前后端

#### 前端开发

```bash
cd client
pnpm install
pnpm dev
```

#### 后端开发

```bash
cd server
npm install
npm run dev
```

## 访问应用

- 前端: http://localhost
- 后端API: http://localhost:3000/api

## 项目文档

更多详细信息，请参阅：

- [前端README](./client/README.md)
- [后端README](./server/README.md)
