#!/bin/bash

# Скрипт для запуска бэкенда на сервере (Production)
# Использование: ./start-server.sh

cd "$(dirname "$0")"

echo "🚀 Запуск бэкенда MPRO (Production)..."

# Проверяем, что Docker запущен
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker не запущен. Запустите Docker Desktop."
    exit 1
fi

# Используем production compose файл
COMPOSE_FILE="docker-compose.prod.yml"

# Проверяем, существует ли production compose
if [ ! -f "$COMPOSE_FILE" ]; then
    echo "⚠️  $COMPOSE_FILE не найден, используем docker-compose.yml"
    COMPOSE_FILE="docker-compose.yml"
fi

# Останавливаем старые контейнеры (если есть)
docker-compose -f "$COMPOSE_FILE" down

# Запускаем контейнеры
echo "📦 Запуск контейнеров..."
docker-compose -f "$COMPOSE_FILE" up -d

# Ждём, пока бэкенд запустится
echo "⏳ Ожидание запуска бэкенда..."
sleep 15

# Проверяем, что бэкенд отвечает
if curl -f http://localhost:3000/api/docs > /dev/null 2>&1; then
    echo "✅ Бэкенд успешно запущен на http://localhost:3000"
    echo "📚 Swagger доступен: http://localhost:3000/api/docs"
    echo ""
    echo "🌐 Для доступа из интернета настрой Cloudflare Tunnel:"
    echo "   cloudflared tunnel --url http://localhost:3000"
else
    echo "⚠️  Бэкенд запущен, но не отвечает. Проверьте логи:"
    echo "   docker-compose -f $COMPOSE_FILE logs backend"
fi
