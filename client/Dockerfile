# 构建阶段
FROM node:18-alpine as builder

WORKDIR /app
RUN corepack enable

# 复制依赖文件
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/root/.pnpm-store \
  pnpm install --frozen-lockfile

# 复制所有源代码
COPY . .

# 构建应用
RUN pnpm build

# 生产阶段
FROM nginx:stable-alpine

# 从构建阶段复制构建产物到 nginx 目录
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 nginx 配置文件（如果需要）
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
