# GitHub Actions для автоматического деплоя на Render

## Настройка (один раз)

### 1. Получи Render API Key

1. Зайди на https://dashboard.render.com
2. Перейди в **Account Settings → API Keys**
3. Нажми **Create API Key**
4. Скопируй ключ (он понадобится в следующем шаге)

### 2. Получи Service ID

1. В Render Dashboard открой свой **Web Service** (бэкенд)
2. В URL будет что-то вроде: `https://dashboard.render.com/web/xxxx-xxxx-xxxx`
3. Или в настройках сервиса найди **Service ID** (формат: `srv-xxxxx`)

### 3. Добавь Secrets в GitHub

1. Зайди в репозиторий `Averjahn/test-back` на GitHub
2. Перейди в **Settings → Secrets and variables → Actions**
3. Нажми **New repository secret** и добавь:

   - **Name**: `RENDER_API_KEY`  
     **Value**: твой API Key из шага 1

   - **Name**: `RENDER_SERVICE_ID`  
     **Value**: Service ID из шага 2 (например, `srv-xxxxx`)

   - **Name**: `DATABASE_URL` (опционально, для тестов в CI)  
     **Value**: твой External Database URL из Render PostgreSQL

### 4. Проверь, что Auto-Deploy включён в Render

1. В Render Dashboard → твой Web Service
2. Вкладка **Settings**
3. Убедись, что **Auto-Deploy** включён и выбран branch `main`

## Как это работает

После настройки:

1. Ты делаешь изменения в коде
2. Делаешь `git push origin main`
3. GitHub Actions автоматически:
   - Проверяет код (lint, build)
   - Триггерит деплой на Render через API
4. Render автоматически:
   - Собирает проект
   - Деплоит новую версию

## Ручной деплой (если нужно)

Если хочешь задеплоить вручную без push:

```bash
cd backend
npm run deploy:git
```

Или через Render Dashboard: **Manual Deploy → Deploy latest commit**
