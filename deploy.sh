#!/bin/bash

# Скрипт для деплоя бэкенда на Render
# Использование: ./deploy.sh [SERVICE_ID]

set -e

echo "🚀 Деплой бэкенда на Render..."

# Проверяем наличие Render CLI
if ! command -v render &> /dev/null; then
    echo "❌ Render CLI не установлен!"
    echo "Установи через: brew install render"
    echo "Или скачай с: https://github.com/render-oss/cli/releases"
    exit 1
fi

# Проверяем авторизацию
if ! render services &> /dev/null; then
    echo "❌ Не авторизован в Render CLI!"
    echo "Выполни: render login"
    exit 1
fi

# Если передан SERVICE_ID, используем его
if [ -n "$1" ]; then
    SERVICE_ID="$1"
    echo "📦 Используем Service ID: $SERVICE_ID"
else
    echo "📋 Список доступных сервисов:"
    render services --output text
    
    echo ""
    read -p "Введи Service ID для деплоя (или нажми Enter для интерактивного выбора): " SERVICE_ID
    
    if [ -z "$SERVICE_ID" ]; then
        echo "🔄 Запускаем интерактивный выбор..."
        render deploys create
        exit 0
    fi
fi

echo "🔄 Запускаем деплой..."
render deploys create "$SERVICE_ID" --wait

if [ $? -eq 0 ]; then
    echo "✅ Деплой успешно завершён!"
else
    echo "❌ Ошибка при деплое. Проверь логи в Render Dashboard."
    exit 1
fi
