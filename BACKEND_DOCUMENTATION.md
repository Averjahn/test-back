# Документация Backend API

## Оглавление

1. [Обзор архитектуры](#обзор-архитектуры)
2. [Безопасность](#безопасность)
3. [Аутентификация и авторизация](#аутентификация-и-авторизация)
4. [Структура проекта](#структура-проекта)
5. [Модели данных](#модели-данных)
6. [API Endpoints](#api-endpoints)
7. [Логические связи и бизнес-логика](#логические-связи-и-бизнес-логика)
8. [Обработка файлов](#обработка-файлов)
9. [CORS и безопасность запросов](#cors-и-безопасность-запросов)
10. [Развертывание](#развертывание)

---

## Обзор архитектуры

### Технологический стек

- **Framework**: NestJS 11.x (Node.js)
- **Database**: PostgreSQL с Prisma ORM
- **Authentication**: JWT (JSON Web Tokens) через Passport.js
- **Validation**: class-validator и class-transformer
- **Documentation**: Swagger/OpenAPI
- **File Upload**: Multer
- **Deployment**: Docker + Render

### Архитектурные принципы

1. **Модульная архитектура**: Каждый функциональный модуль (auth, patient, doctor, admin) изолирован
2. **Dependency Injection**: Использование DI контейнера NestJS для управления зависимостями
3. **Guards и Decorators**: Централизованная система авторизации через guards
4. **DTO (Data Transfer Objects)**: Валидация и трансформация данных на уровне контроллеров
5. **Service Layer**: Бизнес-логика изолирована в сервисах, контроллеры только маршрутизируют запросы

---

## Безопасность

### 1. Хеширование паролей

**Реализация**: `bcryptjs` с солью

```typescript
// backend/src/auth/auth.service.ts
const passwordHash = await bcrypt.hash(password, 10);
```

**Обоснование**:
- **bcrypt** - криптографически стойкий алгоритм хеширования
- **Соль (salt)** генерируется автоматически, предотвращает атаки rainbow tables
- **10 раундов** - баланс между безопасностью и производительностью

**Важно**: Пароли **никогда** не хранятся в открытом виде. Даже администраторы не могут увидеть исходные пароли.

### 2. JWT токены

**Реализация**: JWT с секретным ключом из переменных окружения

**Безопасность**:
- Токены подписываются секретным ключом (`JWT_SECRET`)
- Валидация подписи при каждом запросе
- Токены имеют срок действия (по умолчанию 7 дней)
- Токены передаются через:
  - **HttpOnly cookies** (для веб-приложений, защита от XSS)
  - **Authorization header** (для мобильных приложений/API клиентов)

**Обоснование двойной передачи**:
- Cookies удобны для браузеров, но не работают в мобильных приложениях
- Header позволяет гибкость для разных типов клиентов
- Оба метода проверяются в `JwtStrategy`

### 3. Валидация входных данных

**Реализация**: `class-validator` + `ValidationPipe`

```typescript
// Глобальная валидация в main.ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,              // Удаляет поля, не описанные в DTO
    forbidNonWhitelisted: true,   // Выбрасывает ошибку при лишних полях
    transform: true,               // Автоматически преобразует типы
  }),
);
```

**Защита от**:
- SQL Injection (Prisma использует параметризованные запросы)
- NoSQL Injection (валидация типов)
- Mass Assignment (whitelist)
- Type Confusion (transform)

### 4. Защита от CSRF

**Реализация**: HttpOnly cookies + SameSite атрибут

**Примечание**: Для полноценной защиты от CSRF рекомендуется использовать CSRF токены, но в текущей реализации:
- HttpOnly cookies защищают от XSS-атак, которые могут украсть токены
- CORS настройки ограничивают источники запросов

### 5. Ограничение размера файлов

**Реализация**: Multer limits

```typescript
limits: {
  fileSize: 10 * 1024 * 1024, // 10MB для документов
  fileSize: 5 * 1024 * 1024,  // 5MB для аватаров
}
```

**Защита от**:
- DoS атак через загрузку больших файлов
- Переполнения диска

---

## Аутентификация и авторизация

### Трехуровневая система защиты

#### Уровень 1: JwtAuthGuard

**Назначение**: Проверка наличия и валидности JWT токена

**Реализация**: `backend/src/common/guards/jwt-auth.guard.ts`

```typescript
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    
    // Пропускаем OPTIONS запросы (CORS preflight)
    if (request.method === 'OPTIONS') {
      return true;
    }
    
    return super.canActivate(context);
  }
}
```

**Логика**:
1. Извлекает токен из cookie или Authorization header
2. Проверяет подпись токена
3. Проверяет срок действия
4. Загружает пользователя из базы данных
5. Добавляет объект `user` в `request`

**Важно**: OPTIONS запросы пропускаются без проверки токена для поддержки CORS preflight.

#### Уровень 2: RolesGuard

**Назначение**: Проверка роли пользователя

**Реализация**: `backend/src/common/guards/roles.guard.ts`

**Роли**:
- `ADMIN` - полный доступ ко всем ресурсам
- `DOCTOR` - доступ к своим пациентам и назначениям
- `PATIENT` - доступ только к своим данным

**Использование**:
```typescript
@Roles(UserRole.ADMIN, UserRole.DOCTOR)
@Get('patients')
async getPatients() { ... }
```

**Логика**:
- Если декоратор `@Roles()` не указан, доступ разрешен всем аутентифицированным пользователям
- Если указан, проверяется, что роль пользователя входит в список разрешенных

#### Уровень 3: ResourceAccessGuard

**Назначение**: Проверка доступа к конкретному ресурсу (пациент, врач, пользователь)

**Реализация**: `backend/src/common/guards/resource-access.guard.ts`

**Использование**:
```typescript
@Resource(ResourceType.PATIENT, 'patientId')
@Get('patients/:patientId')
async getPatient(@Param('patientId') patientId: string) { ... }
```

**Логика проверки доступа**:

1. **ADMIN**: Полный доступ ко всем ресурсам
2. **PATIENT**:
   - Может получить доступ только к своему профилю (`patient.userId === user.id`)
   - Не может получить доступ к данным других пациентов
3. **DOCTOR**:
   - Может получить доступ только к своим пациентам (проверка через `PatientDoctor` relation)
   - Может получить доступ только к своему профилю

**Пример проверки доступа к пациенту**:
```typescript
private async checkPatientAccess(user: any, patientId: string): Promise<boolean> {
  const patient = await this.prisma.patient.findUnique({
    where: { id: patientId },
  });

  if (user.role === UserRole.PATIENT) {
    // Пациент может получить доступ только к своему профилю
    if (patient.userId !== user.id) {
      throw new ForbiddenException('Access denied');
    }
  }

  if (user.role === UserRole.DOCTOR) {
    // Врач может получить доступ только к своим пациентам
    const relation = await this.prisma.patientDoctor.findUnique({
      where: { patientId_doctorId: { patientId, doctorId: doctor.id } },
    });
    
    if (!relation) {
      throw new ForbiddenException('Access denied');
    }
  }
}
```

### Порядок применения Guards

Guards применяются в следующем порядке:

```typescript
@UseGuards(JwtAuthGuard, RolesGuard, ResourceAccessGuard)
```

1. **JwtAuthGuard** проверяет токен и загружает пользователя
2. **RolesGuard** проверяет роль пользователя
3. **ResourceAccessGuard** проверяет доступ к конкретному ресурсу

Если любой guard возвращает `false` или выбрасывает исключение, запрос отклоняется.

---

## Структура проекта

```
backend/
├── src/
│   ├── admin/              # Модуль администратора
│   │   ├── admin.controller.ts
│   │   ├── admin.service.ts
│   │   └── dto/
│   ├── auth/               # Аутентификация
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── strategies/
│   │       └── jwt.strategy.ts
│   ├── common/             # Общие компоненты
│   │   ├── decorators/     # Декораторы (@Roles, @Resource, @CurrentUser)
│   │   ├── guards/         # Guards (JwtAuthGuard, RolesGuard, ResourceAccessGuard)
│   │   └── middleware/     # Middleware (LoggerMiddleware)
│   ├── doctor/             # Модуль врача (для работы врача с данными)
│   ├── doctors/            # Модуль врачей (для просмотра списка врачей)
│   ├── patient/            # Модуль пациента (для работы пациента с данными)
│   ├── patients/           # Модуль пациентов (для просмотра списка пациентов)
│   ├── diary/              # Дневник пациента
│   ├── tests/              # Тесты и сессии
│   ├── trainers/           # Тренажеры
│   ├── tariffs/            # Тарифы
│   ├── users/              # Пользователи
│   ├── prisma/             # Prisma сервис
│   ├── app.module.ts       # Корневой модуль
│   └── main.ts             # Точка входа
├── prisma/
│   ├── schema.prisma       # Схема базы данных
│   ├── migrations/         # Миграции
│   └── seed.ts            # Сидер для тестовых данных
└── uploads/                # Загруженные файлы
    ├── documents/          # Документы пациентов
    ├── diary/              # Файлы дневника
    └── avatars/            # Аватары пользователей
```

### Принцип разделения модулей

**Почему два модуля для пациентов/врачей?**

1. **`patient/` и `doctor/`**: Модули для работы пользователей со своими данными
   - Пациент редактирует свой профиль
   - Врач просматривает своих пациентов
   - Используют `@CurrentUser()` декоратор

2. **`patients/` и `doctors/`**: Модули для просмотра списков
   - Администратор просматривает всех пациентов/врачей
   - Используют фильтры и пагинацию

**Обоснование**: Разделение ответственности - пользователь работает со своими данными, администратор управляет всеми пользователями.

---

## Модели данных

### Основные сущности

#### User (Пользователь)

```prisma
model User {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String
  role         UserRole @default(PATIENT)
  firstName    String?
  lastName     String?
  middleName   String?
  login        String   @unique
  createdAt    DateTime @default(now())
  
  doctor       Doctor?
  patient      Patient?
}
```

**Назначение**: Базовая информация о пользователе системы

**Безопасность**:
- `passwordHash` - хеш пароля, никогда не возвращается в API ответах
- `email` и `login` уникальны

#### Patient (Пациент)

```prisma
model Patient {
  id             String          @id @default(uuid())
  userId         String          @unique
  birthDate      DateTime?
  avatarUrl      String?
  trustedContact String?
  tariffId       String?
  
  user           User            @relation(...)
  assignments    Assignment[]
  diaryEntries   DiaryEntry[]
  medicalData    MedicalData[]
  doctors        PatientDoctor[]
  documents      Document[]
  appointments   Appointment[]
  tariff         Tariff?
}
```

**Связи**:
- `userId` → `User.id` (один к одному)
- `tariffId` → `Tariff.id` (многие к одному)
- `assignments` → `Assignment[]` (один ко многим)
- `doctors` → `PatientDoctor[]` (многие ко многим через промежуточную таблицу)

#### Doctor (Врач)

```prisma
model Doctor {
  id                String              @id @default(uuid())
  userId            String              @unique
  createdAt         DateTime            @default(now())
  
  user              User                @relation(...)
  assignments       Assignment[]
  patients          PatientDoctor[]
  appointmentSchedules AppointmentSchedule[]
  appointments      Appointment[]
}
```

**Особенности**:
- Врач связан с пациентами через `PatientDoctor` (многие ко многим)
- Врач имеет расписание (`AppointmentSchedule`)
- Врач может создавать назначения (`Assignment`)

#### Assignment (Назначение)

```prisma
model Assignment {
  id        String        @id @default(uuid())
  patientId String
  doctorId  String
  trainerId String
  createdAt DateTime      @default(now())
  
  doctor    Doctor        @relation(...)
  patient   Patient       @relation(...)
  trainer   Trainer       @relation(...)
  sessions  TestSession[]
}
```

**Назначение**: Связывает пациента, врача и тренажер. Врач назначает пациенту тренажер для выполнения.

**Бизнес-логика**:
- Одно назначение может иметь множество сессий тестирования
- Назначение создается врачом для своего пациента

#### Appointment (Прием)

```prisma
model Appointment {
  id        String   @id @default(uuid())
  patientId String
  doctorId  String
  date      DateTime
  startTime String   // "HH:mm"
  endTime   String   // "HH:mm"
  type      String   @default("first") // "first" | "repeat"
  notes     String?
  
  patient   Patient  @relation(...)
  doctor    Doctor   @relation(...)
  
  @@unique([doctorId, date, startTime])
}
```

**Ограничения**:
- Уникальность: один врач не может иметь два приема в одно время
- `type` определяет тип приема (первичный/повторный)

#### AppointmentSchedule (Расписание врача)

```prisma
model AppointmentSchedule {
  id          String   @id @default(uuid())
  doctorId    String
  dayOfWeek   Int      // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  startTime   String   // "HH:mm"
  endTime     String   // "HH:mm"
  slotDuration Int     // Длительность слота в минутах
  isActive    Boolean  @default(true)
  
  doctor      Doctor   @relation(...)
}
```

**Назначение**: Определяет доступные временные слоты для записи к врачу

**Бизнес-логика**:
- Врач может иметь несколько расписаний для разных дней недели
- Система автоматически генерирует доступные даты на основе расписания
- Реализован "rolling window" - всегда доступны следующие 14 дней

---

## API Endpoints

### Аутентификация

#### POST `/api/auth/register`

Регистрация нового пользователя (только для администраторов)

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "role": "PATIENT",
  "firstName": "Иван",
  "lastName": "Иванов",
  "middleName": "Иванович"
}
```

**Response**: `201 Created`
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "role": "PATIENT",
  "firstName": "Иван",
  "lastName": "Иванов"
}
```

**Безопасность**:
- Пароль хешируется перед сохранением
- Email должен быть уникальным
- Роль валидируется (ADMIN, DOCTOR, PATIENT)

#### POST `/api/auth/login`

Вход в систему

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response**: `200 OK`
```json
{
  "access_token": "jwt_token",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "PATIENT"
  }
}
```

**Безопасность**:
- Токен устанавливается в HttpOnly cookie
- Токен также возвращается в теле ответа для мобильных приложений
- Срок действия токена: 7 дней (настраивается через `JWT_EXPIRES_IN`)

### Пациент

#### GET `/api/patient/profile`

Получить профиль текущего пациента

**Guards**: `JwtAuthGuard`, `RolesGuard(PATIENT)`

**Response**: Полный профиль пациента с тарифом и врачами

#### PUT `/api/patient/profile`

Обновить профиль пациента

**Guards**: `JwtAuthGuard`, `RolesGuard(PATIENT)`

**Request Body**:
```json
{
  "firstName": "Иван",
  "lastName": "Иванов",
  "middleName": "Иванович",
  "birthDate": "1990-01-15",
  "trustedContact": "+7 999 123-45-67"
}
```

**Безопасность**:
- Пациент может обновить только свой профиль
- Валидация всех полей через DTO

#### PUT `/api/patient/profile/avatar`

Загрузить аватар пациента

**Guards**: `JwtAuthGuard`, `RolesGuard(PATIENT)`

**Request**: `multipart/form-data` с полем `avatar`

**Ограничения**:
- Максимальный размер: 5MB
- Тип файла: изображения

### Врач

#### GET `/api/doctor/patients`

Получить список пациентов врача

**Guards**: `JwtAuthGuard`, `RolesGuard(DOCTOR)`

**Response**: Список пациентов, связанных с текущим врачом

**Безопасность**:
- Врач видит только своих пациентов (проверка через `PatientDoctor`)

#### GET `/api/doctor/patients/:patientId`

Получить детальную информацию о пациенте

**Guards**: `JwtAuthGuard`, `RolesGuard(DOCTOR)`, `ResourceAccessGuard(PATIENT)`

**Безопасность**:
- `ResourceAccessGuard` проверяет, что пациент связан с врачом

### Администратор

#### POST `/api/admin/patients`

Создать нового пациента

**Guards**: `JwtAuthGuard`, `RolesGuard(ADMIN)`

**Request Body**:
```json
{
  "email": "patient@example.com",
  "password": "securePassword123",
  "firstName": "Иван",
  "lastName": "Иванов",
  "middleName": "Иванович",
  "birthDate": "1990-01-15"
}
```

**Бизнес-логика**:
- Создается пользователь (`User`)
- Создается профиль пациента (`Patient`)
- Пароль хешируется

#### POST `/api/admin/patients/:patientId/documents/upload`

Загрузить документ для пациента

**Guards**: `JwtAuthGuard`, `RolesGuard(ADMIN)`

**Request**: `multipart/form-data` с полями:
- `file`: файл документа
- `title`: название документа
- `type`: тип документа

**Ограничения**:
- Максимальный размер: 10MB
- Тип файла: любой (валидация на уровне бизнес-логики)

---

## Логические связи и бизнес-логика

### 1. Связь Пациент-Врач

**Модель**: Многие ко многим через `PatientDoctor`

**Логика**:
- Администратор назначает врача пациенту через `POST /api/admin/patients/:patientId/assign-doctor`
- Врач видит только своих пациентов
- Пациент видит своих врачей в профиле

**Проверка доступа**:
```typescript
// Врач может получить доступ только к своим пациентам
const relation = await this.prisma.patientDoctor.findUnique({
  where: { patientId_doctorId: { patientId, doctorId } },
});

if (!relation) {
  throw new ForbiddenException('Access denied');
}
```

### 2. Назначения (Assignments)

**Логика**:
1. Врач назначает пациенту тренажер (`POST /api/doctor/assignments`)
2. Пациент видит назначенные тренажеры (`GET /api/patient/trainers`)
3. Пациент может проходить тесты в рамках назначения
4. Результаты сохраняются в `TestSession` и `TestAnswer`

**Связи**:
- `Assignment` → `Patient` (многие к одному)
- `Assignment` → `Doctor` (многие к одному)
- `Assignment` → `Trainer` (многие к одному)
- `Assignment` → `TestSession[]` (один ко многим)

### 3. Расписание приемов (Appointments)

**Логика "Rolling Window"**:

Система автоматически предоставляет доступные даты на следующие 14 дней:

```typescript
// backend/src/admin/admin.service.ts
async getAvailableDates(doctorId: string) {
  const schedules = await this.getDoctorSchedules(doctorId);
  const today = new Date();
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + 14); // 14 дней вперед
  
  // Генерируем доступные даты на основе расписания
  const availableDates = [];
  // ... логика генерации дат
}
```

**Проверка доступности**:
- Система проверяет расписание врача (`AppointmentSchedule`)
- Исключает уже занятые слоты (`Appointment`)
- Генерирует доступные временные слоты

**Ограничения**:
- Один врач не может иметь два приема в одно время (`@@unique([doctorId, date, startTime])`)
- Администратор может создать прием только на доступное время

### 4. Документы пациентов

**Логика скрытых документов**:

Система генерирует "динамические" документы (например, акты согласия), которые отображаются в списке документов. Администратор может "скрыть" такие документы:

```typescript
// backend/src/admin/admin.service.ts
async deleteDocument(patientId: string, documentId: string) {
  // Проверяем, является ли документ динамическим
  const isDynamic = documentId.startsWith('act-') || documentId.startsWith('consent-');
  
  if (isDynamic) {
    // Скрываем документ вместо удаления
    await this.prisma.hiddenDocument.create({
      data: { patientId, documentId },
    });
  } else {
    // Удаляем физический файл и запись из БД
    await fs.unlinkSync(filePath);
    await this.prisma.document.delete({ where: { id: documentId } });
  }
}
```

**Обоснование**:
- Динамические документы не имеют физических файлов
- Скрытие позволяет "удалить" их из интерфейса без потери данных
- Физические документы удаляются полностью

---

## Обработка файлов

### Структура директорий

```
uploads/
├── documents/    # Документы пациентов
├── diary/        # Файлы дневника (если будут)
└── avatars/      # Аватары пользователей
```

### Создание директорий

**При старте приложения** (`main.ts`):
```typescript
const uploadsDir = join(process.cwd(), 'uploads');
const documentsDir = join(uploadsDir, 'documents');
const diaryDir = join(uploadsDir, 'diary');
const avatarsDir = join(uploadsDir, 'avatars');

[uploadsDir, documentsDir, diaryDir, avatarsDir].forEach((dir) => {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
});
```

**В Dockerfile**:
```dockerfile
RUN mkdir -p /app/uploads/documents /app/uploads/diary /app/uploads/avatars
RUN chown -R nestjs:nodejs /app/uploads
```

**Обоснование**:
- Директории создаются при старте на случай, если они были удалены
- В Docker права выдаются пользователю `nestjs` для записи файлов

### Загрузка файлов

**Multer конфигурация**:
```typescript
FileInterceptor('file', {
  storage: diskStorage({
    destination: join(process.cwd(), 'uploads', 'documents'),
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      cb(null, `document-${uniqueSuffix}${ext}`);
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
})
```

**Безопасность**:
- Уникальные имена файлов предотвращают перезапись
- Ограничение размера защищает от DoS
- Тип файла валидируется на уровне бизнес-логики (для документов - любой тип)

### Статическая раздача файлов

```typescript
app.useStaticAssets(join(process.cwd(), 'uploads'), {
  prefix: '/uploads/',
});
```

**Доступ к файлам**:
- URL: `http://localhost:3000/uploads/documents/document-123.jpg`
- Файлы доступны публично (для авторизованных пользователей через CORS)

**Рекомендация**: В production рекомендуется использовать CDN или отдельный сервис для статических файлов.

---

## CORS и безопасность запросов

### Конфигурация CORS

**Реализация**: `main.ts`

```typescript
app.enableCors({
  origin: (origin, callback) => {
    // Проверка origin
    if (origin.includes('vercel.app') || origin.includes('onrender.com')) {
      return callback(null, true);
    }
    // ... другие проверки
  },
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', ...],
});
```

### Критически важные настройки

1. **`credentials: true`**:
   - Обязателен для передачи cookies и Authorization header
   - **НЕЛЬЗЯ** использовать `origin: '*'` с `credentials: true`

2. **Явный allowlist origins**:
   - Разрешаются только известные домены
   - В production блокируются неизвестные origins

3. **OPTIONS запросы**:
   - Пропускаются без проверки токена в `JwtAuthGuard`
   - Необходимо для CORS preflight

### Content Security Policy (CSP)

```typescript
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  if (origin && origin.includes('vercel.app')) {
    const cspValue = `frame-ancestors 'self' ${origin} ...`;
    res.setHeader('Content-Security-Policy', cspValue);
  }
  
  next();
});
```

**Назначение**: Разрешает embedding приложения в iframe для определенных доменов (например, v0 проекты на Vercel).

---

## Развертывание

### Docker

**Dockerfile** использует multi-stage build:

1. **deps**: Установка зависимостей
2. **builder**: Сборка приложения
3. **runner**: Production образ

**Безопасность**:
- Приложение запускается под непривилегированным пользователем `nestjs`
- Права на директории выдаются явно

### Переменные окружения

**Обязательные**:
- `DATABASE_URL` - строка подключения к PostgreSQL
- `JWT_SECRET` - секретный ключ для подписи JWT токенов
- `JWT_EXPIRES_IN` - срок действия токена (по умолчанию "7d")

**Опциональные**:
- `PORT` - порт приложения (по умолчанию 3000)
- `NODE_ENV` - окружение (development/production)

### CI/CD

**GitHub Actions** (`deploy-docker-render.yml`):
1. Сборка Docker образа
2. Пуш в Docker Hub
3. Деплой на Render

**Безопасность**:
- Docker Hub credentials хранятся в GitHub Secrets
- Автоматический деплой при push в `main`

---

## Лучшие практики

### 1. Обработка ошибок

**Всегда используйте try-catch в сервисах**:
```typescript
try {
  const result = await this.prisma.patient.findUnique({ ... });
  if (!result) {
    throw new NotFoundException('Patient not found');
  }
  return result;
} catch (error) {
  if (error instanceof NotFoundException) {
    throw error;
  }
  throw new InternalServerErrorException('Failed to fetch patient');
}
```

### 2. Валидация данных

**Используйте DTO для всех входных данных**:
```typescript
export class CreatePatientDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsEnum(UserRole)
  role: UserRole;
}
```

### 3. Логирование

**Используйте встроенный Logger NestJS**:
```typescript
constructor(private logger: Logger) {}

this.logger.log('Patient created', 'PatientService');
this.logger.error('Failed to create patient', error.stack);
```

### 4. Транзакции

**Используйте транзакции для атомарных операций**:
```typescript
await this.prisma.$transaction([
  this.prisma.user.create({ data: userData }),
  this.prisma.patient.create({ data: patientData }),
]);
```

---

## Заключение

Данная документация описывает архитектуру, безопасность и логику работы backend API. При разработке новых функций следуйте описанным принципам и практикам для обеспечения безопасности и поддерживаемости кода.
