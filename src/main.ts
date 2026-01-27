import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

/**
 * Точка входа приложения
 * 
 * Функция bootstrap() инициализирует NestJS приложение и настраивает:
 * - Глобальную валидацию данных
 * - CORS политику
 * - Статическую раздачу файлов
 * - Swagger документацию
 * - Cookie parser для JWT токенов
 * 
 * Порядок инициализации:
 * 1. Создание необходимых директорий для загрузки файлов
 * 2. Создание NestJS приложения
 * 3. Настройка глобальных middleware и pipes
 * 4. Настройка CORS
 * 5. Настройка Swagger
 * 6. Запуск сервера
 */
async function bootstrap() {
  // ============================================
  // ШАГ 1: Создание директорий для загрузки файлов
  // ============================================
  // Создаем необходимые директории для загрузки файлов, если их нет
  // Это важно для Docker контейнеров, где директории могут не существовать
  const uploadsDir = join(process.cwd(), 'uploads');
  const documentsDir = join(uploadsDir, 'documents');  // Документы пациентов
  const diaryDir = join(uploadsDir, 'diary');          // Файлы дневника (если будут)
  const avatarsDir = join(uploadsDir, 'avatars');      // Аватары пользователей

  // Создаем все директории рекурсивно
  [uploadsDir, documentsDir, diaryDir, avatarsDir].forEach((dir) => {
    if (!existsSync(dir)) {
      try {
        mkdirSync(dir, { recursive: true }); // recursive: true создает все родительские директории
        console.log(`Created directory: ${dir}`);
      } catch (error) {
        // Не прерываем запуск приложения, но логируем ошибку
        // Это позволяет приложению запуститься даже если есть проблемы с правами доступа
        console.error(`Failed to create directory ${dir}:`, error);
      }
    }
  });

  // ============================================
  // ШАГ 2: Создание NestJS приложения
  // ============================================
  // Создаем приложение с типом NestExpressApplication для доступа к Express методам
  // Это нужно для использования app.useStaticAssets() и других Express функций
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // ============================================
  // ШАГ 3: Настройка глобальных параметров
  // ============================================
  
  // Глобальный префикс API
  // Все routes будут иметь префикс /api
  // Например: /auth/login → /api/auth/login
  app.setGlobalPrefix('api');

  // Глобальная валидация данных через class-validator
  // ValidationPipe автоматически валидирует все DTO на основе декораторов
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,              // Удаляет поля, не описанные в DTO (защита от mass assignment)
      forbidNonWhitelisted: true,   // Выбрасывает ошибку при наличии лишних полей
      transform: true,               // Автоматически преобразует типы (string → number, и т.д.)
    }),
  );

  // Cookie parser для работы с HttpOnly cookies
  // Позволяет читать cookies из запросов (нужно для JWT токенов в cookies)
  app.use(cookieParser());

  // Настройка статической раздачи файлов
  // Файлы из директории uploads/ доступны по URL /uploads/...
  // Например: /uploads/avatars/avatar-123.jpg
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/', // Префикс URL для доступа к файлам
  });

  // ============================================
  // ШАГ 4: Настройка CORS (Cross-Origin Resource Sharing)
  // ============================================
  // CORS настройка - ЯВНЫЙ ALLOWLIST (рекомендуемый подход)
  // КРИТИЧЕСКИ ВАЖНО: С credentials: true нельзя использовать wildcard '*'
  // 
  // CORS позволяет браузеру делать запросы с одного домена (frontend) на другой (backend)
  // Без CORS браузер блокирует такие запросы из соображений безопасности
  //
  // Список разрешенных origins (доменов, с которых можно делать запросы)
  const allowedOrigins = [
    // Локальная разработка (разные порты для разных окружений)
    'http://localhost:3001',
    'http://localhost:5173', // Vite dev server (обычный порт)
    'http://localhost:5174', // Vite dev server (если 5173 занят)
    'http://localhost:5175', // Vite dev server (если предыдущие заняты)
    // v0 проекты на Vercel (для встраивания в iframe)
    'https://v0-test.vercel.app',
    'https://v0-test-web-application.vercel.app',
    // Render хостинг (для фронта и v0)
    // Добавь сюда URL твоего фронта на Vercel/Render когда задеплоишь
  ];
  
  // Настройка CORS согласно best practices для iframe + Authorization header
  app.enableCors({
    // Функция для проверки origin (домена, с которого приходит запрос)
    origin: (origin, callback) => {
      // Разрешаем запросы без origin (Postman, curl, server-to-server запросы)
      // Такие запросы не идут из браузера, поэтому CORS не применяется
      if (!origin) {
        console.log('CORS: Request without origin - allowing');
        return callback(null, true);
      }
      
      console.log('CORS: Checking origin:', origin);
      
      // КРИТИЧЕСКИ ВАЖНО: Разрешаем все vercel.app домены (для v0 проекта в iframe)
      // С credentials: true нельзя использовать wildcard '*', поэтому проверяем явно
      // Это позволяет встраивать приложение в iframe на Vercel
      if (origin.includes('vercel.app')) {
        console.log('CORS: ✅ Vercel.app domain - allowing:', origin);
        return callback(null, true);
      }
      
      // Разрешаем все onrender.com домены (для фронта на Render)
      if (origin.includes('onrender.com')) {
        console.log('CORS: ✅ Render.com domain - allowing:', origin);
        return callback(null, true);
      }
      
      // Разрешаем все ngrok домены (для разработки через ngrok туннель)
      // Ngrok создает публичный URL для локального сервера
      if (origin.includes('ngrok.io') || origin.includes('ngrok-free.app') || origin.includes('ngrok.app')) {
        console.log('CORS: ✅ Ngrok domain - allowing:', origin);
        return callback(null, true);
      }
      
      // Разрешаем все cloudflare tunnel домены (альтернатива ngrok)
      if (origin.includes('trycloudflare.com') || origin.includes('cloudflare.com')) {
        console.log('CORS: ✅ Cloudflare tunnel domain - allowing:', origin);
        return callback(null, true);
      }
      
      // Разрешаем localtunnel домены (еще одна альтернатива ngrok)
      if (origin.includes('loca.lt') || origin.includes('localtunnel.me')) {
        console.log('CORS: ✅ Localtunnel domain - allowing:', origin);
        return callback(null, true);
      }

      // Разрешаем tuna.am домены (туннель для локального backend)
      if (origin.includes('tuna.am')) {
        console.log('CORS: ✅ Tuna.am domain - allowing:', origin);
        return callback(null, true);
      }
      
      // Проверяем явный allowlist (список разрешенных доменов выше)
      if (allowedOrigins.includes(origin)) {
        console.log('CORS: ✅ Origin in allowedOrigins - allowing:', origin);
        return callback(null, true);
      }
      
      // В dev режиме разрешаем все localhost origins (для удобства разработки)
      // Это позволяет использовать любой порт на localhost
      if (
        origin.startsWith('http://localhost:') || 
        origin.startsWith('http://127.0.0.1:')
      ) {
        console.log('CORS: ✅ Localhost origin - allowing:', origin);
        return callback(null, true);
      }
      
      // В production блокируем неизвестные origins (безопасность)
      if (process.env.NODE_ENV === 'production') {
        console.log('CORS: ❌ Origin not allowed in production:', origin);
        return callback(new Error('Not allowed by CORS'));
      }
      
      // В dev режиме разрешаем все остальное (для отладки)
      // ВНИМАНИЕ: Это небезопасно для production!
      console.log('CORS: ⚠️  Origin allowed in dev mode (not in allowlist):', origin);
      return callback(null, true);
    },
    // КРИТИЧЕСКИ ВАЖНО: credentials: true обязателен для Authorization header и cookies
    // При этом НЕЛЬЗЯ использовать wildcard '*' в origin - только конкретные домены
    // credentials: true позволяет отправлять cookies и Authorization header
    credentials: true,
    
    // Все HTTP методы, которые разрешены
    // OPTIONS нужен для CORS preflight запросов
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    
    // Заголовки, которые разрешено отправлять в запросах
    // КРИТИЧЕСКИ ВАЖНО: Authorization должен быть в allowedHeaders для preflight
    allowedHeaders: [
      'Content-Type',
      'Authorization', // Обязательно для JWT токенов в Authorization header
      'Accept',
      'Origin',
      'X-Requested-With',
      'Access-Control-Request-Method',
      'Access-Control-Request-Headers',
    ],
    
    // Заголовки, которые клиент может читать из response
    // Authorization может быть возвращен в ответе (для iframe токенов)
    exposedHeaders: ['Authorization'],
    
    // NestJS автоматически обработает preflight, не продолжаем цепочку middleware
    // preflight - это OPTIONS запрос, который браузер отправляет перед основным запросом
    preflightContinue: false,
    
    // Статус для успешного OPTIONS запроса (204 No Content)
    // Браузер ожидает этот статус для успешного preflight
    optionsSuccessStatus: 204,
    
    // Кэширование preflight запросов на 24 часа (в секундах)
    // Это уменьшает количество OPTIONS запросов от браузера
    maxAge: 86400,
  });

  // ============================================
  // ШАГ 5: Настройка Content Security Policy (CSP) для iframe
  // ============================================
  // Настройка заголовков для iframe embedding (CSP frame-ancestors)
  // ВАЖНО: Этот middleware должен быть ПОСЛЕ enableCors
  //
  // CSP frame-ancestors определяет, какие домены могут встраивать приложение в iframe
  // Это защита от clickjacking атак
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    
    // Разрешаем embedding в iframe для определенных доменов
    // Это нужно для встраивания приложения в v0 проекты на Vercel
    if (origin && (
      origin.includes('vercel.app') || 
      origin.includes('ngrok') || 
      origin.includes('trycloudflare.com') ||
      origin.includes('loca.lt') ||
      origin.includes('localtunnel.me')
    )) {
      // Для современных браузеров используем CSP frame-ancestors
      // 'self' - разрешает embedding на том же домене
      // ${origin} - разрешает embedding на домене запроса
      // https://*.vercel.app и т.д. - разрешает embedding на поддоменах
      const cspValue = `frame-ancestors 'self' ${origin} https://*.vercel.app https://*.ngrok-free.app https://*.ngrok.io https://*.trycloudflare.com https://*.loca.lt;`;
      res.setHeader('Content-Security-Policy', cspValue);
      console.log(`[CSP] Set frame-ancestors for origin: ${origin}`);
    }
    
    next();
  });

  // ============================================
  // ШАГ 6: Настройка Swagger документации
  // ============================================
  // Swagger (OpenAPI) - автоматическая документация API
  // Доступна по адресу: http://localhost:3000/api/docs
  const config = new DocumentBuilder()
    .setTitle('MPRO API')
    .setDescription('API для медицинской платформы MPRO')
    .setVersion('1.0')
    .addBearerAuth()                    // Поддержка JWT токенов в Authorization header
    .addCookieAuth('access_token')      // Поддержка JWT токенов в cookies
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // ============================================
  // ШАГ 7: Запуск сервера
  // ============================================
  // Получаем порт из переменных окружения или используем 3000 по умолчанию
  const port = process.env.PORT || 3000;
  
  // Запускаем сервер на указанном порту
  await app.listen(port);
  
  // Выводим информацию о запуске
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation: http://localhost:${port}/api/docs`);
}

// Запускаем приложение
bootstrap();
