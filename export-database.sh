#!/bin/bash

# Скрипт для экспорта базы данных из локального Docker контейнера
# Использование: ./export-database.sh

cd "$(dirname "$0")"

echo "📤 Экспорт базы данных..."

# Проверяем, что контейнер запущен
if ! docker ps | grep -q mpro-postgres; then
    echo "❌ Контейнер PostgreSQL не запущен"
    echo "   Запустите: docker-compose up -d postgres"
    exit 1
fi

# Имя контейнера
CONTAINER_NAME="mpro-postgres"
DB_NAME="mpro_db"
DB_USER="user"

# Создаём backup
BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"

echo "💾 Создание backup: $BACKUP_FILE"

docker exec -t "$CONTAINER_NAME" pg_dump -U "$DB_USER" "$DB_NAME" > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Backup создан: $BACKUP_FILE"
    echo "   Размер: $(du -h "$BACKUP_FILE" | cut -f1)"
else
    echo "❌ Ошибка при создании backup"
    exit 1
fi
