# Деплой бэкенда на Render (бесплатный хостинг)

## Быстрый старт через npm команды

### 1. Установка Render CLI

```bash
# macOS (через Homebrew)
brew install render

# Или скачай бинарник с https://github.com/render-oss/cli/releases
```

### 2. Авторизация в Render

```bash
npm run deploy:setup
# или напрямую:
render login
```

Откроется браузер → нажми **Generate token** → вернись в терминал.

Затем выбери workspace:

```bash
render workspace set
```

### 3. Первоначальная настройка на Render (один раз)

#### 3.1. Создай PostgreSQL базу

Через веб-интерфейс Render:

1. Зайди на https://dashboard.render.com
2. **New → PostgreSQL**
3. Настройки:
   - Name: `mpro-db`
   - Database: `mpro_db`
   - User: `mpro_user`
   - Region: Oregon (US West)
   - Plan: **Free**
4. Нажми **Create database**
5. Скопируй **External Database URL** (он понадобится в следующем шаге)

#### 3.2. Создай Web Service

1. В Render Dashboard: **New → Web Service**
2. Настройки:
   - **Repository**: `Averjahn/test-back`
   - **Branch**: `main`
   - **Name**: `mpro-backend`
   - **Region**: Oregon (US West)
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npm run start:prod`
   - **Plan**: **Free**
3. В разделе **Environment** добавь переменные:
   - `DATABASE_URL` = твой External Database URL из PostgreSQL
   - `JWT_SECRET` = `super-secret-jwt-key-change-me-in-production`
   - `FRONTEND_URL` = `http://localhost:5173` (потом поменяешь на Vercel URL)
   - `NODE_ENV` = `production`
4. Нажми **Create Web Service**

### 4. Применение миграций и сидов (один раз)

После первого деплоя открой **Shell** в Render Web Service и выполни:

```bash
npm run prisma:migrate:deploy
npm run prisma:seed
```

### 5. Деплой через npm команды

После первоначальной настройки все последующие деплои можно делать через npm:

```bash
# Обычный деплой (не ждёт завершения)
npm run deploy:render

# Деплой с ожиданием завершения (полезно для CI/CD)
npm run deploy:render:wait
```

**Важно:** Для работы этих команд нужен Render CLI и авторизация (см. шаг 2).

### 6. Автоматический деплой через Git (CI/CD)

#### Вариант A: Встроенный Auto-Deploy Render (рекомендуется)

Render **автоматически деплоит** при push в `main` ветку, если Web Service правильно настроен:

1. В Render Dashboard → твой Web Service → **Settings**
2. Убедись, что **Auto-Deploy** включён:
   - **Auto-Deploy**: `Yes`
   - **Branch**: `main`
3. Теперь просто делай:

```bash
git add .
git commit -m "Update backend"
git push origin main
```

Render **автоматически обнаружит изменения** и запустит деплой. Статус можно смотреть в Render Dashboard → **Events**.

#### Вариант B: GitHub Actions (для дополнительных проверок)

Если хочешь добавить проверки (lint, tests) перед деплоем, используй GitHub Actions:

1. **Получи Render API Key**:
   - Render Dashboard → **Account Settings → API Keys → Create API Key**
   - Скопируй ключ

2. **Получи Service ID**:
   - В Render Dashboard открой Web Service
   - Service ID будет в URL или в настройках (формат: `srv-xxxxx`)

3. **Добавь Secrets в GitHub**:
   - Репозиторий `Averjahn/test-back` → **Settings → Secrets and variables → Actions**
   - Добавь:
     - `RENDER_API_KEY` = твой API Key
     - `RENDER_SERVICE_ID` = Service ID твоего Web Service

4. **Workflow уже создан** в `.github/workflows/deploy.yml`

Теперь при каждом push в `main`:
- GitHub Actions проверит код (lint, build)
- Автоматически триггернет деплой на Render
- Render соберёт и задеплоит новую версию

**Рекомендация**: Используй **Вариант A** (встроенный Auto-Deploy) — он проще и работает сразу после настройки Web Service.

## Альтернатива: деплой через Render Dashboard

Если не хочешь использовать CLI, можно:

1. Зайти в Render Dashboard
2. Открыть Web Service
3. Нажать **Manual Deploy → Deploy latest commit**

## Получение URL бэкенда

После деплоя Render даст URL вида:

```
https://mpro-backend.onrender.com
```

API будет доступен по:

```
https://mpro-backend.onrender.com/api
```

## Настройка фронта

В `platform-front/.env.local`:

```env
VITE_API_BASE_URL=https://mpro-backend.onrender.com/api
```

(замени на реальный URL из Render)

## Проверка работы

1. Открой в браузере: `https://mpro-backend.onrender.com/api`
2. Должен вернуться ответ (например, `Hello World!` или JSON)
3. Попробуй залогиниться на фронте с тестовыми данными:
   - `admin@example.com / password123`
   - `doctor@example.com / password123`
   - `patient1@example.com / password123`

## Важно про Render Free Tier

- ⚠️ После 15 минут бездействия сервис засыпает
- ⚠️ Первый запрос после пробуждения может быть медленным (spin-up ~30-60 сек)
- ⚠️ Для production лучше платный план, но для разработки free tier подходит

## Troubleshooting

### Ошибка "Cannot find module"

Убедись, что в `package.json` есть все зависимости и `prisma generate` выполняется в Build Command.

### Ошибка подключения к базе

Проверь, что `DATABASE_URL` в Environment Variables правильный (External Database URL из PostgreSQL).

### CORS ошибки

Убедись, что в `src/main.ts` в `allowedOrigins` добавлен URL твоего фронта и v0 проекта.
