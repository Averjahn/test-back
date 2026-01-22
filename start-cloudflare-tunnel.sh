#!/bin/bash

# Скрипт для запуска Cloudflare Tunnel
# Использование: ./start-cloudflare-tunnel.sh

echo "🌐 Запуск Cloudflare Tunnel..."

# Проверяем, что бэкенд работает
if ! curl -f http://localhost:3000/api/docs > /dev/null 2>&1; then
    echo "❌ Бэкенд не отвечает на http://localhost:3000"
    echo "   Запустите бэкенд сначала: ./start-server.sh"
    exit 1
fi

# Проверяем, что cloudflared установлен
if ! command -v cloudflared &> /dev/null; then
    echo "❌ cloudflared не установлен"
    echo "   Установите: brew install cloudflared"
    exit 1
fi

echo "✅ Бэкенд работает на http://localhost:3000"
echo "🚀 Запускаю Cloudflare Tunnel..."
echo ""
echo "📝 Публичный URL будет показан ниже"
echo "   Запишите его для настройки фронта на Vercel"
echo ""

# Запускаем туннель
cloudflared tunnel --url http://localhost:3000
