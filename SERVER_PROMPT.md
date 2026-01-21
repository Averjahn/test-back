# Промпт для настройки компьютера как сервера бэкенда MPRO

## Контекст

У меня есть NestJS бэкенд с Prisma и PostgreSQL, который нужно запустить на моём компьютере (macOS) и сделать доступным из интернета. Бэкенд должен автоматически запускаться при загрузке системы.

## Структура проекта

- **Backend**: NestJS + Prisma + PostgreSQL
- **Docker Compose**: уже настроен (`docker-compose.yml`)
- **Порт**: 3000
- **База данных**: PostgreSQL в Docker контейнере

## Задачи

1. ✅ Создать скрипт для запуска бэкенда (`start-server.sh`)
2. ✅ Настроить автозапуск через LaunchAgent (macOS)
3. ✅ Настроить доступ из интернета через туннель или порт-форвардинг
4. ✅ Обновить CORS для работы с внешними доменами
5. ✅ Создать документацию по настройке

## Что уже сделано

- ✅ Создан `start-server.sh` для запуска через Docker Compose
- ✅ Создан `com.timeweb.mpro-backend.plist` для автозапуска на macOS
- ✅ Обновлён CORS в `main.ts` для поддержки туннелей (tuna, cloudflare, ngrok)
- ✅ Создана документация `SERVER_SETUP.md`

## Следующие шаги

### 1. Установка и запуск

```bash
cd /Users/user/mpro-project/backend

# Сделай скрипт исполняемым
chmod +x start-server.sh

# Запусти бэкенд
./start-server.sh
```

### 2. Настройка автозапуска

```bash
# Создай папку для логов
mkdir -p logs

# Установи LaunchAgent
cp com.timeweb.mpro-backend.plist ~/Library/LaunchAgents/

# Загрузи сервис
launchctl load ~/Library/LaunchAgents/com.timeweb.mpro-backend.plist

# Запусти сразу
launchctl start com.timeweb.mpro-backend
```

### 3. Настройка доступа из интернета

#### Вариант A: Туннель (быстро)

**Tuna:**
```bash
brew install tuna-edge/tuna/tuna
tuna login
tuna http 3000
```

**Cloudflare Tunnel:**
```bash
brew install cloudflared
cloudflared tunnel --url http://localhost:3000
```

#### Вариант B: Прямой доступ через роутер

1. Узнай локальный IP:
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```

2. Настрой порт-форвардинг на роутере:
   - Внешний порт: `3000` (или другой)
   - Внутренний IP: IP твоего компьютера
   - Внутренний порт: `3000`
   - Протокол: TCP

3. Узнай внешний IP:
   ```bash
   curl ifconfig.me
   ```

### 4. Настройка фронта на Vercel

В проекте `front-platform` → **Environment Variables**:

```env
VITE_API_BASE_URL=https://xxxxx.tuna.am/api
```

(или `http://ТВОЙ_ВНЕШНИЙ_IP:3000/api`)

### 5. Проверка

```bash
# Локально
curl http://localhost:3000/api/docs

# Из интернета (если настроен туннель)
curl https://xxxxx.tuna.am/api/docs
```

## Управление

### Запуск вручную
```bash
./start-server.sh
```

### Остановка
```bash
docker-compose down
```

### Просмотр логов
```bash
docker-compose logs -f backend
```

### Перезапуск сервиса
```bash
launchctl stop com.timeweb.mpro-backend
launchctl start com.timeweb.mpro-backend
```

## Важно

⚠️ **Безопасность**:
- Используй сильный `JWT_SECRET` в `.env`
- Не открывай порт 5432 (PostgreSQL) наружу
- Рассмотри использование HTTPS

⚠️ **Стабильность**:
- Компьютер должен быть всегда включен
- Настрой автозапуск Docker Desktop
- Используй UPS для защиты от отключений

## Troubleshooting

### Бэкенд не запускается
```bash
docker-compose logs backend
```

### Сервис не стартует автоматически
```bash
launchctl list | grep mpro-backend
tail -f logs/launchd.log
```

### Порт занят
```bash
lsof -i :3000
```
