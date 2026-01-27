import { Controller, Post, Body, HttpCode, HttpStatus, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

/**
 * Контроллер аутентификации
 * 
 * Отвечает за:
 * - Регистрацию новых пользователей
 * - Вход в систему (логин)
 * - Выход из системы (логаут)
 * - Получение токена для iframe (для встраивания в другие приложения)
 * 
 * Все endpoints работают с JWT токенами, которые устанавливаются в HttpOnly cookies
 * для безопасности (защита от XSS атак)
 */
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Регистрация нового пользователя
   * 
   * Процесс:
   * 1. Валидация входных данных (email, password, role, ФИО)
   * 2. Хеширование пароля через bcrypt (10 раундов)
   * 3. Создание пользователя в базе данных
   * 4. Автоматический вход после регистрации (генерация JWT токена)
   * 5. Установка токена в HttpOnly cookie
   * 
   * Безопасность:
   * - Пароль никогда не хранится в открытом виде
   * - HttpOnly cookie защищает от XSS атак
   * - sameSite: 'lax' защищает от CSRF атак
   * 
   * @param registerDto - Данные для регистрации (email, password, role, ФИО)
   * @param res - Express Response объект для установки cookies
   * @returns Объект с данными пользователя (без пароля)
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'User registration' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 409, description: 'User with this email already exists' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async register(@Body() registerDto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    // Создаем пользователя в базе данных
    const user = await this.authService.register(registerDto);
    
    // Автоматически логиним пользователя после регистрации
    const result = await this.authService.login(user);
    
    // Устанавливаем JWT токен в HttpOnly cookie
    // httpOnly: true - cookie недоступна для JavaScript (защита от XSS)
    // secure: true в production - cookie передается только по HTTPS
    // sameSite: 'lax' - защита от CSRF атак
    // maxAge: 7 дней - срок действия токена
    res.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней в миллисекундах
    });

    // Возвращаем данные пользователя (без токена в теле ответа для безопасности)
    return {
      user: result.user,
    };
  }

  /**
   * Вход в систему (логин)
   * 
   * Процесс:
   * 1. Валидация email и password
   * 2. Поиск пользователя по email
   * 3. Сравнение пароля с хешем в базе данных (bcrypt.compare)
   * 4. Генерация JWT токена с данными пользователя (id, email, role)
   * 5. Установка токена в HttpOnly cookie
   * 
   * Безопасность:
   * - Защита от timing attacks (всегда выполняется проверка пароля)
   * - HttpOnly cookie защищает от XSS
   * - При неверных credentials выбрасывается общая ошибка (не раскрывает, существует ли email)
   * 
   * @param loginDto - Email и password пользователя
   * @param res - Express Response объект для установки cookies
   * @returns Объект с данными пользователя
   * @throws UnauthorizedException если email или password неверны
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiBody({
    type: LoginDto,
    examples: {
      default: {
        summary: 'Login as patient',
        value: {
          email: 'patient@example.com',
          password: 'password123',
        },
      },
      doctor: {
        summary: 'Login as doctor',
        value: {
          email: 'doctor@example.com',
          password: 'password123',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      example: {
        user: {
          id: 'uuid',
          email: 'patient@example.com',
          role: 'PATIENT',
          firstName: 'Иван',
          lastName: 'Иванов',
          middleName: 'Иванович',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
    schema: {
      example: {
        statusCode: 401,
        message: 'Invalid credentials',
        error: 'Unauthorized',
      },
    },
  })
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    // Проверяем email и password, получаем пользователя
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    
    // Генерируем JWT токен для пользователя
    const result = await this.authService.login(user);
    
    // Устанавливаем JWT токен в HttpOnly cookie
    // Аналогично регистрации, для безопасности
    res.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней
    });

    // Возвращаем данные пользователя (без токена)
    return {
      user: result.user,
    };
  }

  /**
   * Выход из системы (логаут)
   * 
   * Процесс:
   * 1. Удаление HttpOnly cookie с токеном
   * 
   * Примечание: JWT токены stateless, поэтому инвалидация токена на сервере
   * не требуется. Токен просто удаляется из cookie клиента.
   * 
   * @param res - Express Response объект для удаления cookie
   * @returns Сообщение об успешном выходе
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout(@Res({ passthrough: true }) res: Response) {
    // Удаляем cookie с токеном
    res.clearCookie('access_token');
    return { message: 'Logged out successfully' };
  }

  /**
   * Получение токена для iframe
   * 
   * Назначение: Для встраивания приложения в iframe других доменов
   * (например, v0 проекты на Vercel)
   * 
   * Процесс:
   * 1. Проверка аутентификации через JwtAuthGuard
   * 2. Генерация нового JWT токена для текущего пользователя
   * 3. Возврат токена в теле ответа (для использования в Authorization header)
   * 
   * Безопасность:
   * - Требуется аутентификация (JwtAuthGuard)
   * - Токен генерируется только для уже аутентифицированных пользователей
   * 
   * @param user - Текущий пользователь (извлекается из JWT токена через @CurrentUser)
   * @returns Токен и ID пользователя
   */
  @Post('iframe-token')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard) // Требуется аутентификация
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get token for iframe' })
  @ApiResponse({ status: 200, description: 'Token for iframe' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getIframeToken(@CurrentUser() user: any) {
    // Генерируем новый токен для использования в iframe
    const token = this.authService.getIframeToken(user);
    
    return {
      token,
      userId: user.id,
    };
  }
}
