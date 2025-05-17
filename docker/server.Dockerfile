FROM node:18-alpine as builder

WORKDIR /app
RUN corepack enable

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY server/package.json ./server/

RUN --mount=type=cache,id=pnpm-store,target=/root/.pnpm-store \
  pnpm install --filter server --frozen-lockfile

COPY server/ ./server/

EXPOSE 3000

RUN pnpm run server:build

CMD ["pnpm", "server:start"]
