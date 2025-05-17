# JSON分享服务

## 项目简介

这是一个具备管理功能的高级JSON分享服务，允许用户上传、分享和管理JSON数据。用户可以上传JSON文件，生成带有效期的分享链接，查看和管理自己的分享记录。系统支持JSON文件的高级预览功能，包括语法高亮和可折叠树状视图，并使用流式传输进行了性能优化。

### 基本架构概述

项目采用前后端分离架构：

- **前端**：使用Vue 3 + Vite构建，使用shadcn/vue负责用户界面交互
- **后端**：基于NestJS框架构建的RESTful API服务
- **数据库**：MySQL数据库，存储用户、文件和分享信息
- **部署**：使用Docker和Docker Compose进行容器化部署

系统架构图：

```
用户 → 前端(Vue 3) → 后端(NestJS) → 数据库(MySQL)
                      ↓
                    文件存储
```

## 技术栈列表

### 前端

- **核心框架**：Vue 3.4.x (Composition API)
- **构建工具**：Vite 5.x
- **类型支持**：TypeScript 5.x
- **路由**：Vue Router 4.x
- **UI组件**：
  - shadcn/vue (基于Radix Vue和Tailwind CSS)
  - lucide-vue-next (图标)
  - vue-json-pretty (JSON渲染)
- **HTTP客户端**：Axios 1.x
- **工具库**：
  - uuid (客户端唯一标识)

### 后端

- **核心框架**：NestJS 10.x
- **语言**：TypeScript 5.x
- **ORM**：TypeORM 0.3.x
- **数据库**：MySQL 8.0
- **API文档**：Swagger (OpenAPI)
- **文件上传**：multer
- **工具库**：
  - uuid (唯一ID生成)
  - nanoid (分享码生成)
  - class-validator & class-transformer (请求验证与转换)

### 容器化与部署

- Docker
- Docker Compose

### 测试

- Jest

## 数据库Schema设计

数据库使用MySQL，共设计三张核心表：

- `users`：用户信息表
- `json_files`：JSON 文件元数据表
- `shares`：文件分享记录表

## 1. 用户表 `users`

用于存储用户信息，主要识别上传或分享行为的归属用户。

### 字段说明

| 字段名       | 类型        | 说明                             |
| ------------ | ----------- | -------------------------------- |
| `id`         | VARCHAR(36) | 服务端生成的用户唯一标识，主键   |
| `uuid`       | VARCHAR(36) | 客户端生成的唯一标识（便于去重） |
| `created_at` | TIMESTAMP   | 创建时间，默认当前时间           |
| `updated_at` | TIMESTAMP   | 更新时间，自动随更新刷新         |

## 2. JSON 文件表 `json_files`

用于记录上传的 JSON 文件元数据，包括文件名、路径、大小等。

### 字段说明

| 字段名       | 类型         | 说明                     |
| ------------ | ------------ | ------------------------ |
| `id`         | VARCHAR(36)  | 文件唯一标识，主键       |
| `file_name`  | VARCHAR(255) | 原始文件名               |
| `file_path`  | VARCHAR(255) | 文件在服务器上的存储路径 |
| `file_size`  | INT          | 文件大小，单位为字节     |
| `created_at` | TIMESTAMP    | 上传时间，默认当前时间   |
| `updated_at` | TIMESTAMP    | 更新时间，自动随更新刷新 |

## 3. 分享表 `shares`

用于管理 JSON 文件的分享记录，包括分享码、分享状态和过期时间等。

### 字段说明

| 字段名         | 类型        | 说明                                    |
| -------------- | ----------- | --------------------------------------- |
| `id`           | VARCHAR(36) | 分享记录唯一 ID，主键                   |
| `share_code`   | VARCHAR(16) | 用于生成分享链接的短码                  |
| `user_id`      | VARCHAR(36) | 分享发起者 ID（关联 `users.id`）        |
| `json_file_id` | VARCHAR(36) | 被分享的文件 ID（关联 `json_files.id`） |
| `expires_at`   | TIMESTAMP   | 分享过期时间，NULL 表示永久有效         |
| `status`       | TINYINT     | 分享状态（1-有效，0-无效）              |
| `created_at`   | TIMESTAMP   | 创建时间                                |
| `updated_at`   | TIMESTAMP   | 更新时间                                |

### 实体关系

- 一个用户可以拥有多个分享记录 (一对多)
- 一个JSON文件可以被多次分享 (一对多)
- 每个分享记录对应一个用户和一个JSON文件

## 用户标识简化方案

为简化用户认证流程，系统采用了基于客户端生成UUID的用户标识方案：

1. **客户端生成与存储**：

   - 用户首次访问网站时，前端应用在localStorage中生成并存储一个唯一的UUID
   - 代码实现位于 `client/src/lib/user-utils.ts`：

   ```typescript
   export function getUserId(): string {
     const storageKey = 'json-share-user-id'
     let userId = localStorage.getItem(storageKey)
     if (!userId) {
       userId = uuidv4()
       localStorage.setItem(storageKey, userId)
     }
     return userId
   }
   ```

2. **请求头传递**：

   - 前端在每次API请求中，通过自定义请求头 `X-User-ID` 将UUID传递给后端
   - 通过Axios拦截器实现：

   ```typescript
   apiClient.interceptors.request.use((config) => {
     config.headers = config.headers || {}
     const userId = getUserId()
     config.headers['X-User-ID'] = userId
     return config
   })
   ```

3. **后端识别**：

   - 后端接收到带有 `X-User-ID` 头的请求后，查找或创建对应的用户记录
   - 核心实现位于 `server/src/modules/users/users.service.ts`：

   ```typescript
   async getOrCreateUser(uuid: string): Promise<User> {
     let user = await this.usersRepository.findOne({ where: { uuid } })
     if (!user) {
       user = this.usersRepository.create({
         id: uuidv4(),
         uuid,
       })
       await this.usersRepository.save(user)
     }
     return user
   }
   ```

4. **权限控制**：
   - 用户只能查看和操作自己创建的分享记录
   - 后端通过`uuid`识别用户并过滤数据

这种方案虽然没有实现完整的用户认证系统，但满足了简单的用户标识和权限控制需求，且对用户友好（无需注册登录）。

## 本地开发环境设置

### 前置要求

- Node.js 20+
- pnpm 10+
- MySQL 8.0
- Docker 和 Docker Compose

### 安装依赖

项目使用pnpm工作区管理多包结构：

```bash
# 安装所有依赖
pnpm install
```

### 配置环境变量

1. 在server目录下创建`.env.development`文件：

```
# 应用配置
PORT=3000
NODE_ENV=development

# 数据库配置
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USERNAME=root
MYSQL_PASSWORD=your_password
MYSQL_ROOT_PASSWORD=your_password
MYSQL_DATABASE=json_share
MYSQL_SYNCHRONIZE=true  # 开发环境自动同步数据库结构

# Swagger配置
SWAGGER_ENABLE=true
SWAGGER_TITLE=JSON分享服务API
SWAGGER_DESC=JSON分享服务API文档
SWAGGER_PATH=docs
SWAGGER_VERSION=1.0.0
```

### 数据库初始化

开发环境无需初始化数据库，TypeORM会自动同步实体。

生产环境 docker compose 启动时会执行 `db/init.sql` 初始化数据库。

### 启动开发服务

```bash
# 启动数据库服务
pnpm mysql:dev

# 启动后端开发服务
pnpm server:dev

# 启动前端开发服务
pnpm client:dev

# 停止mysql服务
pnpm mysql:stop
```

前端服务将运行在 http://localhost:3333
后端服务将运行在 http://localhost:3000

## 通过Docker Compose运行应用

项目支持使用Docker Compose进行容器化部署：

1. 在 client 目录下创建`.env.production`文件：

```
# 后端服务器地址 + /api/v1
VITE_API_URL=http://localhost:3000/api/v1
```

2. 在 server 目录下创建`.env.production`文件：

```
# 应用配置
PORT=3000
NODE_ENV=production

# 数据库配置
MYSQL_HOST=db
MYSQL_PORT=3306
MYSQL_DATABASE=share_json
MYSQL_USERNAME=root
MYSQL_PASSWORD=root
MYSQL_ROOT_PASSWORD=root
MYSQL_SYNCHRONIZE=false # 生产环境不自动同步
```

3. 构建并启动容器：

```bash
# 启动所有服务
pnpm docker:up # or docker compose up -d
# 停止所有服务
pnpm docker:stop # or docker compose stop
# 删除所有服务
pnpm docker:down # or docker compose down
```

服务将在以下地址可用：

- 前端：http://localhost (端口80)
- 后端：http://localhost:3000
- Swagger API文档：http://localhost:3000/api

## 运行测试

项目使用Jest进行测试。

```bash
# 运行后端测试
pnpm server:test

# 运行测试覆盖率报告
pnpm server:test:cov
```

## JSON预览性能优化方案

本项目采用了以下策略来优化性能：

### 1. Web Worker实现并行处理

- 使用Web Worker在单独线程解析JSON数据，避免阻塞主线程
- 实现位于 `client/src/workers/json-parser.worker.ts`
- 主线程和Worker线程间通过消息传递进行通信

### 2. 流式数据处理

- 采用流式(Stream)方式获取和处理JSON数据
- 边下载边解析，减少内存压力
- 实时向主线程报告下载和解析进度

### 3. 虚拟化列表渲染

- 使用 `vue-json-pretty` 组件的虚拟滚动功能
- 只渲染视口可见的JSON节点，大幅减少DOM节点数量

### 4. 懒加载与状态跟踪

- 实现JSON树的延迟展开，默认只展开第一层节点
- 提供展开/折叠全部的控制按钮
- 使用进度条显示文件的加载进度

### 5. 分离下载与预览

- 对于JSON文件，提供"直接下载"选项
- 在流加载过程中，提示用户可以选择下载而非在线预览

## AI 使用记录

1. 使用的 AI 工具清单
   - v0.dev — 设计前端页面
   - ChatGPT — 作为主要协作与辅助设计工具
   - Cursor — 编写代码

## 2. 使用 AI 辅助的模块/环节

| 模块                  | 使用说明                                                                  | 工具           |
| --------------------- | ------------------------------------------------------------------------- | -------------- |
| ✅ 整理用户需求       | 根据用户需求整理创建需求文档,根据需求文档生成开发文档                     | ChatGPT        |
| ✅ 任务拆分           | 让gpt根据需求文档和开发文档拆分任务便于cursor生成代码                     | ChatGPT        |
| ✅ UI 设计            | 根据需求文档使用 v0.dev 生成前端页面结构和样式风格                        | v0.dev         |
| ✅ 搭建前端项目       | 根据开发文档的技术选型，搭建前端项目结构                                  | Cursor         |
| ✅ 搭建后端项目       | 根据开发文档的技术选型，搭建后端项目结构                                  | Cursor         |
| ✅ 前端页面开发       | 下载 v0.dev 的 React 代码 让 Cursor 转换为 vue版本                        | Cursor         |
| ✅ 数据库 Schema 设计 | 设计数据库 Schema，包括表结构、字段命名                                   | ChatGPT/Cursor |
| ✅ 后端 API 设计      | 设计后端 API 路由结构，包括上传、预览、生成链接、删除、我的分享等接口定义 | ChatGPT/Cursor |
| ✅ 后端测试           | API 单元测试、以及根据测试重构代码                                        | Cursor         |
| ✅ 前后端对接         | 让 Cursor 根据需求文档和项目代码制定对接计划 按计划进行对接               | Cursor         |
| ✅ 文件传输优化       | 使用流式传输优化文件传输性能                                              | Cursor         |
| ✅ README 编写        | 让 ChatGPT 根据聊天记录生成 README 文档                                   | ChatGPT        |
| ✅ 部署               | 让 ChatGPT 生成基础 docker 部署文件                                       | ChatGPT        |
| ✅ 解决疑难问题       | 让 Cursor 根据错误提示解决问题, 部分问题需要 ChatGPT 辅助解决             | Cursor/ChatGPT |

## 3. 与 AI 交互过程与核心 Prompt

让 ChatGPT 进行任务拆分:

```
根据需求文档和开发文档，进行任务的拆分。拆分出来的步骤要求能够使用cursor等ai编程工具直接进行开发
```

让 v0.dev 根据需求设计 UI， 让 ChatGPT 生成 v0.dev 的提示词:

```
一个上传 JSON 文件的区域，支持拖拽或点击选择，上传成功后生成一个唯一的分享链接，用户可以选择链接的有效期（1天、7天、永久）。

生成链接后，展示该链接并提供“复制链接”按钮。

JSON 预览页面需支持语法高亮和可折叠树状结构展示，同时支持下载原始 JSON 文件。若链接过期，显示提示信息。

一个“我的分享”页面，展示当前用户创建的所有分享记录，包括链接、创建时间、有效期，并支持删除链接。

删除需要有确认提示框。

用户无需登录，使用 LocalStorage 存储 UUID，所有请求带上 X-User-ID 头部。

请使用现代风格的 UI（shadcn/vue），支持 Tailwind，UI风格蓝色，支持移动端（手机/ipad）响应式。

后端接口部分使用 mock api 数据

## 技术实现

- 使用 Next.js App Router 构建现代化 Web 应用
- 采用 Tailwind CSS 进行响应式设计
- 使用 shadcn/ui 组件库提供现代化 UI 体验
- 完全支持移动端响应式布局
- 使用 LocalStorage 存储用户数据和分享记录
```

## 4. 评估与修改说明

- 快速搭建框架代码、规范统一风格、减少重复劳动。
- **局限与挑战：**
  - 对于复杂业务逻辑，AI 的实现往往过于简化，仍需我自行调优与完善。
  - 文档描述冗余较多，需自行删减、整理，才能达到提交标准。
  - 多工具切换（ChatGPT、v0.dev、Cursor）时需我手动衔接上下文。

> 总体来看，AI 是个不错的「开发拍档」，适合我主导、AI 辅助产出，再由我修订验证的协作模式。

## 5. AI 使用心得

- 能够大量减少重复性工作，提高开发效率。
- 能够让 AI 提供设计思路，减少头脑风暴时间。
- 上下文记忆能力有限，最好把需求拆分到足够小，限制 AI 的天马行空。
- 每次做下一个任务时，索引任务需求让 AI 知道整体在做什么，然后做具体需求。
- 生成过的代码被人工修改后，下次让 AI 写代码会把刚修正的代码改回它生成的代码，最好强调让 AI 生成之前查看一下实际代码。或者重新索引项目。
- 使用 Ask 制定任务，反复确认后再使用 Agent 生成代码。
- 尽量给 AI 提供足够详细的描述或者上下文，才能得到更准确的输出。
- AI 只是辅助, 需要人工审核确认。
