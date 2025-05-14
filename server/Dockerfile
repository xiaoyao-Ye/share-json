FROM node:18-alpine as builder

WORKDIR /app
RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/root/.pnpm-store \
  pnpm install --frozen-lockfile

COPY . .

EXPOSE 3000

RUN pnpm run build

CMD ["pnpm", "start:prod"]
