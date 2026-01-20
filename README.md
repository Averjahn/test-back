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
