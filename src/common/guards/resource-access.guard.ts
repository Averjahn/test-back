import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { RESOURCE_TYPE_KEY, ResourceType } from '../decorators/resource.decorator';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Guard для проверки доступа к конкретному ресурсу
 * 
 * Назначение: Третий уровень защиты - проверяет, что пользователь имеет доступ
 * к конкретному ресурсу (пациент, врач, пользователь)
 * 
 * Процесс работы:
 * 1. Проверяет роль пользователя (ADMIN имеет полный доступ)
 * 2. Извлекает тип ресурса и ID из декоратора @Resource()
 * 3. Проверяет доступ в зависимости от типа ресурса и роли пользователя
 * 
 * Логика доступа:
 * - ADMIN: Полный доступ ко всем ресурсам
 * - PATIENT: Доступ только к своему профилю
 * - DOCTOR: Доступ только к своим пациентам и своему профилю
 * 
 * Использование:
 * @UseGuards(JwtAuthGuard, RolesGuard, ResourceAccessGuard)
 * @Resource(ResourceType.PATIENT, 'patientId')
 * @Get('patients/:patientId')
 * async getPatient(@Param('patientId') patientId: string) { ... }
 * 
 * Важно:
 * - Должен использоваться ПОСЛЕ JwtAuthGuard и RolesGuard
 * - Если декоратор @Resource() не указан, доступ разрешен
 * - Если ID ресурса не указан (например, для списков), доступ разрешен
 */
@Injectable()
export class ResourceAccessGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  /**
   * Проверка доступа к ресурсу
   * 
   * @param context - Контекст выполнения (HTTP запрос)
   * @returns true если доступ разрешен
   * @throws ForbiddenException если доступ запрещен
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Если пользователь не аутентифицирован, выбрасываем ошибку
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // ADMIN имеет полный доступ ко всем ресурсам
    // Это упрощает логику - администратору не нужно проверять связи
    if (user.role === UserRole.ADMIN) {
      return true;
    }

    // Получаем метаданные о типе ресурса из декоратора @Resource()
    // Декоратор указывает, какой тип ресурса проверяется и откуда брать ID
    const resourceMetadata = this.reflector.get<{ type: ResourceType; paramName: string }>(
      RESOURCE_TYPE_KEY,
      context.getHandler(),
    );

    // Если декоратор @Resource() не указан, разрешаем доступ
    // Это позволяет использовать guard на уровне контроллера, но не проверять
    // доступ для некоторых методов (например, списков)
    if (!resourceMetadata) {
      return true;
    }

    const { type, paramName } = resourceMetadata;
    
    // Извлекаем ID ресурса из параметров URL или тела запроса
    // paramName указывает, откуда брать ID (например, 'patientId' из URL)
    const resourceId = request.params[paramName] || request.body[paramName];

    // Если ID ресурса не указан, разрешаем доступ
    // Это нужно для методов, которые работают со списками (не требуют конкретного ID)
    if (!resourceId) {
      return true;
    }

    // Проверка доступа в зависимости от типа ресурса
    // Каждый тип ресурса имеет свою логику проверки
    switch (type) {
      case ResourceType.PATIENT:
        return this.checkPatientAccess(user, resourceId);
      case ResourceType.DOCTOR:
        return this.checkDoctorAccess(user, resourceId);
      case ResourceType.USER:
        return this.checkUserAccess(user, resourceId);
      default:
        return true;
    }
  }

  /**
   * Проверка доступа к данным пациента
   * 
   * Логика:
   * - PATIENT: Может получить доступ только к своему профилю (patient.userId === user.id)
   * - DOCTOR: Может получить доступ только к своим пациентам (проверка через PatientDoctor)
   * - ADMIN: Уже пропущен выше, сюда не доходит
   * 
   * @param user - Текущий пользователь
   * @param patientId - ID пациента, к которому запрашивается доступ
   * @returns true если доступ разрешен
   * @throws NotFoundException если пациент не найден
   * @throws ForbiddenException если доступ запрещен
   */
  private async checkPatientAccess(user: any, patientId: string): Promise<boolean> {
    // Ищем пациента в базе данных
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
    });

    // Если пациент не найден, выбрасываем ошибку
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // PATIENT может получить доступ только к своему профилю
    // Проверяем, что userId пациента совпадает с ID текущего пользователя
    if (user.role === UserRole.PATIENT) {
      if (patient.userId !== user.id) {
        throw new ForbiddenException('Access denied: You can only access your own data');
      }
      return true;
    }

    // DOCTOR может получить доступ только к своим пациентам
    // Проверяем связь через промежуточную таблицу PatientDoctor
    if (user.role === UserRole.DOCTOR) {
      // Находим профиль врача по userId
      const doctor = await this.prisma.doctor.findUnique({
        where: { userId: user.id },
      });

      if (!doctor) {
        throw new ForbiddenException('Doctor profile not found');
      }

      // Проверяем, существует ли связь между врачом и пациентом
      // Это гарантирует, что врач может получить доступ только к своим пациентам
      const relation = await this.prisma.patientDoctor.findUnique({
        where: {
          patientId_doctorId: {
            patientId,
            doctorId: doctor.id,
          },
        },
      });

      // Если связи нет, доступ запрещен
      if (!relation) {
        throw new ForbiddenException(
          'Access denied: You can only access your own patients',
        );
      }
      return true;
    }

    // Если роль не PATIENT и не DOCTOR, доступ запрещен
    // (ADMIN уже пропущен выше)
    return false;
  }

  private async checkDoctorAccess(user: any, doctorId: string): Promise<boolean> {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id: doctorId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    // DOCTOR может получить доступ только к своему профилю
    if (user.role === UserRole.DOCTOR) {
      if (doctor.userId !== user.id) {
        throw new ForbiddenException('Access denied: You can only access your own data');
      }
      return true;
    }

    // PATIENT не может получить доступ к данным врача напрямую
    if (user.role === UserRole.PATIENT) {
      throw new ForbiddenException('Access denied');
    }

    return false;
  }

  private async checkUserAccess(user: any, userId: string): Promise<boolean> {
    const targetUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    // Пользователь может получить доступ только к своим данным
    if (user.id !== userId) {
      throw new ForbiddenException('Access denied: You can only access your own data');
    }

    return true;
  }
}
