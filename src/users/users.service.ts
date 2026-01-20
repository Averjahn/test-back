import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, UserRole } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        patient: true,
        doctor: true,
      },
    });
  }

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany({
      include: {
        patient: true,
        doctor: true,
      },
    });
  }

  async create(
    email: string,
    passwordHash: string,
    role: UserRole,
    firstName?: string,
    lastName?: string,
    middleName?: string,
    login?: string,
  ): Promise<User> {
    // Проверяем, существует ли пользователь с таким email
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Используем email как login, если login не указан
    const userLogin = login || email;

    const user = await this.prisma.user.create({
      data: {
        login: userLogin,
        email,
        passwordHash,
        role,
        firstName,
        lastName,
        middleName,
      },
    });

    // Создаем профиль в зависимости от роли
    if (role === UserRole.PATIENT) {
      await this.prisma.patient.create({
        data: {
          userId: user.id,
        },
      });
    } else if (role === UserRole.DOCTOR) {
      await this.prisma.doctor.create({
        data: {
          userId: user.id,
        },
      });
    }

    return user;
  }
}
