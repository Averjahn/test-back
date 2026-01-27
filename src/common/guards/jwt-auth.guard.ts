import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '@prisma/client';

/**
 * Guard для проверки JWT токена
 * 
 * Назначение: Первый уровень защиты - проверяет наличие и валидность JWT токена
 * 
 * Процесс работы:
 * 1. Извлекает токен из cookie (access_token) или Authorization header
 * 2. Проверяет подпись токена секретным ключом (JWT_SECRET)
 * 3. Проверяет срок действия токена
 * 4. Загружает пользователя из базы данных по ID из токена
 * 5. Добавляет объект user в request для использования в других guards и контроллерах
 * 
 * Важно:
 * - Пропускает OPTIONS запросы (CORS preflight) без проверки токена
 * - Если токен невалиден или отсутствует, выбрасывает UnauthorizedException
 * - Работает в паре с JwtStrategy (Passport.js)
 * 
 * Использование:
 * @UseGuards(JwtAuthGuard) - применяется к контроллеру или методу
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  /**
   * Проверка доступа к endpoint
   * 
   * @param context - Контекст выполнения (HTTP запрос)
   * @returns true если токен валиден, false или исключение если нет
   */
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    
    // КРИТИЧЕСКИ ВАЖНО: Пропускаем OPTIONS запросы (CORS preflight) без проверки токена
    // Браузер автоматически отправляет OPTIONS запрос перед основным запросом
    // для проверки CORS политики. Этот запрос не содержит токена, поэтому
    // мы должны его пропустить, иначе CORS не будет работать
    if (request.method === 'OPTIONS') {
      return true;
    }
    
    // Вызываем родительский метод, который выполняет проверку JWT токена
    // через Passport.js и JwtStrategy
    return super.canActivate(context);
  }
}
