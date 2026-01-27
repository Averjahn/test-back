import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '@prisma/client';

/**
 * Декоратор для извлечения текущего пользователя из request
 * 
 * Назначение: Упрощает получение данных аутентифицированного пользователя в контроллерах
 * 
 * Как работает:
 * - JwtAuthGuard добавляет объект user в request после проверки токена
 * - Этот декоратор извлекает user из request
 * 
 * Использование:
 * async getProfile(@CurrentUser() user: User) {
 *   // user содержит данные аутентифицированного пользователя
 *   return this.service.getProfile(user.id);
 * }
 * 
 * Преимущества:
 * - Не нужно вручную извлекать user из request
 * - TypeScript знает тип user (User из Prisma)
 * - Код становится чище и понятнее
 * 
 * Важно:
 * - Должен использоваться только в методах, защищенных JwtAuthGuard
 * - Если пользователь не аутентифицирован, user будет undefined
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    // Получаем HTTP request из контекста
    const request = ctx.switchToHttp().getRequest();
    
    // Возвращаем объект user, который был добавлен JwtAuthGuard
    // user содержит данные пользователя из JWT токена и базы данных
    return request.user;
  },
);
