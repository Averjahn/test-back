import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Глобальный префикс API
  app.setGlobalPrefix('api');

  // Валидация
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Cookie parser для JWT в HttpOnly cookies
  app.use(cookieParser());

  // CORS настройка - ЯВНЫЙ ALLOWLIST (рекомендуемый подход)
  // КРИТИЧЕСКИ ВАЖНО: С credentials: true нельзя использовать wildcard '*'
  const allowedOrigins = [
    // Локальная разработка
    'http://localhost:3001',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    // v0 проекты на Vercel
    'https://v0-test.vercel.app',
    'https://v0-test-web-application.vercel.app',
  ];
  
  // CORS настройка согласно best practices для iframe + Authorization header
  app.enableCors({
    origin: (origin, callback) => {
      // Разрешаем запросы без origin (Postman, curl, server-to-server)
      if (!origin) {
        console.log('CORS: Request without origin - allowing');
        return callback(null, true);
      }
      
      console.log('CORS: Checking origin:', origin);
      
      // КРИТИЧЕСКИ ВАЖНО: Разрешаем все vercel.app домены (для v0 проекта в iframe)
      // С credentials: true нельзя использовать wildcard '*', поэтому проверяем явно
      if (origin.includes('vercel.app')) {
        console.log('CORS: ✅ Vercel.app domain - allowing:', origin);
        return callback(null, true);
      }
      
      // Разрешаем все ngrok домены (для разработки через ngrok туннель)
      if (origin.includes('ngrok.io') || origin.includes('ngrok-free.app') || origin.includes('ngrok.app')) {
        console.log('CORS: ✅ Ngrok domain - allowing:', origin);
        return callback(null, true);
      }
      
      // Разрешаем все cloudflare tunnel домены (альтернатива ngrok)
      if (origin.includes('trycloudflare.com') || origin.includes('cloudflare.com')) {
        console.log('CORS: ✅ Cloudflare tunnel domain - allowing:', origin);
        return callback(null, true);
      }
      
      // Разрешаем localtunnel домены
      if (origin.includes('loca.lt') || origin.includes('localtunnel.me')) {
        console.log('CORS: ✅ Localtunnel domain - allowing:', origin);
        return callback(null, true);
      }
      
      // Проверяем явный allowlist
      if (allowedOrigins.includes(origin)) {
        console.log('CORS: ✅ Origin in allowedOrigins - allowing:', origin);
        return callback(null, true);
      }
      
      // В dev режиме разрешаем все localhost origins
      if (
        origin.startsWith('http://localhost:') || 
        origin.startsWith('http://127.0.0.1:')
      ) {
        console.log('CORS: ✅ Localhost origin - allowing:', origin);
        return callback(null, true);
      }
      
      // В production блокируем неизвестные origins
      if (process.env.NODE_ENV === 'production') {
        console.log('CORS: ❌ Origin not allowed in production:', origin);
        return callback(new Error('Not allowed by CORS'));
      }
      
      // В dev режиме разрешаем все остальное (для отладки)
      console.log('CORS: ⚠️  Origin allowed in dev mode (not in allowlist):', origin);
      return callback(null, true);
    },
    // КРИТИЧЕСКИ ВАЖНО: credentials: true обязателен для Authorization header и cookies
    // При этом НЕЛЬЗЯ использовать wildcard '*' в origin - только конкретные домены
    credentials: true,
    // Все методы, включая OPTIONS для preflight
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    // КРИТИЧЕСКИ ВАЖНО: Authorization должен быть в allowedHeaders для preflight
    allowedHeaders: [
      'Content-Type',
      'Authorization', // Обязательно для JWT токенов
      'Accept',
      'Origin',
      'X-Requested-With',
      'Access-Control-Request-Method',
      'Access-Control-Request-Headers',
    ],
    // Заголовки, которые клиент может читать из response
    exposedHeaders: ['Authorization'],
    // NestJS автоматически обработает preflight, не продолжаем цепочку middleware
    preflightContinue: false,
    // Статус для успешного OPTIONS запроса (204 No Content)
    optionsSuccessStatus: 204,
    // Кэширование preflight запросов на 24 часа
    maxAge: 86400,
  });

  // Настройка заголовков для iframe embedding (CSP frame-ancestors)
  // ВАЖНО: Этот middleware должен быть ПОСЛЕ enableCors
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    
    // Разрешаем embedding в iframe для vercel.app, ngrok, cloudflare и localtunnel доменов
    if (origin && (
      origin.includes('vercel.app') || 
      origin.includes('ngrok') || 
      origin.includes('trycloudflare.com') ||
      origin.includes('loca.lt') ||
      origin.includes('localtunnel.me')
    )) {
      // Для современных браузеров используем CSP frame-ancestors
      const cspValue = `frame-ancestors 'self' ${origin} https://*.vercel.app https://*.ngrok-free.app https://*.ngrok.io https://*.trycloudflare.com https://*.loca.lt;`;
      res.setHeader('Content-Security-Policy', cspValue);
      console.log(`[CSP] Set frame-ancestors for origin: ${origin}`);
    }
    
    next();
  });

  // Swagger документация
  const config = new DocumentBuilder()
    .setTitle('MPRO API')
    .setDescription('API для медицинской платформы MPRO')
    .setVersion('1.0')
    .addBearerAuth()
    .addCookieAuth('access_token')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation: http://localhost:${port}/api/docs`);
}
bootstrap();
