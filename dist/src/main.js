"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const path_1 = require("path");
const fs_1 = require("fs");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const app_module_1 = require("./app.module");
async function bootstrap() {
    const uploadsDir = (0, path_1.join)(process.cwd(), 'uploads');
    const documentsDir = (0, path_1.join)(uploadsDir, 'documents');
    const diaryDir = (0, path_1.join)(uploadsDir, 'diary');
    const avatarsDir = (0, path_1.join)(uploadsDir, 'avatars');
    [uploadsDir, documentsDir, diaryDir, avatarsDir].forEach((dir) => {
        if (!(0, fs_1.existsSync)(dir)) {
            try {
                (0, fs_1.mkdirSync)(dir, { recursive: true });
                console.log(`Created directory: ${dir}`);
            }
            catch (error) {
                console.error(`Failed to create directory ${dir}:`, error);
            }
        }
    });
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.use((0, cookie_parser_1.default)());
    app.useStaticAssets((0, path_1.join)(process.cwd(), 'uploads'), {
        prefix: '/uploads/',
    });
    const allowedOrigins = [
        'http://localhost:3001',
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'https://v0-test.vercel.app',
        'https://v0-test-web-application.vercel.app',
    ];
    app.enableCors({
        origin: (origin, callback) => {
            if (!origin) {
                console.log('CORS: Request without origin - allowing');
                return callback(null, true);
            }
            console.log('CORS: Checking origin:', origin);
            if (origin.includes('vercel.app')) {
                console.log('CORS: ✅ Vercel.app domain - allowing:', origin);
                return callback(null, true);
            }
            if (origin.includes('onrender.com')) {
                console.log('CORS: ✅ Render.com domain - allowing:', origin);
                return callback(null, true);
            }
            if (origin.includes('ngrok.io') || origin.includes('ngrok-free.app') || origin.includes('ngrok.app')) {
                console.log('CORS: ✅ Ngrok domain - allowing:', origin);
                return callback(null, true);
            }
            if (origin.includes('trycloudflare.com') || origin.includes('cloudflare.com')) {
                console.log('CORS: ✅ Cloudflare tunnel domain - allowing:', origin);
                return callback(null, true);
            }
            if (origin.includes('loca.lt') || origin.includes('localtunnel.me')) {
                console.log('CORS: ✅ Localtunnel domain - allowing:', origin);
                return callback(null, true);
            }
            if (origin.includes('tuna.am')) {
                console.log('CORS: ✅ Tuna.am domain - allowing:', origin);
                return callback(null, true);
            }
            if (allowedOrigins.includes(origin)) {
                console.log('CORS: ✅ Origin in allowedOrigins - allowing:', origin);
                return callback(null, true);
            }
            if (origin.startsWith('http://localhost:') ||
                origin.startsWith('http://127.0.0.1:')) {
                console.log('CORS: ✅ Localhost origin - allowing:', origin);
                return callback(null, true);
            }
            if (process.env.NODE_ENV === 'production') {
                console.log('CORS: ❌ Origin not allowed in production:', origin);
                return callback(new Error('Not allowed by CORS'));
            }
            console.log('CORS: ⚠️  Origin allowed in dev mode (not in allowlist):', origin);
            return callback(null, true);
        },
        credentials: true,
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'Accept',
            'Origin',
            'X-Requested-With',
            'Access-Control-Request-Method',
            'Access-Control-Request-Headers',
        ],
        exposedHeaders: ['Authorization'],
        preflightContinue: false,
        optionsSuccessStatus: 204,
        maxAge: 86400,
    });
    app.use((req, res, next) => {
        const origin = req.headers.origin;
        if (origin && (origin.includes('vercel.app') ||
            origin.includes('ngrok') ||
            origin.includes('trycloudflare.com') ||
            origin.includes('loca.lt') ||
            origin.includes('localtunnel.me'))) {
            const cspValue = `frame-ancestors 'self' ${origin} https://*.vercel.app https://*.ngrok-free.app https://*.ngrok.io https://*.trycloudflare.com https://*.loca.lt;`;
            res.setHeader('Content-Security-Policy', cspValue);
            console.log(`[CSP] Set frame-ancestors for origin: ${origin}`);
        }
        next();
    });
    const config = new swagger_1.DocumentBuilder()
        .setTitle('MPRO API')
        .setDescription('API для медицинской платформы MPRO')
        .setVersion('1.0')
        .addBearerAuth()
        .addCookieAuth('access_token')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`Application is running on: http://localhost:${port}`);
    console.log(`Swagger documentation: http://localhost:${port}/api/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map