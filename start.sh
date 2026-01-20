#!/bin/bash

# Скрипт для полного запуска бэкенда MPRO
# Использование: ./start.sh [--skip-seed] [--skip-migrations] [--docker]

set -e  # Остановка при ошибке

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Определяем директорию скрипта и переходим в неё
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo -e "${GREEN}🚀 Запуск бэкенда MPRO...${NC}"
echo -e "${YELLOW}📁 Рабочая директория: $SCRIPT_DIR${NC}\n"

# Проверка аргументов
SKIP_SEED=false
SKIP_MIGRATIONS=false
USE_DOCKER=false

for arg in "$@"; do
  case $arg in
    --skip-seed)
      SKIP_SEED=true
      shift
      ;;
    --skip-migrations)
      SKIP_MIGRATIONS=true
      shift
      ;;
    --docker)
      USE_DOCKER=true
      shift
      ;;
  esac
done

# 1. Проверка наличия .env файла
echo -e "${YELLOW}📋 Проверка конфигурации...${NC}"
if [ ! -f .env ]; then
  echo -e "${RED}❌ Файл .env не найден!${NC}"
  if [ -f .env.example ]; then
    echo -e "${YELLOW}📋 Копирую .env.example в .env...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Пожалуйста, отредактируйте .env файл с правильными настройками!${NC}"
    exit 1
  else
    echo -e "${RED}❌ Файл .env.example также не найден!${NC}"
    exit 1
  fi
fi
echo -e "${GREEN}✅ .env файл найден${NC}\n"

# 1.5. Проверка и запуск Docker контейнеров
echo -e "${YELLOW}🐳 Проверка Docker...${NC}"
if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
  # Проверяем, запущен ли PostgreSQL контейнер
  if docker ps | grep -q mpro-postgres; then
    echo -e "${GREEN}✅ PostgreSQL контейнер уже запущен${NC}"
  else
    # Проверяем, существует ли контейнер, но остановлен
    if docker ps -a | grep -q mpro-postgres; then
      echo -e "${YELLOW}🔄 Перезапуск существующего PostgreSQL контейнера...${NC}"
      docker start mpro-postgres
    else
      echo -e "${YELLOW}🐳 Запуск PostgreSQL контейнера...${NC}"
      docker-compose up -d postgres
    fi
    
    # Ждем, пока база данных будет готова
    echo -e "${YELLOW}⏳ Ожидание готовности базы данных (максимум 30 секунд)...${NC}"
    for i in {1..30}; do
      if docker exec mpro-postgres pg_isready -U user &> /dev/null 2>&1; then
        echo -e "${GREEN}✅ База данных готова${NC}"
        break
      fi
      if [ $i -eq 30 ]; then
        echo -e "${RED}❌ База данных не запустилась за 30 секунд${NC}"
        echo -e "${YELLOW}⚠️  Проверьте логи: docker logs mpro-postgres${NC}"
        exit 1
      fi
      sleep 1
      echo -n "."
    done
    echo ""
  fi
else
  echo -e "${YELLOW}⚠️  Docker не установлен или не найден. Продолжаем без Docker...${NC}"
  echo -e "${YELLOW}⚠️  Убедитесь, что PostgreSQL запущен локально на порту 5432${NC}"
fi
echo ""

# 2. Проверка установки зависимостей
echo -e "${YELLOW}📦 Проверка зависимостей...${NC}"
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}📦 Установка зависимостей...${NC}"
  npm install
else
  echo -e "${GREEN}✅ Зависимости установлены${NC}"
fi
echo ""

# 3. Генерация Prisma Client
echo -e "${YELLOW}🔧 Генерация Prisma Client...${NC}"
npm run prisma:generate
echo -e "${GREEN}✅ Prisma Client сгенерирован${NC}\n"

# 4. Применение миграций (если не пропущено)
if [ "$SKIP_MIGRATIONS" = false ]; then
  echo -e "${YELLOW}🗄️  Применение миграций базы данных...${NC}"
  npm run prisma:migrate || {
    echo -e "${YELLOW}⚠️  Миграции уже применены или произошла ошибка${NC}"
  }
  echo -e "${GREEN}✅ Миграции применены${NC}\n"
else
  echo -e "${YELLOW}⏭️  Пропуск миграций (--skip-migrations)${NC}\n"
fi

# 5. Запуск сида (если не пропущено)
if [ "$SKIP_SEED" = false ]; then
  echo -e "${YELLOW}🌱 Заполнение базы данных тестовыми данными...${NC}"
  npm run prisma:seed || {
    echo -e "${YELLOW}⚠️  Сид уже выполнен или произошла ошибка${NC}"
  }
  echo -e "${GREEN}✅ База данных заполнена${NC}\n"
else
  echo -e "${YELLOW}⏭️  Пропуск сида (--skip-seed)${NC}\n"
fi

# 6. Проверка доступности базы данных (через Prisma + адаптер Postgres)
echo -e "${YELLOW}🔍 Проверка подключения к базе данных...${NC}"
node -r dotenv/config -e "
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not defined in environment variables');
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

prisma.\$connect()
  .then(() => {
    console.log('✅ Подключение к базе данных успешно');
    return prisma.\$disconnect().finally(() => pool.end());
  })
  .catch((err) => {
    console.error('❌ Ошибка подключения к базе данных:', err.message);
    pool.end();
    process.exit(1);
  });
" || {
  echo -e "${RED}❌ Не удалось подключиться к базе данных!${NC}"
  echo -e "${YELLOW}⚠️  Убедитесь, что PostgreSQL запущен и DATABASE_URL в .env правильный${NC}"
  exit 1
}
echo ""

# 7. Запуск бэкенда
echo -e "${GREEN}🚀 Запуск бэкенда...${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Бэкенд будет доступен на: http://localhost:3000${NC}"
echo -e "${GREEN}✅ Swagger документация: http://localhost:3000/api/docs${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Запуск в режиме разработки
npm run start:dev
