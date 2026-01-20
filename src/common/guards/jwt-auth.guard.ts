import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    
    // КРИТИЧЕСКИ ВАЖНО: Пропускаем OPTIONS запросы (preflight) без проверки токена
    if (request.method === 'OPTIONS') {
      return true;
    }
    
    return super.canActivate(context);
  }
}
