## MPRO Backend (NestJS + Prisma)

Проект: серверная часть системы реабилитации пациентов с нарушениями речи.  
Стек: **NestJS**, **Prisma (PostgreSQL)**, **JWT (HttpOnly cookie)**.

### Структура проекта

- `src/app.module.ts` – корневой модуль
- `src/prisma/*` – Prisma‑клиент и модуль БД
- `src/auth/*` – аутентификация, JWT, iframe‑токен
- `src/users/*` – пользователи (ADMIN / DOCTOR / PATIENT)
- `src/admin/*` – админские операции (создание пациентов/врачей/тарифов/тренажёров)
- `src/doctors/*` – эндпоинты для врачей
- `src/patients/*` – эндпоинты для админской части пациентов
- `src/patient/*` – эндпоинты для **самого пациента** (профиль, тариф и т.п.)
- `src/trainers/*` – каталог тренажёров (v0‑проекты)
- `src/tests/*` – старт/ответы/завершение тест‑сессий
- `src/diary/*` – дневник пациента
- `src/common/*` – guards, декораторы, middleware, Role‑based доступ

### Установка и запуск локально

1. **Зависимости**

```bash
cd backend
npm install
```

2. **PostgreSQL**

Создай БД и пользователя (пример):

```sql
CREATE USER mpro_user WITH PASSWORD 'mpro_password';
CREATE DATABASE mpro_db OWNER mpro_user;
GRANT ALL PRIVILEGES ON DATABASE mpro_db TO mpro_user;
```

3. **.env**

Создай `backend/.env`:

```env
DATABASE_URL="postgresql://mpro_user:mpro_password@localhost:5432/mpro_db?schema=public"
JWT_SECRET="super-secret-jwt-key-change-me"
FRONTEND_URL="http://localhost:5173"
```

4. **Миграции и сиды**

```bash
npx prisma migrate deploy
npm run prisma:seed
```

5. **Запуск**

```bash
npm run start:dev
# или
npm run start
```

API будет доступен по `http://localhost:3000/api`.

### Роли и авторизация

- Роли: `ADMIN`, `DOCTOR`, `PATIENT`
- Логин: `POST /api/auth/login`
  - При успехе выдаётся JWT (в cookie и/или теле ответа)
- iframe‑токен: `POST /api/auth/iframe-token` (для встраиваемых v0‑проектов)
- Guards:
  - `JwtAuthGuard` – проверяет JWT
  - `RolesGuard` + декоратор `@Roles(...)` – проверка ролей

### Ключевые эндпоинты

#### Auth
- `POST /api/auth/login` – вход (email + password)
- `POST /api/auth/logout` – выход
- `POST /api/auth/iframe-token` – JWT для iframe (используется во v0)

#### Пациент (личный кабинет)
- `GET /api/patient/profile` – профиль пациента, текущий тариф, лечащий врач
- `PUT /api/patient/tariff` – смена тарифа:

```json
{
  "tariffId": "uuid"
}
```

#### Тарифы
- `GET /api/tariffs` – список всех тарифов (ADMIN/DOCTOR/PATIENT)

#### Тренажёры (trainers)
- `GET /api/trainers` – список всех тренажёров
- `GET /api/trainers?section=1.1` – тренажёры по разделу
- `GET /api/trainers/sections` – список всех разделов
- `POST /api/admin/trainers` – создание тренажёра (ADMIN)

#### Тест‑сессии (для v0‑проектов)

Все запросы требуют заголовок `Authorization: Bearer <token>` **и** `credentials: 'include'` на клиенте.

- `POST /api/tests/start-session`

```json
{
  "assignmentId": "uuid или \"preview\""
}
```

Особенности:
- `assignmentId = "preview"` – режим **просмотра** (используется врачом и в iframe).
- Для реальных UUID – только `PATIENT` может запускать сессию.

- `POST /api/tests/answer`

```json
{
  "sessionId": "uuid",
  "questionId": "some-question-id",
  "answer": { "value": "..." },
  "isCorrect": true
}
```

- `POST /api/tests/finish`

```json
{
  "sessionId": "uuid"
}
```

### Особенности CORS / iframe

Конфигурация CORS (см. `src/main.ts`):
- `app.enableCors(...)` с:
  - `origin` – список доверенных доменов (localhost, Vercel, ngrok и т.п.)
  - `credentials: true`
  - `allowedHeaders` включает `Authorization`
- Для preflight‑запросов `OPTIONS` в `JwtAuthGuard` сделано исключение.

Для iframe:
- Заголовки `Content-Security-Policy: frame-ancestors` и `X-Frame-Options` настроены для разрешённых доменов.
- v0‑проект получает параметры через URL:
  - `userId`
  - `token`
  - `assignmentId`
  - `apiBaseUrl` – **обязателен**, чтобы v0 ходил не на `localhost`, а на внешний URL (ngrok/Vercel/др.).

Подробный гайд по v0 и параметрам см. в `../README_V0.md`.

# MPRO Backend API

Backend приложение на NestJS для медицинской платформы MPRO.

## Технологии

- **NestJS** - фреймворк для Node.js
- **TypeScript** - типизированный JavaScript
- **Prisma ORM** - современный ORM для работы с БД
- **PostgreSQL** - реляционная база данных
- **JWT** - авторизация через HttpOnly cookies
- **Swagger** - API документация

## Структура проекта

```
backend/
├── src/
│   ├── auth/           # Модуль авторизации
│   ├── users/           # Модуль пользователей
│   ├── patients/       # Модуль пациентов
│   ├── doctors/        # Модуль врачей
│   ├── prisma/         # Prisma сервис и модуль
│   └── common/         # Общие guards и decorators
├── prisma/
│   └── schema.prisma   # Схема базы данных
└── docker-compose.yml  # Docker Compose конфигурация
```

## Роли пользователей

- **ADMIN** - администратор системы
- **DOCTOR** - врач
- **PATIENT** - пациент

## Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка окружения

Скопируйте `.env.example` в `.env` и заполните переменные:

```bash
cp .env.example .env
```

### 3. Запуск через Docker Compose

```bash
# Запуск PostgreSQL и приложения
docker-compose up -d

# Применение миграций
docker-compose exec backend npx prisma migrate dev

# Генерация Prisma Client
docker-compose exec backend npx prisma generate
```

### 4. Запуск в режиме разработки (без Docker)

```bash
# Запуск PostgreSQL через Docker
docker-compose up -d postgres

# Применение миграций
npm run prisma:migrate

# Генерация Prisma Client
npm run prisma:generate

# Запуск приложения
npm run start:dev
```

## API Документация

После запуска приложения Swagger документация доступна по адресу:

```
http://localhost:3000/api/docs
```

## Основные эндпоинты

### Авторизация

- `POST /api/auth/login` - вход в систему
- `POST /api/auth/logout` - выход из системы

### Пользователи

- `GET /api/users` - список всех пользователей (только ADMIN)

### Пациенты

- `GET /api/patients` - список пациентов (ADMIN, DOCTOR)

### Врачи

- `GET /api/doctors` - список врачей (ADMIN, DOCTOR)

## Prisma команды

```bash
# Создание новой миграции
npm run prisma:migrate

# Генерация Prisma Client
npm run prisma:generate

# Открыть Prisma Studio
npm run prisma:studio
```

## Docker команды

```bash
# Запуск всех сервисов
docker-compose up -d

# Остановка всех сервисов
docker-compose down

# Просмотр логов
docker-compose logs -f backend

# Пересборка образа
docker-compose build backend
```

## Переменные окружения

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/mpro_db?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"

# Application
PORT=3000
NODE_ENV=development
FRONTEND_URL="http://localhost:3001"
```

## Разработка

### Структура модулей

Каждый модуль содержит:
- `*.module.ts` - определение модуля
- `*.service.ts` - бизнес-логика
- `*.controller.ts` - HTTP эндпоинты
- `dto/` - Data Transfer Objects для валидации

### Guards

- `JwtAuthGuard` - проверка JWT токена
- `RolesGuard` - проверка ролей пользователя

### Decorators

- `@Roles()` - декоратор для указания требуемых ролей

## Лицензия

Private
