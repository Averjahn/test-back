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

# Создаем директории для загружаемых файлов с правильными правами
# Важно: создаем их до копирования файлов и переключения пользователя
RUN mkdir -p /app/uploads/documents /app/uploads/diary /app/uploads/avatars

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Выдаем права на директории и файлы пользователю nestjs
# Важно: делаем это после копирования файлов, но перед переключением пользователя
RUN chown -R nestjs:nodejs /app/uploads /app/dist /app/node_modules /app/package.json /app/prisma

USER nestjs

EXPOSE 3000

# В production миграции должны применяться отдельно перед запуском
CMD ["npm", "run", "start:prod"]
