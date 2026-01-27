import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '@prisma/client';

/**
 * Guard для проверки роли пользователя
 * 
 * Назначение: Второй уровень защиты - проверяет, что пользователь имеет нужную роль
 * 
 * Процесс работы:
 * 1. Извлекает требуемые роли из декоратора @Roles() на методе или классе
 * 2. Получает пользователя из request (должен быть добавлен JwtAuthGuard)
 * 3. Проверяет, что роль пользователя входит в список разрешенных ролей
 * 4. Если роль не подходит, выбрасывает ForbiddenException
 * 
 * Важно:
 * - Должен использоваться ПОСЛЕ JwtAuthGuard (пользователь должен быть аутентифицирован)
 * - Если декоратор @Roles() не указан, доступ разрешен всем аутентифицированным пользователям
 * - Использует Reflector для получения метаданных из декораторов
 * 
 * Использование:
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Roles(UserRole.ADMIN, UserRole.DOCTOR)
 * async someMethod() { ... }
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  /**
   * Проверка доступа на основе роли пользователя
   * 
   * @param context - Контекст выполнения (HTTP запрос)
   * @returns true если роль пользователя разрешена
   * @throws ForbiddenException если пользователь не аутентифицирован или роль не подходит
   */
  canActivate(context: ExecutionContext): boolean {
    // Извлекаем требуемые роли из декоратора @Roles()
    // getAllAndOverride проверяет сначала метод, потом класс
    // Это позволяет переопределить роли на уровне метода
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(), // Сначала проверяем метод
      context.getClass(),   // Потом класс
    ]);

    // Если декоратор @Roles() не указан, разрешаем доступ всем аутентифицированным пользователям
    if (!requiredRoles) {
      return true;
    }

    // Получаем пользователя из request (должен быть добавлен JwtAuthGuard)
    const { user } = context.switchToHttp().getRequest();
    
    // Если пользователь не найден (не был аутентифицирован), выбрасываем ошибку
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Проверяем, что роль пользователя входит в список разрешенных ролей
    // some() возвращает true, если хотя бы одна роль совпадает
    const hasRole = requiredRoles.some((role) => user.role === role);
    
    // Если роль не подходит, выбрасываем ошибку
    if (!hasRole) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
