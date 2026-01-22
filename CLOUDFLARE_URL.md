# Cloudflare Tunnel URL для бэкенда

## Публичный URL

```
https://lat-observe-arcade-click.trycloudflare.com
```

## API Endpoints

- **Swagger документация**: https://lat-observe-arcade-click.trycloudflare.com/api/docs
- **API Base URL**: https://lat-observe-arcade-click.trycloudflare.com/api

## Настройка фронта на Vercel

В проекте `front-platform` → **Environment Variables**:

```env
VITE_API_BASE_URL=https://lat-observe-arcade-click.trycloudflare.com/api
```

После этого сделай **Redeploy** проекта на Vercel.

## Проверка работы

### Локально

```bash
# Проверь Swagger
curl https://lat-observe-arcade-click.trycloudflare.com/api/docs

# Проверь health (если endpoint есть)
curl https://lat-observe-arcade-click.trycloudflare.com/api/health
```

### Из браузера

Открой в браузере:
- https://lat-observe-arcade-click.trycloudflare.com/api/docs

Должен открыться Swagger UI.

### Из фронта на Vercel

1. Убедись, что `VITE_API_BASE_URL` настроен на Vercel
2. Открой `https://front-platform-seven.vercel.app/login`
3. Попробуй логин: `admin@example.com / password123`
4. В DevTools → Network должен быть запрос на:
   ```
   https://lat-observe-arcade-click.trycloudflare.com/api/auth/login
   ```

## Важно

⚠️ **URL меняется при перезапуске туннеля** — если перезапустишь `cloudflared tunnel`, URL изменится, и нужно будет обновить `VITE_API_BASE_URL` на Vercel.

Для постоянного URL нужно:
1. Создать именованный туннель через `cloudflared tunnel create`
2. Настроить свой домен в Cloudflare
3. См. инструкцию в `FULL_SERVER_SETUP.md` (шаг 5.2, Вариант A)

## Web Interface Cloudflare Tunnel

Открой в браузере: http://localhost:4040

Там будет:
- Текущий публичный URL
- Статистика запросов
- Логи туннеля
