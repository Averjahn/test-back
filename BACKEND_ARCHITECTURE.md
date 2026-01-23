# Архитектура бэкенда - Визуальная схема

## 📊 Схема базы данных (ERD)

```mermaid
erDiagram
    User ||--o| Doctor : "has"
    User ||--o| Patient : "has"
    Doctor ||--o{ AppointmentSchedule : "has"
    Doctor ||--o{ Appointment : "creates"
    Doctor ||--o{ PatientDoctor : "treats"
    Doctor ||--o{ Assignment : "assigns"
    Patient ||--o{ PatientDoctor : "assigned_to"
    Patient ||--o{ Appointment : "books"
    Patient ||--o{ Assignment : "has"
    Patient ||--o{ DiaryEntry : "writes"
    Patient ||--o{ MedicalData : "has"
    Patient ||--o{ Document : "has"
    Assignment ||--o{ TestSession : "generates"
    TestSession ||--o{ TestAnswer : "contains"
    Trainer ||--o{ Assignment : "used_in"
    AppointmentSchedule ||--o{ Appointment : "defines_slots"
    
    User {
        string id PK
        string email UK
        string login UK
        string passwordHash
        enum role
        string firstName
        string lastName
        string middleName
        datetime createdAt
    }
    
    Doctor {
        string id PK
        string userId FK
        datetime createdAt
    }
    
    Patient {
        string id PK
        string userId FK
        datetime birthDate
        string avatarUrl
        string trustedContact
        string tariffId FK
        datetime createdAt
    }
    
    AppointmentSchedule {
        string id PK
        string doctorId FK
        int dayOfWeek
        string startTime
        string endTime
        int slotDuration
        boolean isActive
        datetime createdAt
    }
    
    Appointment {
        string id PK
        string patientId FK
        string doctorId FK
        datetime date
        string startTime
        string endTime
        string type
        string notes
        datetime createdAt
    }
    
    Assignment {
        string id PK
        string patientId FK
        string doctorId FK
        string trainerId FK
        datetime createdAt
    }
    
    TestSession {
        string id PK
        string assignmentId FK
        datetime startedAt
        datetime finishedAt
        int correct
        int incorrect
        int durationSec
    }
```

## 🔄 Процесс создания врача и его расписания

```mermaid
sequenceDiagram
    participant Admin
    participant AdminController
    participant AdminService
    participant UsersService
    participant Prisma
    participant DB

    Admin->>AdminController: POST /admin/doctors
    AdminController->>AdminService: createDoctor(dto)
    
    Note over AdminService: 1. Создание пользователя
    AdminService->>UsersService: create(email, passwordHash, DOCTOR, ...)
    UsersService->>Prisma: user.create()
    Prisma->>DB: INSERT INTO users
    DB-->>Prisma: user.id
    Prisma-->>UsersService: user
    
    Note over UsersService: 2. Создание профиля врача
    UsersService->>Prisma: doctor.create({ userId })
    Prisma->>DB: INSERT INTO doctors
    DB-->>Prisma: doctor.id
    Prisma-->>UsersService: doctor
    
    Note over AdminService: 3. Автоматическое создание расписания
    AdminService->>Prisma: appointmentSchedule.createMany()
    Note right of Prisma: Для всех дней недели (0-6):<br/>dayOfWeek: 0-6<br/>startTime: "08:00"<br/>endTime: "17:00"<br/>slotDuration: 30<br/>isActive: true
    Prisma->>DB: INSERT INTO appointment_schedules (7 записей)
    DB-->>Prisma: schedules created
    Prisma-->>AdminService: success
    
    AdminService-->>AdminController: doctor with schedules
    AdminController-->>Admin: 201 Created
```

## 📅 Процесс создания записи на прием

```mermaid
sequenceDiagram
    participant Admin
    participant AdminController
    participant AdminService
    participant Prisma
    participant DB

    Admin->>AdminController: POST /admin/doctors/:doctorId/appointments
    Note right of Admin: { patientId, date, startTime, type, notes }
    
    AdminController->>AdminService: createAppointment(doctorId, dto)
    
    Note over AdminService: 1. Проверка существования врача
    AdminService->>Prisma: doctor.findUnique({ id: doctorId })
    Prisma->>DB: SELECT * FROM doctors WHERE id = ?
    DB-->>Prisma: doctor
    Prisma-->>AdminService: doctor
    
    Note over AdminService: 2. Проверка существования пациента
    AdminService->>Prisma: patient.findUnique({ id: patientId })
    Prisma->>DB: SELECT * FROM patients WHERE id = ?
    DB-->>Prisma: patient
    Prisma-->>AdminService: patient
    
    Note over AdminService: 3. Получение расписания врача на день
    AdminService->>Prisma: appointmentSchedule.findFirst()
    Note right of Prisma: WHERE doctorId = ?<br/>AND dayOfWeek = ?<br/>AND isActive = true
    Prisma->>DB: SELECT * FROM appointment_schedules
    DB-->>Prisma: schedule OR null
    
    alt Расписание найдено
        Note over AdminService: Используем slotDuration из расписания
        AdminService->>AdminService: endTime = startTime + slotDuration
    else Расписание не найдено
        Note over AdminService: Используем дефолтное значение
        AdminService->>AdminService: endTime = startTime + 30 минут
    end
    
    Note over AdminService: 4. Проверка доступности слота
    AdminService->>Prisma: appointment.findFirst()
    Note right of Prisma: WHERE doctorId = ?<br/>AND date = ?<br/>AND startTime = ?
    Prisma->>DB: SELECT * FROM appointments
    DB-->>Prisma: existingAppointment OR null
    
    alt Слот занят
        AdminService-->>AdminController: ConflictException
        AdminController-->>Admin: 409 Conflict
    else Слот свободен
        Note over AdminService: 5. Создание записи
        AdminService->>Prisma: appointment.create()
        Prisma->>DB: INSERT INTO appointments
        DB-->>Prisma: appointment.id
        Prisma-->>AdminService: appointment
        
        AdminService-->>AdminController: appointment
        AdminController-->>Admin: 201 Created
    end
```

## 🔍 Процесс получения доступных временных слотов

```mermaid
sequenceDiagram
    participant Admin
    participant AdminController
    participant AdminService
    participant Prisma
    participant DB

    Admin->>AdminController: GET /admin/doctors/:doctorId/time-slots?date=2025-01-20
    AdminController->>AdminService: getTimeSlots(doctorId, date)
    
    Note over AdminService: 1. Определение дня недели
    AdminService->>AdminService: dayOfWeek = date.getDay()
    
    Note over AdminService: 2. Получение расписания врача
    AdminService->>Prisma: appointmentSchedule.findFirst()
    Note right of Prisma: WHERE doctorId = ?<br/>AND dayOfWeek = ?<br/>AND isActive = true
    Prisma->>DB: SELECT * FROM appointment_schedules
    DB-->>Prisma: schedule OR null
    
    alt Расписание найдено
        Note over AdminService: Используем расписание врача
        AdminService->>AdminService: startTime, endTime, slotDuration из schedule
    else Расписание не найдено
        Note over AdminService: Используем дефолтное расписание
        AdminService->>AdminService: startTime = "08:00"<br/>endTime = "17:00"<br/>slotDuration = 30
    end
    
    Note over AdminService: 3. Генерация всех возможных слотов
    AdminService->>AdminService: generateTimeSlots(startTime, endTime, slotDuration)
    Note right of AdminService: Пример:<br/>08:00, 08:30, 09:00, ...<br/>до 17:00
    
    Note over AdminService: 4. Получение существующих записей
    AdminService->>Prisma: appointment.findMany()
    Note right of Prisma: WHERE doctorId = ?<br/>AND date = ?
    Prisma->>DB: SELECT * FROM appointments
    DB-->>Prisma: appointments[]
    Prisma-->>AdminService: appointments
    
    Note over AdminService: 5. Маркировка занятых слотов
    AdminService->>AdminService: markBookedSlots(timeSlots, appointments)
    Note right of AdminService: Для каждого слота:<br/>available = !appointments.includes(slot)
    
    AdminService-->>AdminController: timeSlots[]
    AdminController-->>Admin: 200 OK
```

## 🛡️ Гарантии наличия расписания у всех врачей

```mermaid
flowchart TD
    A[Создание врача] --> B{Расписание создано<br/>автоматически?}
    B -->|Да| C[Врач имеет расписание<br/>7 дней × 08:00-17:00]
    B -->|Нет| D[Врач без расписания]
    
    E[Seed скрипт] --> F[Проверка всех врачей]
    F --> G{У врача есть<br/>расписание?}
    G -->|Да| H[Пропустить]
    G -->|Нет| I[Создать дефолтное расписание]
    I --> C
    
    J[API: POST /admin/doctors/initialize-schedules] --> F
    
    K[Создание записи на прием] --> L{Расписание найдено?}
    L -->|Да| M[Использовать slotDuration из расписания]
    L -->|Нет| N[Использовать дефолт: 30 минут]
    
    O[Получение временных слотов] --> P{Расписание найдено?}
    P -->|Да| Q[Использовать startTime/endTime из расписания]
    P -->|Нет| R[Использовать дефолт: 08:00-17:00]
    
    style C fill:#90EE90
    style I fill:#FFD700
    style N fill:#FFB6C1
    style R fill:#FFB6C1
```

## 📋 Ключевые моменты работы с расписаниями

### 1. **Создание врача** (`AdminService.createDoctor`)
- ✅ Автоматически создает расписание для всех 7 дней недели
- ✅ Дефолтные значения: 08:00-17:00, слоты по 30 минут
- ✅ Все записи помечаются как активные (`isActive: true`)

### 2. **Инициализация для существующих врачей** (`AdminService.initializeDefaultSchedulesForAllDoctors`)
- ✅ Проверяет всех врачей в системе
- ✅ Для врачей без расписания создает дефолтное
- ✅ Вызывается в seed скрипте автоматически
- ✅ Доступен через API: `POST /admin/doctors/initialize-schedules`

### 3. **Создание записи на прием** (`AdminService.createAppointment`)
- ✅ Проверяет существование врача и пациента
- ✅ Ищет расписание врача на конкретный день недели
- ✅ Если расписание не найдено → использует дефолт (30 минут)
- ✅ Проверяет уникальность слота (doctorId + date + startTime)
- ✅ Вычисляет endTime на основе slotDuration

### 4. **Получение временных слотов** (`AdminService.getTimeSlots`)
- ✅ Определяет день недели из даты
- ✅ Ищет расписание врача на этот день
- ✅ Если расписание не найдено → использует дефолт (08:00-17:00, 30 минут)
- ✅ Генерирует все возможные слоты
- ✅ Помечает занятые слоты на основе существующих записей

### 5. **Получение доступных дат** (`AdminService.getAvailableDates`)
- ✅ Получает все активные расписания врача
- ✅ Если расписаний нет → возвращает все будущие даты в диапазоне
- ✅ Генерирует список дат, на которые есть хотя бы один рабочий день

## 🔐 Зависимости и ограничения

### Внешние ключи (Foreign Keys)
- `Doctor.userId` → `User.id` (CASCADE DELETE)
- `Patient.userId` → `User.id` (CASCADE DELETE)
- `AppointmentSchedule.doctorId` → `Doctor.id` (CASCADE DELETE)
- `Appointment.doctorId` → `Doctor.id` (CASCADE DELETE)
- `Appointment.patientId` → `Patient.id` (CASCADE DELETE)

### Уникальные ограничения
- `Appointment`: `(doctorId, date, startTime)` - один слот может быть занят только одной записью
- `HiddenDocument`: `(patientId, documentId)` - один документ может быть скрыт только один раз

### Каскадное удаление
- При удалении `User` → автоматически удаляются связанные `Doctor`/`Patient`
- При удалении `Doctor` → автоматически удаляются `AppointmentSchedule` и `Appointment`
- При удалении `Patient` → автоматически удаляются `Appointment`, `DiaryEntry`, `MedicalData`, и т.д.

## ✅ Проверка корректности работы

### Тестовый сценарий:
1. **Создать нового врача** → Проверить, что создано 7 записей в `appointment_schedules`
2. **Создать запись на прием** → Проверить, что запись создана с корректным `endTime`
3. **Получить временные слоты** → Проверить, что занятые слоты помечены как `available: false`
4. **Вызвать initialize-schedules** → Проверить, что все врачи без расписания получили его

### SQL запросы для проверки:

```sql
-- Проверить всех врачей и их расписания
SELECT 
    d.id as doctor_id,
    u.firstName || ' ' || u.lastName as doctor_name,
    COUNT(as.id) as schedule_count
FROM doctors d
LEFT JOIN users u ON d.userId = u.id
LEFT JOIN appointment_schedules as ON as.doctorId = d.id
GROUP BY d.id, u.firstName, u.lastName;

-- Проверить записи на прием и их соответствие расписанию
SELECT 
    a.id,
    a.date,
    a.startTime,
    a.endTime,
    as.slotDuration,
    EXTRACT(EPOCH FROM (a.endTime::time - a.startTime::time))/60 as actual_duration_minutes
FROM appointments a
LEFT JOIN appointment_schedules as ON as.doctorId = a.doctorId 
    AND as.dayOfWeek = EXTRACT(DOW FROM a.date)
    AND as.isActive = true
ORDER BY a.date DESC, a.startTime;
```
