# Настройка компьютера как сервера для бэкенда MPRO

## Шаг 1. Подготовка

### 1.1. Убедись, что Docker Desktop установлен и запущен

```bash
docker --version
docker-compose --version
```

Если нет — установи Docker Desktop для macOS: https://www.docker.com/products/docker-desktop

### 1.2. Настрой переменные окружения

Создай файл `backend/.env` (если ещё нет):

```env
DATABASE_URL=postgresql://user:password@postgres:5432/mpro_db?schema=public
JWT_SECRET=твой_длинный_секрет_минимум_32_символа
NODE_ENV=production
PORT=3000
```

---

## Шаг 2. Автозапуск при загрузке системы (macOS)

### 2.1. Создай папку для логов

```bash
mkdir -p /Users/user/mpro-project/backend/logs
```

### 2.2. Установи LaunchAgent для автозапуска

```bash
# Скопируй plist файл в LaunchAgents
cp /Users/user/mpro-project/backend/com.timeweb.mpro-backend.plist ~/Library/LaunchAgents/

# Загрузи сервис
launchctl load ~/Library/LaunchAgents/com.timeweb.mpro-backend.plist

# Запусти сразу (не дожидаясь перезагрузки)
launchctl start com.timeweb.mpro-backend
```

### 2.3. Проверь статус

```bash
launchctl list | grep mpro-backend
```

Если видишь запись — сервис загружен.

### 2.4. Просмотр логов

```bash
tail -f /Users/user/mpro-project/backend/logs/launchd.log
```

---

## Шаг 3. Настройка доступа из интернета

### Вариант A: Туннель (быстро, но URL меняется)

#### Tuna:

```bash
# Установка (если ещё нет)
brew install tuna-edge/tuna/tuna

# Логин (один раз)
tuna login

# Запуск туннеля (держи терминал открытым)
tuna http 3000
```

#### Cloudflare Tunnel:

```bash
# Установка
brew install cloudflared

# Запуск туннеля
cloudflared tunnel --url http://localhost:3000
```

**Минус**: URL меняется при перезапуске туннеля.

---

### Вариант B: Прямой доступ через роутер (постоянный IP)

#### 3.1. Узнай локальный IP компьютера

```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

Запиши IP (например, `192.168.1.100`).

#### 3.2. Настрой порт-форвардинг на роутере

1. Зайди в настройки роутера (обычно `192.168.1.1` или `192.168.0.1`).
2. Найди раздел **Port Forwarding** / **Виртуальные серверы**.
3. Добавь правило:
   - **Внешний порт**: `3000` (или другой, например `8080`)
   - **Внутренний IP**: IP твоего компьютера (из шага 3.1)
   - **Внутренний порт**: `3000`
   - **Протокол**: TCP

#### 3.3. Узнай внешний IP

```bash
curl ifconfig.me
```

Или зайди на https://whatismyipaddress.com

#### 3.4. Обнови CORS в `main.ts`

Добавь свой внешний IP или домен в CORS (если используешь домен).

---

## Шаг 4. Настройка firewall (macOS)

### 4.1. Разреши входящие подключения на порт 3000

```bash
# Разрешить входящие подключения на порт 3000
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /usr/bin/node
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --unblockapp /usr/bin/node
```

Или через **Системные настройки → Защита и безопасность → Брандмауэр**:
- Разреши входящие подключения для Docker/Node.js

---

## Шаг 5. Проверка работы

### 5.1. Локально

```bash
curl http://localhost:3000/api/docs
```

Должен вернуться HTML Swagger.

### 5.2. Из интернета

Если настроил туннель:
```bash
curl https://xxxxx.tuna.am/api/docs
```

Если настроил порт-форвардинг:
```bash
curl http://ТВОЙ_ВНЕШНИЙ_IP:3000/api/docs
```

---

## Шаг 6. Настройка фронта на Vercel

В проекте `front-platform` → **Environment Variables**:

```env
VITE_API_BASE_URL=https://xxxxx.tuna.am/api
```

(или `http://ТВОЙ_ВНЕШНИЙ_IP:3000/api`, если используешь прямой доступ)

---

## Управление сервисом

### Запуск вручную

```bash
cd /Users/user/mpro-project/backend
./start-server.sh
```

### Остановка

```bash
cd /Users/user/mpro-project/backend
docker-compose down
```

### Просмотр логов

```bash
# Логи бэкенда
docker-compose logs -f backend

# Логи PostgreSQL
docker-compose logs -f postgres
```

### Перезапуск сервиса

```bash
launchctl stop com.timeweb.mpro-backend
launchctl start com.timeweb.mpro-backend
```

### Отключение автозапуска

```bash
launchctl unload ~/Library/LaunchAgents/com.timeweb.mpro-backend.plist
```

---

## Важные замечания

⚠️ **Безопасность**:
- Используй сильный `JWT_SECRET`
- Не открывай порт 5432 (PostgreSQL) наружу
- Рассмотри использование HTTPS (через reverse proxy типа nginx)

⚠️ **Стабильность**:
- Компьютер должен быть всегда включен
- Настрой автозапуск Docker Desktop при загрузке системы
- Используй UPS (источник бесперебойного питания) для защиты от отключений

⚠️ **Производительность**:
- Убедись, что у компьютера достаточно RAM (минимум 4GB свободно)
- Мониторь использование ресурсов: `docker stats`

---

## Troubleshooting

### Бэкенд не запускается

```bash
# Проверь логи
docker-compose logs backend

# Проверь, что порт 3000 свободен
lsof -i :3000
```

### Docker не запускается

```bash
# Перезапусти Docker Desktop
# Или через терминал:
killall Docker && open -a Docker
```

### Сервис не стартует автоматически

```bash
# Проверь статус
launchctl list | grep mpro-backend

# Перезагрузи сервис
launchctl unload ~/Library/LaunchAgents/com.timeweb.mpro-backend.plist
launchctl load ~/Library/LaunchAgents/com.timeweb.mpro-backend.plist
```
