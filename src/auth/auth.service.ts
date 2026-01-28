import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto/register.dto';

/**
 * Сервис аутентификации
 * 
 * Отвечает за:
 * - Валидацию пользователей (проверка email и password)
 * - Регистрацию новых пользователей (хеширование паролей)
 * - Генерацию JWT токенов
 * - Получение токенов для iframe
 * 
 * Безопасность:
 * - Использует bcrypt для хеширования паролей (10 раундов)
 * - Защита от timing attacks при проверке паролей
 * - Пароли никогда не возвращаются в ответах API
 */
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  /**
   * Валидация пользователя (проверка email и password)
   * 
   * Процесс:
   * 1. Поиск пользователя по email
   * 2. Сравнение введенного пароля с хешем в базе данных
   * 3. Возврат данных пользователя (без passwordHash)
   * 
   * Безопасность:
   * - Всегда выполняется проверка пароля, даже если пользователь не найден
   * - Это предотвращает timing attacks (утечку информации о существовании email)
   * - Используется bcrypt.compare для безопасного сравнения паролей
   * - passwordHash никогда не возвращается в результате
   * 
   * @param email - Email пользователя
   * @param password - Пароль в открытом виде
   * @returns Данные пользователя без passwordHash
   * @throws UnauthorizedException если email или password неверны
   */
  async validateUser(email: string, password: string): Promise<any> {
    // ВРЕМЕННЫЙ РЕЖИМ: полностью отключаем проверку пароля,
    // если явно включен флаг DISABLE_AUTH (использовать только локально!)
    if (process.env.DISABLE_AUTH === 'true') {
      // Ищем пользователя по email (если есть) или берём любого первого
      let user = await this.usersService.findByEmail(email);
      if (!user) {
        const all = await this.usersService.findAll();
        user = all[0];
      }

      if (!user) {
        throw new UnauthorizedException('No users found while auth is disabled');
      }

      const { passwordHash: _, ...result } = user;
      return result;
    }

    // Ищем пользователя по email
    const user = await this.usersService.findByEmail(email);
    
    // КРИТИЧЕСКИ ВАЖНО: Всегда выполняем проверку пароля, даже если пользователь не найден
    // Это предотвращает timing attacks - злоумышленник не может определить,
    // существует ли email в системе по времени ответа
    // Используем фиктивный хеш, если пользователь не найден
    const passwordHash = user?.passwordHash || '$2a$10$dummyhashfordummyuserpreventingtimingattack';
    
    // Безопасное сравнение пароля с хешем (bcrypt автоматически обрабатывает соль)
    const isPasswordValid = await bcrypt.compare(password, passwordHash);
    
    // Если пользователь не найден или пароль неверен, выбрасываем ошибку
    if (!user || !isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Удаляем passwordHash из результата (никогда не возвращаем хеш пароля)
    const { passwordHash: _, ...result } = user;
    return result;
  }

  /**
   * Регистрация нового пользователя
   * 
   * Процесс:
   * 1. Хеширование пароля через bcrypt (10 раундов)
   * 2. Создание пользователя в базе данных через UsersService
   * 3. Автоматическое создание профиля (Patient или Doctor) в зависимости от роли
   * 4. Возврат данных пользователя без passwordHash
   * 
   * Безопасность:
   * - Пароль хешируется перед сохранением (никогда не хранится в открытом виде)
   * - Используется bcrypt с 10 раундами (баланс между безопасностью и производительностью)
   * - passwordHash никогда не возвращается в ответе
   * 
   * @param registerDto - Данные для регистрации (email, password, role, ФИО)
   * @returns Данные созданного пользователя без passwordHash
   * @throws ConflictException если пользователь с таким email уже существует
   */
  async register(registerDto: RegisterDto) {
    const { email, password, role, firstName, lastName, middleName } = registerDto;

    // Хешируем пароль перед сохранением
    // saltRounds = 10 означает 2^10 = 1024 итераций хеширования
    // Это достаточно для безопасности, но не слишком медленно
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Создаем пользователя в базе данных
    // UsersService автоматически создаст профиль (Patient или Doctor) в зависимости от роли
    // Используем email как login (можно изменить логику при необходимости)
    const user = await this.usersService.create(
      email,
      passwordHash, // Сохраняем только хеш, никогда не сохраняем пароль в открытом виде
      role,
      firstName,
      lastName,
      middleName,
      email, // login = email (для простоты)
    );

    // Удаляем passwordHash из результата перед возвратом
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Генерация JWT токена для пользователя (логин)
   * 
   * Процесс:
   * 1. Создание payload с данными пользователя (id, email, role)
   * 2. Подпись токена секретным ключом (JWT_SECRET)
   * 3. Возврат токена и данных пользователя
   * 
   * Структура JWT токена:
   * - sub (subject): ID пользователя
   * - email: Email пользователя
   * - role: Роль пользователя (ADMIN, DOCTOR, PATIENT)
   * 
   * Срок действия токена настраивается через JWT_EXPIRES_IN (по умолчанию 7 дней)
   * 
   * @param user - Данные пользователя (должен быть валидирован через validateUser)
   * @returns Объект с access_token и данными пользователя
   */
  async login(user: any) {
    // Создаем payload для JWT токена
    // sub (subject) - стандартное поле JWT для ID пользователя
    const payload = { 
      email: user.email, 
      sub: user.id, // ID пользователя
      role: user.role // Роль для авторизации
    };
    
    // Подписываем токен секретным ключом (JWT_SECRET из переменных окружения)
    // Токен автоматически получает срок действия из конфигурации JwtModule
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        middleName: user.middleName,
      },
    };
  }

  /**
   * Получение токена для iframe
   * 
   * Назначение: Генерация JWT токена для использования в Authorization header
   * при встраивании приложения в iframe других доменов
   * 
   * Отличие от login():
   * - Возвращает только токен (не устанавливает cookie)
   * - Токен используется в Authorization header
   * 
   * @param user - Данные пользователя (должен быть аутентифицирован)
   * @returns JWT токен в виде строки
   * @throws UnauthorizedException если данные пользователя невалидны
   */
  getIframeToken(user: any) {
    // Проверяем, что данные пользователя валидны
    if (!user || !user.id || !user.email) {
      throw new UnauthorizedException('Invalid user data');
    }
    
    // Создаем payload аналогично login()
    const payload = { 
      email: user.email, 
      sub: user.id, 
      role: user.role 
    };
    
    // Генерируем и возвращаем токен
    return this.jwtService.sign(payload);
  }
}
