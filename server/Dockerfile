FROM node:20-slim AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate \
  && pnpm install --frozen-lockfile

FROM node:20-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable && pnpm build

FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/dist ./dist
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate \
  && pnpm install --prod --frozen-lockfile
EXPOSE 3001
CMD ["node", "dist/main.js"]
