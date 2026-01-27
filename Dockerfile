FROM node:22-alpine AS base

# Установка зависимостей
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Сборка приложения
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Production образ
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Директория для загружаемых файлов (должна быть доступна пользователю nestjs)
RUN mkdir -p /app/uploads/documents /app/uploads/diary \
  && chown -R nestjs:nestjs /app/uploads

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

USER nestjs

EXPOSE 3000

# В production миграции должны применяться отдельно перед запуском
CMD ["npm", "run", "start:prod"]
