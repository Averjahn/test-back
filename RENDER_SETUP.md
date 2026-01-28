# Настройка Backend на Render

## Пошаговая инструкция по настройке сервиса `test-back` на Render

### Шаг 1: Откройте сервис test-back в Render Dashboard

1. Перейдите на https://dashboard.render.com
2. Найдите и откройте сервис **`test-back`**

### Шаг 2: Настройка переменных окружения

1. В меню сервиса выберите **"Environment"** (или вкладку "Environment Variables")
2. Нажмите **"Add Environment Variable"** для каждой переменной

#### Обязательные переменные:

**1. DATABASE_URL** (Internal Database URL)
```
postgresql://averjahn:bZFe0ya5oEov9alCHF4ht1uEHzA21XAn@dpg-d5notun5r7bs73dt9t10-a:5432/testdb_14km?schema=public
```

**Как получить:**
- Откройте базу данных `mpro-db` в Render
- Перейдите в раздел **"Connections"**
- Нажмите на иконку **глаза** рядом с **"Internal Database URL"**
- Скопируйте полный URL

**ВАЖНО:** Используйте **Internal Database URL** (без `.oregon-postgres.render.com`), так как backend находится в той же сети Render.

**2. JWT_SECRET**
```
b22b0cc5982c9a2ff30f8ec6fff2677754d90258319cbe972b339fdc2e0a77e749302d63cd3014b970afcab23e5958481baa4a45f108ed2631626b7423051bea
```

**Как получить:**
- Используйте сгенерированный выше ключ
- Или сгенерируйте новый: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

**3. JWT_EXPIRES_IN** (опционально, по умолчанию "7d")
```
7d
```

**4. NODE_ENV**
```
production
```

**5. PORT** (опционально, по умолчанию 3000)
```
3000
```

### Шаг 3: Проверка настроек

После добавления всех переменных:

1. Нажмите **"Save Changes"**
2. Render автоматически перезапустит сервис
3. Перейдите в раздел **"Logs"** и проверьте, что нет ошибок

### Ожидаемый результат в логах:

```
[Nest] LOG [NestFactory] Starting Nest application...
[Nest] LOG [InstanceLoader] PassportModule dependencies initialized
...
Application is running on: http://localhost:3000
Swagger documentation: http://localhost:3000/api/docs
```

### Шаг 4: Проверка доступности из интернета

После успешного деплоя:

1. В разделе **"Settings"** сервиса найдите **"Public URL"**
2. Ваш API будет доступен по адресу: `https://test-back-xxxx.onrender.com`
3. Swagger документация: `https://test-back-xxxx.onrender.com/api/docs`

## SSL для PostgreSQL

**Важно:** Render PostgreSQL требует SSL для всех подключений.

Код автоматически настраивает SSL:
- Для production окружения (`NODE_ENV=production`)
- Или если URL содержит `render.com`

SSL настраивается в `PrismaService` автоматически, дополнительных действий не требуется.

## Troubleshooting

### Ошибка: "JWT_SECRET is not defined"
- Проверьте, что переменная `JWT_SECRET` добавлена в Environment
- Убедитесь, что нажали "Save Changes"

### Ошибка: "DATABASE_URL is not defined"
- Проверьте, что переменная `DATABASE_URL` добавлена
- Убедитесь, что используете **Internal Database URL** (не External)

### Ошибка: "Can't reach database server"
- Проверьте, что база данных `mpro-db` имеет статус "Available"
- Убедитесь, что используете Internal URL (без `.oregon-postgres.render.com`)
- Проверьте, что база данных находится в том же регионе (Oregon)

### Ошибка: "Server has closed the connection" (P1017)
- Это может быть из-за таймаутов подключения
- Убедитесь, что база данных не перегружена
- Проверьте лимиты подключений в Render

## Проверка работы API

После успешного деплоя проверьте:

1. **Health check:**
   ```bash
   curl https://test-back-xxxx.onrender.com/api
   ```

2. **Swagger документация:**
   Откройте в браузере: `https://test-back-xxxx.onrender.com/api/docs`

3. **Тестовый запрос:**
   ```bash
   curl https://test-back-xxxx.onrender.com/api/tariffs
   ```

## Обновление переменных окружения

Если нужно изменить переменные:

1. Откройте сервис `test-back`
2. Перейдите в **"Environment"**
3. Измените нужные переменные
4. Нажмите **"Save Changes"**
5. Сервис автоматически перезапустится

## Безопасность

- ✅ `JWT_SECRET` должен быть длинным и случайным (минимум 32 символа)
- ✅ Используйте Internal Database URL для безопасности
- ✅ Не коммитьте `.env` файл в git (он уже в `.gitignore`)
- ✅ Render автоматически использует HTTPS для всех сервисов
