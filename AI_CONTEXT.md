## MPRO Backend — контекст для нейросети

Этот файл описывает проект так, чтобы любая LLM/ассистент могли быстро понять архитектуру, ограничения и типичные задачи.

---

### 1. Назначение проекта

Серверная часть системы:

- реабилитация пациентов с нарушениями речи;
- взаимодействие врача, администратора и пациента;
- интеграция с внешними тренажёрами (v0‑проекты) через iframe;
- сбор статистики прохождения тестов/тренажёров.

---

### 2. Стек и базовая архитектура

- **Node.js + NestJS** (`@nestjs/*`)
- **Prisma ORM** + **PostgreSQL**
- **JWT‑аутентификация** (HttpOnly cookie + Authorization header)
- Роли: `ADMIN`, `DOCTOR`, `PATIENT`
- Структура директорий:
  - `src/app.module.ts` – корневой модуль
  - `src/main.ts` – bootstrap приложения (CORS, Swagger, CSP, cookieParser)
  - `src/prisma/*` – модуль/сервис БД
  - `src/common/*` – guards, decorators, middleware:
    - `JwtAuthGuard`, `RolesGuard`, `ResourceAccessGuard`
    - декораторы `@CurrentUser`, `@Roles`, `@Resource`
    - `LoggerMiddleware`
  - `src/auth/*` – логин, logout, выдача iframe‑токена
  - `src/users/*` – работа с сущностью User
  - `src/admin/*` – админские use‑cases (создание пользователей, тарифов, тренажёров)
  - `src/doctors/*` – API для врачей
  - `src/patients/*` – API для админского управления пациентами
  - `src/patient/*` – API для личного кабинета пациента
  - `src/trainers/*` – каталог тренажёров
  - `src/tests/*` – старт/ответы/завершение сессии теста
  - `src/diary/*` – дневник пациента

**Prisma схема** (`prisma/schema.prisma`) включает:

- `User` – пользователь (email, login, passwordHash, role)
- `Patient`, `Doctor` – профили, связанные с `User`
- `Trainer` – внешний тренажёр (v0‑проект)
- `Assignment` – назначение тренажёра пациенту
- `TestSession`, `TestAnswer` – результат прохождения
- `Tariff`, `TariffOption` – тарифы и опции

---

### 3. Аутентификация и безопасность

**Auth:**

- `POST /api/auth/login`:
  - вход по email+пароль,
  - проверка пароля через `bcrypt.compare`,
  - защита от timing‑attack: даже при отсутствии пользователя сравнивается с dummy‑hash,
  - в ответе — `access_token` и объект пользователя без `passwordHash`.

- `POST /api/auth/logout`:
  - очищает cookie с токеном (если используется).

- `POST /api/auth/iframe-token`:
  - выдаёт JWT для iframe‑клиента (v0‑проекта),
  - payload: `email`, `sub` (userId), `role`.

**Guards/Decorators:**

- `JwtAuthGuard` – проверяет JWT (в заголовке/куке), но пропускает `OPTIONS` (preflight).
- `RolesGuard` – читает роли из декоратора `@Roles(UserRole.ADMIN, ...)`.
- `@CurrentUser()` – достаёт `request.user`, типизированный как `User` (из Prisma).

**CORS/CSP:**

- `app.enableCors(...)`:
  - `origin` – функция/массив, разрешающие:
    - `localhost` (dev),
    - домены `vercel.app`, `ngrok-free.app`, `trycloudflare.com`, `loca.lt` и т.п.
  - `credentials: true`
  - `allowedHeaders` включает `Authorization`
  - `exposedHeaders` — при необходимости.

- CSP:
  - `Content-Security-Policy: frame-ancestors` настроен так, чтобы позволять встраивание с нужных доменов (front, v0).

---

### 4. Роли и основные сценарии

#### ADMIN

- создаёт пациентов, врачей, тарифы, тренажёры (`/api/admin/*`);
- назначает тренажёры пациентам (`Assignment`);
- управляет тарифами (создание/изменение).

#### DOCTOR

- видит список своих пациентов;
- назначает тренажёры пациентам (если реализовано через doctor‑endpoint);
- использует **режим preview** тренажёров через iframe (assignmentId = `"preview"`).

#### PATIENT

- авторизуется и попадает в личный кабинет:
  - `GET /api/patient/profile` — профиль, текущий тариф, лечащий врач;
  - `PUT /api/patient/tariff` — сменить тариф;
- проходит тренажёры/тесты:
  - `POST /api/tests/start-session`
  - `POST /api/tests/answer`
  - `POST /api/tests/finish`

---

### 5. Интеграция с v0 (iframe‑проект)

**Общий поток:**

1. Фронтенд (панель врача) открывает iframe со ссылкой на v0‑приложение.
2. Перед этим фронт запрашивает `POST /api/auth/iframe-token` и получает JWT.
3. В `src/views/DoctorTrainersView.vue` формируется URL вида:

```text
https://v0-app.vercel.app
  ?userId=<uuid>
  &token=<jwt>
  &assignmentId=<uuid|preview>
  &apiBaseUrl=<https://.../api>
```

4. v0‑клиент:
   - читает `userId`, `token`, `assignmentId`, `apiBaseUrl` из `searchParams`;
   - **НИКОГДА** не использует `process.env` для выбора API — только `apiBaseUrl` из URL;
   - все запросы делает так:

```ts
await fetch(`${apiBaseUrl}/tests/start-session`, {
  method: 'POST',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({ assignmentId }),
});
```

**Особые случаи:**

- `assignmentId = "preview"`:
  - режим просмотра тренажёра врачом,
  - backend возвращает mock‑сессию (не трогает реальные данные пациента).

---

### 6. TestsController: важные детали

`src/tests/tests.controller.ts`:

- `POST /api/tests/start-session`:
  - при `assignmentId = "preview"`:
    - логирует вызов,
    - возвращает mock‑объект с `id: 'preview-session-<timestamp>'` без создания записей в БД;
  - при обычном UUID:
    - проверяет, что роль — `PATIENT`,
    - делегирует в `TestsService.startSession(user.id, assignmentId)`.

- `POST /api/tests/answer`:
  - принимает `SubmitAnswerDto`,
  - вызывает `TestsService.submitAnswer(...)`.

- `POST /api/tests/finish`:
  - принимает `FinishSessionDto`,
  - вызывает `TestsService.finishSession(...)`.

---

### 7. Tariffs / TariffModal

**Backend:**

- `GET /api/tariffs` (TariffsController + TariffsService):
  - возвращает тарифы с опциями `TariffOption[]`,
  - доступно для всех ролей (ADMIN/DOCTOR/PATIENT).

- `PUT /api/patient/tariff`:
  - требует роль `PATIENT`,
  - валидирует наличие пациента и тарифа,
  - обновляет `patient.tariffId`.

**Frontend (для понимания нейросети):**

- `TariffModal.vue`:
  - пропсы: `isOpen`, `currentTariffId`,
  - события: `close`, `tariff-selected`,
  - загружает `/tariffs`, выводит карточки,
  - при выборе отправляет `PUT /patient/tariff`.

---

### 8. Что важно не ломать

1. **URL‑контракт для v0**:
   - `userId`, `token`, `assignmentId`, `apiBaseUrl` — должны оставаться с теми же именами.
2. **Поведение start-session**:
   - `assignmentId = "preview"` — всегда mock‑ответ, без проверки ролей пациента, но защищено JWT.
3. **CORS + credentials**:
   - backend ожидает, что фронт/iframe будет вызывать API с `credentials: 'include'` и заголовком `Authorization`.
4. **Роли и Guards**:
   - Не снимать `@UseGuards(JwtAuthGuard, RolesGuard)` без очень серьёзной причины.
5. **Prisma schema**:
   - Любые изменения требуют обновления миграций и аккуратной работы с сидом (`prisma/seed.ts`).

---

### 9. Типичные задачи для нейросети

- Добавить новый эндпоинт (например, статистика по пациентам / врачам).
- Расширить профиль пациента/врача дополнительными полями.
- Добавить новые типы тренажёров или новые поля к существующим (`Trainer`, `Assignment`).
- Уточнить CORS/headers для новых фронтов (дополнительные домены, протоколы).
- Помочь с корректной интеграцией нового v0‑проекта:
  - как формировать URL,
  - как правильно использовать `apiBaseUrl` и `token`,
  - как использовать уже существующие эндпоинты `tests`.

