#!/bin/bash

# Скрипт для импорта базы данных в production контейнер
# Использование: ./import-database.sh <backup_file.sql>

cd "$(dirname "$0")"

if [ -z "$1" ]; then
    echo "❌ Укажите файл backup: ./import-database.sh backup.sql"
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Файл $BACKUP_FILE не найден"
    exit 1
fi

echo "📥 Импорт базы данных из $BACKUP_FILE..."

# Проверяем, что production контейнер запущен
if ! docker ps | grep -q mpro-postgres-prod; then
    echo "⚠️  Production контейнер не запущен, запускаю..."
    docker-compose -f docker-compose.prod.yml up -d postgres
    echo "⏳ Ожидание запуска PostgreSQL..."
    sleep 10
fi

CONTAINER_NAME="mpro-postgres-prod"
DB_NAME="mpro_db"
DB_USER="user"

echo "🔄 Импорт данных..."

# Импортируем backup
cat "$BACKUP_FILE" | docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME"

if [ $? -eq 0 ]; then
    echo "✅ База данных успешно импортирована"
    echo ""
    echo "📊 Проверка таблиц:"
    docker exec -it "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -c "\dt"
else
    echo "❌ Ошибка при импорте"
    exit 1
fi
