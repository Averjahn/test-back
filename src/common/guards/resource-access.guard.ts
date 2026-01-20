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

@Injectable()
export class ResourceAccessGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // ADMIN имеет полный доступ ко всем ресурсам
    if (user.role === UserRole.ADMIN) {
      return true;
    }

    // Получаем метаданные о типе ресурса
    const resourceMetadata = this.reflector.get<{ type: ResourceType; paramName: string }>(
      RESOURCE_TYPE_KEY,
      context.getHandler(),
    );

    // Если декоратор @Resource() не указан, разрешаем доступ
    if (!resourceMetadata) {
      return true;
    }

    const { type, paramName } = resourceMetadata;
    const resourceId = request.params[paramName] || request.body[paramName];

    if (!resourceId) {
      return true; // Если ID ресурса не указан, разрешаем (например, для списков)
    }

    // Проверка доступа в зависимости от типа ресурса
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

  private async checkPatientAccess(user: any, patientId: string): Promise<boolean> {
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // PATIENT может получить доступ только к своему профилю
    if (user.role === UserRole.PATIENT) {
      if (patient.userId !== user.id) {
        throw new ForbiddenException('Access denied: You can only access your own data');
      }
      return true;
    }

    // DOCTOR может получить доступ только к своим пациентам
    if (user.role === UserRole.DOCTOR) {
      const doctor = await this.prisma.doctor.findUnique({
        where: { userId: user.id },
      });

      if (!doctor) {
        throw new ForbiddenException('Doctor profile not found');
      }

      const relation = await this.prisma.patientDoctor.findUnique({
        where: {
          patientId_doctorId: {
            patientId,
            doctorId: doctor.id,
          },
        },
      });

      if (!relation) {
        throw new ForbiddenException(
          'Access denied: You can only access your own patients',
        );
      }
      return true;
    }

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
