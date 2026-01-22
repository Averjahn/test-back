# Настройка Cloudflare Tunnel для постоянного доступа к бэкенду

## Обзор

Этот гайд поможет настроить постоянный доступ к твоему бэкенду через Cloudflare Tunnel, чтобы фронт на Vercel мог обращаться к API, работающему на твоём компьютере.

---

## Шаг 1. Экспорт локальной базы данных

### 1.1. Экспорт данных из локальной PostgreSQL

Если у тебя локальная БД работает (не в Docker), экспортируй данные:

```bash
# Экспорт всей базы
pg_dump -U user -d mpro_db > backup.sql

# Или если используешь локальный PostgreSQL
pg_dump -h localhost -U postgres -d mpro_db > backup.sql
```

Если БД в Docker:

```bash
# Найди контейнер с PostgreSQL
docker ps | grep postgres

# Экспорт из контейнера
docker exec -t mpro-postgres pg_dump -U user mpro_db > backup.sql
```

---

## Шаг 2. Настройка Docker Compose для продакшена

### 2.1. Обнови `docker-compose.yml` для продакшена

Создай `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: mpro-postgres-prod
    restart: unless-stopped
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: mpro_db
    volumes:
      - postgres_data_prod:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user"]
      interval: 10s
      timeout: 5s
      retries: 5
    # НЕ открываем порт 5432 наружу для безопасности
    # ports:
    #   - "5432:5432"

  backend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: mpro-backend-prod
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://user:password@postgres:5432/mpro_db?schema=public
      JWT_SECRET: ${JWT_SECRET:-change-this-to-a-strong-secret}
      NODE_ENV: production
      PORT: 3000
    depends_on:
      postgres:
        condition: service_healthy
    command: sh -c "npx prisma generate && npx prisma migrate deploy && npm run start:prod"

volumes:
  postgres_data_prod:
```

---

## Шаг 3. Импорт базы данных в Docker

### 3.1. Запусти PostgreSQL контейнер

```bash
cd /Users/user/mpro-project/backend

# Запусти только PostgreSQL
docker-compose -f docker-compose.prod.yml up -d postgres

# Подожди, пока БД запустится
sleep 5
```

### 3.2. Импортируй данные

```bash
# Импорт из backup.sql
docker exec -i mpro-postgres-prod psql -U user -d mpro_db < backup.sql

# Или если backup.sql большой, используй:
cat backup.sql | docker exec -i mpro-postgres-prod psql -U user -d mpro_db
```

### 3.3. Проверь импорт

```bash
docker exec -it mpro-postgres-prod psql -U user -d mpro_db -c "\dt"
```

Должны быть видны все таблицы.

---

## Шаг 4. Настройка Cloudflare Tunnel (постоянный доступ)

### 4.1. Установка Cloudflare Tunnel

```bash
# macOS
brew install cloudflared

# Или скачай с https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/
```

### 4.2. Авторизация в Cloudflare

```bash
cloudflared tunnel login
```

Откроется браузер — авторизуйся через Cloudflare аккаунт.

### 4.3. Создание туннеля

```bash
# Создай туннель с именем
cloudflared tunnel create mpro-backend

# Создай конфиг файл
mkdir -p ~/.cloudflared
```

Создай файл `~/.cloudflared/config.yml`:

```yaml
tunnel: <TUNNEL_ID>
credentials-file: /Users/user/.cloudflared/<TUNNEL_ID>.json

ingress:
  - hostname: mpro-backend.yourdomain.com  # Замени на свой домен
    service: http://localhost:3000
  - service: http_status:404
```

**Если нет своего домена**, используй временный туннель:

```bash
# Запуск без конфига (временный URL)
cloudflared tunnel --url http://localhost:3000
```

### 4.4. Настройка DNS (если есть свой домен)

```bash
# Создай DNS запись
cloudflared tunnel route dns mpro-backend mpro-backend.yourdomain.com
```

---

## Шаг 5. Автозапуск Cloudflare Tunnel

### 5.1. Создай LaunchAgent для Cloudflare Tunnel

Создай `~/Library/LaunchAgents/com.cloudflare.tunnel.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.cloudflare.tunnel</string>
    
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/cloudflared</string>
        <string>tunnel</string>
        <string>--url</string>
        <string>http://localhost:3000</string>
    </array>
    
    <key>RunAtLoad</key>
    <true/>
    
    <key>KeepAlive</key>
    <true/>
    
    <key>StandardOutPath</key>
    <string>/Users/user/mpro-project/backend/logs/cloudflared.log</string>
    
    <key>StandardErrorPath</key>
    <string>/Users/user/mpro-project/backend/logs/cloudflared-error.log</string>
</dict>
</plist>
```

### 5.2. Загрузи сервис

```bash
launchctl load ~/Library/LaunchAgents/com.cloudflare.tunnel.plist
launchctl start com.cloudflare.tunnel
```

---

## Шаг 6. Обновление CORS для Cloudflare

CORS уже настроен в `main.ts` для поддержки Cloudflare Tunnel.

---

## Шаг 7. Настройка фронта на Vercel

В проекте `front-platform` → **Environment Variables**:

```env
VITE_API_BASE_URL=https://mpro-backend.yourdomain.com/api
```

(или временный URL от Cloudflare, если нет домена)

---

## Шаг 8. Обновлённый скрипт запуска

Обнови `start-server.sh` для продакшена:

```bash
#!/bin/bash

cd "$(dirname "$0")"

echo "🚀 Запуск бэкенда MPRO (Production)..."

# Проверяем Docker
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker не запущен"
    exit 1
fi

# Останавливаем старые контейнеры
docker-compose -f docker-compose.prod.yml down

# Запускаем
docker-compose -f docker-compose.prod.yml up -d

# Ждём запуска
sleep 10

# Проверка
if curl -f http://localhost:3000/api/docs > /dev/null 2>&1; then
    echo "✅ Бэкенд запущен на http://localhost:3000"
else
    echo "⚠️  Проверьте логи: docker-compose -f docker-compose.prod.yml logs backend"
fi
```

---

## Проверка

1. **Локально**: `curl http://localhost:3000/api/docs`
2. **Через Cloudflare**: `curl https://mpro-backend.yourdomain.com/api/docs`
3. **Из фронта**: попробуй логин на Vercel

---

## Troubleshooting

### БД не импортируется

```bash
# Проверь формат backup.sql
head -20 backup.sql

# Попробуй импорт через psql напрямую
docker exec -it mpro-postgres-prod psql -U user -d mpro_db
# Затем в psql:
\i /path/to/backup.sql
```

### Cloudflare Tunnel не работает

```bash
# Проверь логи
tail -f ~/Library/LaunchAgents/com.cloudflare.tunnel.plist

# Перезапусти
launchctl stop com.cloudflare.tunnel
launchctl start com.cloudflare.tunnel
```

### CORS ошибки

Убедись, что в `main.ts` есть:
```typescript
if (origin.includes('cloudflare.com') || origin.includes('trycloudflare.com')) {
  return callback(null, true);
}
```
