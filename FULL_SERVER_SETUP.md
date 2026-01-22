# Полная инструкция: Развёртывание бэкенда на своём компьютере с Docker и Cloudflare Tunnel

## 📋 Обзор

Эта инструкция поможет развернуть твой NestJS бэкенд с PostgreSQL на своём компьютере (macOS) через Docker и сделать его доступным из интернета через Cloudflare Tunnel, чтобы фронт на Vercel и другие пользователи могли к нему обращаться.

---

## ✅ Шаг 1. Подготовка компьютера

### 1.1. Установка Docker Desktop

1. Скачай Docker Desktop для macOS: https://www.docker.com/products/docker-desktop
2. Установи и запусти Docker Desktop
3. Проверь установку:

```bash
docker --version
docker-compose --version
```

Должны быть видны версии Docker и Docker Compose.

### 1.2. Установка Cloudflare Tunnel

```bash
# Установка через Homebrew
brew install cloudflared

# Проверка установки
cloudflared --version
```

### 1.3. Клонирование репозитория

```bash
# Если репозиторий ещё не склонирован
git clone https://github.com/Averjahn/test-back.git
cd test-back
```

---

## ✅ Шаг 2. Экспорт локальной базы данных

Если у тебя уже есть локальная БД с данными, экспортируй её:

### 2.1. Если БД в локальном Docker контейнере

```bash
cd /Users/user/mpro-project/backend

# Найди контейнер PostgreSQL
docker ps | grep postgres

# Экспорт базы данных
docker exec -t mpro-postgres pg_dump -U user mpro_db > backup.sql

# Проверь, что файл создан
ls -lh backup.sql
```

### 2.2. Если БД запущена локально (не в Docker)

```bash
# Экспорт через pg_dump
pg_dump -h localhost -U postgres -d mpro_db > backup.sql

# Или если используешь другого пользователя
pg_dump -h localhost -U user -d mpro_db > backup.sql
```

### 2.3. Если используешь Prisma Seed

Если данных в БД нет, можно просто запустить seed после импорта схемы (см. шаг 4).

---

## ✅ Шаг 3. Настройка переменных окружения

### 3.1. Создай файл `.env` в папке `backend/`

```bash
cd /Users/user/mpro-project/backend
nano .env
```

Добавь следующее содержимое:

```env
# База данных (для Docker Compose)
DATABASE_URL=postgresql://user:password@postgres:5432/mpro_db?schema=public

# JWT секрет (ОБЯЗАТЕЛЬНО измени на свой!)
JWT_SECRET=твой_очень_длинный_секретный_ключ_минимум_32_символа_для_безопасности

# Окружение
NODE_ENV=production

# Порт (можно оставить 3000)
PORT=3000
```

**Важно**: 
- `.env` уже в `.gitignore`, он не попадёт в GitHub
- `JWT_SECRET` должен быть длинным и случайным (минимум 32 символа)

---

## ✅ Шаг 4. Запуск бэкенда через Docker

### 4.1. Используй production конфигурацию

```bash
cd /Users/user/mpro-project/backend

# Запусти только PostgreSQL сначала
docker-compose -f docker-compose.prod.yml up -d postgres

# Подожди 10 секунд, пока БД запустится
sleep 10
```

### 4.2. Импорт базы данных (если есть backup.sql)

```bash
# Импорт данных
cat backup.sql | docker exec -i mpro-postgres-prod psql -U user -d mpro_db

# Проверь, что данные импортированы
docker exec -it mpro-postgres-prod psql -U user -d mpro_db -c "\dt"
```

### 4.3. Если данных нет — примени миграции и seed

```bash
# Запусти бэкенд (он сам применит миграции)
docker-compose -f docker-compose.prod.yml up -d backend

# Проверь логи
docker-compose -f docker-compose.prod.yml logs backend

# Если нужно заполнить тестовыми данными, выполни seed:
docker-compose -f docker-compose.prod.yml exec backend npm run prisma:seed
```

### 4.4. Проверка работы бэкенда

```bash
# Проверь, что бэкенд отвечает
curl http://localhost:3000/api/docs

# Или открой в браузере:
# http://localhost:3000/api/docs
```

Должен открыться Swagger UI.

---

## ✅ Шаг 5. Настройка Cloudflare Tunnel для глобального доступа

### 5.1. Авторизация в Cloudflare

```bash
# Запусти авторизацию
cloudflared tunnel login
```

Откроется браузер — авторизуйся через свой Cloudflare аккаунт (или создай бесплатный на https://dash.cloudflare.com/sign-up).

### 5.2. Создание постоянного туннеля

#### Вариант A: С постоянным доменом (рекомендуется)

```bash
# Создай туннель с именем
cloudflared tunnel create mpro-backend

# Запиши Tunnel ID, который появится в выводе
# Например: b8c8e123-4567-8901-2345-6789abcdef12
```

Создай конфигурационный файл:

```bash
mkdir -p ~/.cloudflared
nano ~/.cloudflared/config.yml
```

Добавь содержимое (замени `<TUNNEL_ID>` на реальный ID):

```yaml
tunnel: <TUNNEL_ID>
credentials-file: /Users/user/.cloudflared/<TUNNEL_ID>.json

ingress:
  - hostname: mpro-backend.yourdomain.com  # Замени на свой домен
    service: http://localhost:3000
  - service: http_status:404
```

**Если у тебя нет своего домена**, используй Вариант B.

#### Вариант B: Без домена (временный URL, но работает)

Просто запусти туннель напрямую:

```bash
cloudflared tunnel --url http://localhost:3000
```

Ты получишь URL вида `https://xxxxx.trycloudflare.com` — это и будет твой публичный адрес бэкенда.

**Минус**: URL меняется при каждом перезапуске туннеля.

---

## ✅ Шаг 6. Автозапуск Cloudflare Tunnel при загрузке системы

### 6.1. Создай LaunchAgent для Cloudflare Tunnel

Создай файл `~/Library/LaunchAgents/com.cloudflare.mpro-tunnel.plist`:

```bash
nano ~/Library/LaunchAgents/com.cloudflare.mpro-tunnel.plist
```

Добавь содержимое:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.cloudflare.mpro-tunnel</string>
    
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
    
    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin</string>
    </dict>
</dict>
</plist>
```

### 6.2. Создай папку для логов

```bash
mkdir -p /Users/user/mpro-project/backend/logs
```

### 6.3. Загрузи и запусти сервис

```bash
# Загрузи LaunchAgent
launchctl load ~/Library/LaunchAgents/com.cloudflare.mpro-tunnel.plist

# Запусти сразу
launchctl start com.cloudflare.mpro-tunnel

# Проверь статус
launchctl list | grep cloudflare
```

### 6.4. Проверь логи Cloudflare Tunnel

```bash
# Посмотри логи, чтобы увидеть публичный URL
tail -f /Users/user/mpro-project/backend/logs/cloudflared.log
```

Там должен быть URL вида `https://xxxxx.trycloudflare.com` — это твой публичный адрес бэкенда.

**Запиши этот URL** — он понадобится для настройки фронта.

---

## ✅ Шаг 7. Автозапуск бэкенда при загрузке системы

### 7.1. Обнови LaunchAgent для бэкенда

Убедись, что файл `com.timeweb.mpro-backend.plist` существует в `backend/`:

```bash
cd /Users/user/mpro-project/backend
ls -la com.timeweb.mpro-backend.plist
```

Если файла нет, он уже создан в репозитории — просто скопируй его:

```bash
cp com.timeweb.mpro-backend.plist ~/Library/LaunchAgents/
```

### 7.2. Обнови пути в plist файле (если нужно)

Открой файл и проверь, что пути правильные:

```bash
nano ~/Library/LaunchAgents/com.timeweb.mpro-backend.plist
```

Убедись, что:
- `ProgramArguments` указывает на `/Users/user/mpro-project/backend/start-server.sh`
- `WorkingDirectory` = `/Users/user/mpro-project/backend`

### 7.3. Загрузи и запусти сервис

```bash
# Загрузи LaunchAgent
launchctl load ~/Library/LaunchAgents/com.timeweb.mpro-backend.plist

# Запусти сразу
launchctl start com.timeweb.mpro-backend

# Проверь статус
launchctl list | grep mpro-backend
```

### 7.4. Проверь логи бэкенда

```bash
tail -f /Users/user/mpro-project/backend/logs/launchd.log
```

Должно быть сообщение: `✅ Бэкенд успешно запущен на http://localhost:3000`

---

## ✅ Шаг 8. Настройка CORS для работы с фронтом

CORS уже настроен в `backend/src/main.ts` для поддержки:
- `vercel.app` (для фронта на Vercel)
- `trycloudflare.com` (для Cloudflare Tunnel)
- `tuna.am` (для Tuna туннеля)

Если нужно добавить свой домен, отредактируй `main.ts`:

```typescript
if (origin.includes('твой-домен.com')) {
  return callback(null, true);
}
```

---

## ✅ Шаг 9. Настройка фронта на Vercel

### 9.1. Получи публичный URL бэкенда

Из логов Cloudflare Tunnel (шаг 6.4) скопируй URL, например:
```
https://xxxxx-xxxxx-xxxxx.trycloudflare.com
```

### 9.2. Настрой переменные окружения на Vercel

1. Зайди в проект `front-platform` на Vercel
2. Перейди в **Settings → Environment Variables**
3. Добавь переменную:

   - **Key**: `VITE_API_BASE_URL`
   - **Value**: `https://xxxxx-xxxxx-xxxxx.trycloudflare.com/api`
   - **Environment**: Production (и Preview, если нужно)

4. Нажми **Save**
5. Сделай **Redeploy** проекта

---

## ✅ Шаг 10. Проверка работы с другого компьютера

### 10.1. Проверь бэкенд напрямую

На другом компьютере открой в браузере:

```
https://xxxxx-xxxxx-xxxxx.trycloudflare.com/api/docs
```

Должен открыться Swagger UI.

### 10.2. Проверь через фронт на Vercel

1. Открой `https://front-platform-seven.vercel.app/login`
2. Попробуй логин: `admin@example.com / password123`
3. В DevTools → Network должен быть запрос на:
   ```
   https://xxxxx-xxxxx-xxxxx.trycloudflare.com/api/auth/login
   ```

### 10.3. Проверь логи бэкенда

На своём компьютере:

```bash
# Логи бэкенда
docker-compose -f docker-compose.prod.yml logs -f backend

# Логи Cloudflare Tunnel
tail -f /Users/user/mpro-project/backend/logs/cloudflared.log
```

---

## 🔧 Управление сервисами

### Запуск вручную

```bash
# Бэкенд
cd /Users/user/mpro-project/backend
./start-server.sh

# Cloudflare Tunnel
cloudflared tunnel --url http://localhost:3000
```

### Остановка

```bash
# Бэкенд
docker-compose -f docker-compose.prod.yml down

# Cloudflare Tunnel
launchctl stop com.cloudflare.mpro-tunnel
```

### Перезапуск

```bash
# Бэкенд
launchctl stop com.timeweb.mpro-backend
launchctl start com.timeweb.mpro-backend

# Cloudflare Tunnel
launchctl stop com.cloudflare.mpro-tunnel
launchctl start com.cloudflare.mpro-tunnel
```

### Просмотр статуса

```bash
# Все сервисы
launchctl list | grep -E "mpro-backend|cloudflare"

# Docker контейнеры
docker ps
```

---

## ⚠️ Важные замечания

### Безопасность

1. **JWT_SECRET**: Используй длинный случайный ключ (минимум 32 символа)
2. **PostgreSQL**: Порт 5432 НЕ открыт наружу (только внутри Docker сети)
3. **HTTPS**: Cloudflare Tunnel автоматически предоставляет HTTPS
4. **Firewall**: На macOS разреши входящие подключения для Docker

### Стабильность

1. **Компьютер должен быть всегда включен** — иначе бэкенд недоступен
2. **Автозапуск Docker Desktop**: Настрой в Docker Desktop → Settings → General → "Start Docker Desktop when you log in"
3. **UPS**: Используй источник бесперебойного питания для защиты от отключений
4. **Мониторинг**: Регулярно проверяй логи на ошибки

### Производительность

1. **RAM**: Убедись, что у компьютера достаточно памяти (минимум 4GB свободно)
2. **CPU**: Мониторь использование: `docker stats`
3. **Диск**: Проверяй место на диске для логов и данных БД

---

## 🐛 Troubleshooting

### Бэкенд не запускается

```bash
# Проверь логи
docker-compose -f docker-compose.prod.yml logs backend

# Проверь, что порт 3000 свободен
lsof -i :3000

# Перезапусти контейнеры
docker-compose -f docker-compose.prod.yml restart
```

### Cloudflare Tunnel не работает

```bash
# Проверь логи
tail -f /Users/user/mpro-project/backend/logs/cloudflared.log

# Проверь статус
launchctl list | grep cloudflare

# Перезапусти
launchctl stop com.cloudflare.mpro-tunnel
launchctl start com.cloudflare.mpro-tunnel
```

### CORS ошибки

1. Проверь, что в `main.ts` есть поддержка `trycloudflare.com`
2. Убедись, что фронт использует правильный `VITE_API_BASE_URL`
3. Проверь логи бэкенда на наличие CORS сообщений

### База данных не импортируется

```bash
# Проверь формат backup.sql
head -20 backup.sql

# Попробуй импорт через psql напрямую
docker exec -it mpro-postgres-prod psql -U user -d mpro_db
# Затем в psql:
\i /path/to/backup.sql
```

### Порт занят

```bash
# Найди процесс, использующий порт 3000
lsof -i :3000

# Останови процесс или измени порт в docker-compose.prod.yml
```

---

## 📝 Чек-лист настройки

- [ ] Docker Desktop установлен и запущен
- [ ] Cloudflare Tunnel установлен
- [ ] Репозиторий склонирован
- [ ] `.env` файл создан с правильными переменными
- [ ] База данных экспортирована (если есть данные)
- [ ] `docker-compose.prod.yml` запущен, БД импортирована
- [ ] Бэкенд отвечает на `http://localhost:3000/api/docs`
- [ ] Cloudflare Tunnel запущен и показывает публичный URL
- [ ] LaunchAgents загружены и работают
- [ ] Фронт на Vercel настроен с правильным `VITE_API_BASE_URL`
- [ ] Проверка с другого компьютера успешна

---

## 🎯 Итоговый результат

После выполнения всех шагов:

1. **Бэкенд** работает на твоём компьютере: `http://localhost:3000`
2. **Публичный доступ** через Cloudflare Tunnel: `https://xxxxx.trycloudflare.com`
3. **Фронт на Vercel** обращается к бэкенду через Cloudflare Tunnel
4. **Автозапуск** при загрузке системы
5. **База данных** перенесена и работает в Docker

---

## 📞 Дополнительная помощь

Если что-то не работает:

1. Проверь логи: `docker-compose logs` и `tail -f logs/*.log`
2. Проверь статус сервисов: `launchctl list`
3. Проверь Docker: `docker ps` и `docker stats`
4. Проверь сеть: `curl http://localhost:3000/api/docs`
