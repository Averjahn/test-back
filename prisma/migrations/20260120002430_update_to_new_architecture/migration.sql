-- Добавляем поле login в users (используем email как значение по умолчанию)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "login" TEXT;
UPDATE "users" SET "login" = "email" WHERE "login" IS NULL;
ALTER TABLE "users" ALTER COLUMN "login" SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "users_login_key" ON "users"("login");

-- Переименовываем таблицы
ALTER TABLE "patient_profiles" RENAME TO "patients";
ALTER TABLE "doctor_profiles" RENAME TO "doctors";
ALTER TABLE "doctor_patients" RENAME TO "patient_doctors";

-- Обновляем составной ключ для patient_doctors (меняем порядок полей)
ALTER TABLE "patient_doctors" DROP CONSTRAINT IF EXISTS "doctor_patients_pkey";
ALTER TABLE "patient_doctors" ADD CONSTRAINT "patient_doctors_pkey" PRIMARY KEY ("patientId", "doctorId");

-- Добавляем новые поля в patients
ALTER TABLE "patients" ADD COLUMN IF NOT EXISTS "birthDate" TIMESTAMP(3);
ALTER TABLE "patients" ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT;
ALTER TABLE "patients" ADD COLUMN IF NOT EXISTS "trustedContact" TEXT;
ALTER TABLE "patients" ADD COLUMN IF NOT EXISTS "tariffId" TEXT;

-- Создаем таблицу tariffs
CREATE TABLE IF NOT EXISTS "tariffs" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "discount" INTEGER NOT NULL DEFAULT 0,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tariffs_pkey" PRIMARY KEY ("id")
);

-- Создаем таблицу tariff_options
CREATE TABLE IF NOT EXISTS "tariff_options" (
    "id" TEXT NOT NULL,
    "tariffId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tariff_options_pkey" PRIMARY KEY ("id")
);

-- Добавляем внешний ключ для tariffId в patients
ALTER TABLE "patients" ADD CONSTRAINT "patients_tariffId_fkey" FOREIGN KEY ("tariffId") REFERENCES "tariffs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Добавляем внешний ключ для tariff_options
ALTER TABLE "tariff_options" ADD CONSTRAINT "tariff_options_tariffId_fkey" FOREIGN KEY ("tariffId") REFERENCES "tariffs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Создаем таблицу trainers
CREATE TABLE IF NOT EXISTS "trainers" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "iframeUrl" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trainers_pkey" PRIMARY KEY ("id")
);

-- Создаем таблицу assignments
CREATE TABLE IF NOT EXISTS "assignments" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assignments_pkey" PRIMARY KEY ("id")
);

-- Добавляем внешние ключи для assignments
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "trainers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Создаем таблицу test_sessions
CREATE TABLE IF NOT EXISTS "test_sessions" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "correct" INTEGER NOT NULL DEFAULT 0,
    "incorrect" INTEGER NOT NULL DEFAULT 0,
    "durationSec" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "test_sessions_pkey" PRIMARY KEY ("id")
);

-- Добавляем внешний ключ для test_sessions
ALTER TABLE "test_sessions" ADD CONSTRAINT "test_sessions_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Создаем таблицу test_answers
CREATE TABLE IF NOT EXISTS "test_answers" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answer" JSONB NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "test_answers_pkey" PRIMARY KEY ("id")
);

-- Добавляем внешний ключ для test_answers
ALTER TABLE "test_answers" ADD CONSTRAINT "test_answers_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "test_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Создаем таблицу medical_data
CREATE TABLE IF NOT EXISTS "medical_data" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medical_data_pkey" PRIMARY KEY ("id")
);

-- Добавляем внешний ключ для medical_data
ALTER TABLE "medical_data" ADD CONSTRAINT "medical_data_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Обновляем названия ограничений внешних ключей для переименованных таблиц
DO $$
BEGIN
    -- Обновляем constraint names для patients
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'patient_profiles_userId_fkey') THEN
        ALTER TABLE "patients" RENAME CONSTRAINT "patient_profiles_userId_fkey" TO "patients_userId_fkey";
    END IF;

    -- Обновляем constraint names для doctors
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'doctor_profiles_userId_fkey') THEN
        ALTER TABLE "doctors" RENAME CONSTRAINT "doctor_profiles_userId_fkey" TO "doctors_userId_fkey";
    END IF;

    -- Обновляем constraint names для patient_doctors
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'doctor_patients_doctorId_fkey') THEN
        ALTER TABLE "patient_doctors" RENAME CONSTRAINT "doctor_patients_doctorId_fkey" TO "patient_doctors_doctorId_fkey";
    END IF;
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'doctor_patients_patientId_fkey') THEN
        ALTER TABLE "patient_doctors" RENAME CONSTRAINT "doctor_patients_patientId_fkey" TO "patient_doctors_patientId_fkey";
    END IF;
END $$;
