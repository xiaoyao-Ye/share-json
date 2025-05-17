FROM node:20-alpine as builder

WORKDIR /app
RUN corepack enable

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY server/package.json ./server/

RUN --mount=type=cache,id=pnpm-store,target=/root/.pnpm-store \
  pnpm install --filter server --frozen-lockfile

COPY server/ ./server/

RUN pnpm run server:build

FROM node:20-alpine as production

WORKDIR /app
RUN corepack enable

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/server/node_modules ./server/node_modules
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/package.json ./server/package.json

EXPOSE 3000

CMD ["pnpm", "server:start"]
