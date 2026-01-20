import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async createPatient(data: {
    email: string;
    login: string;
    password: string;
    firstName?: string;
    lastName?: string;
    middleName?: string;
    birthDate?: Date;
  }) {
    // Проверяем, существует ли пользователь
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: data.email }, { login: data.login }],
      },
    });

    if (existingUser) {
      throw new ConflictException('User with this email or login already exists');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        login: data.login,
        passwordHash,
        role: UserRole.PATIENT,
        firstName: data.firstName,
        lastName: data.lastName,
        middleName: data.middleName,
        patient: {
          create: {
            birthDate: data.birthDate,
          },
        },
      },
      include: {
        patient: {
          include: {
            user: true,
          },
        },
      },
    });

    return user.patient;
  }

  async createDoctor(data: {
    email: string;
    login: string;
    password: string;
    firstName?: string;
    lastName?: string;
    middleName?: string;
  }) {
    // Проверяем, существует ли пользователь
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: data.email }, { login: data.login }],
      },
    });

    if (existingUser) {
      throw new ConflictException('User with this email or login already exists');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        login: data.login,
        passwordHash,
        role: UserRole.DOCTOR,
        firstName: data.firstName,
        lastName: data.lastName,
        middleName: data.middleName,
        doctor: {
          create: {},
        },
      },
      include: {
        doctor: {
          include: {
            user: true,
          },
        },
      },
    });

    return user.doctor;
  }

  async assignDoctor(patientId: string, doctorId: string) {
    // Проверяем существование пациента и врача
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    const doctor = await this.prisma.doctor.findUnique({
      where: { id: doctorId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    // Создаем связь (если еще не существует)
    const relation = await this.prisma.patientDoctor.upsert({
      where: {
        patientId_doctorId: {
          patientId,
          doctorId,
        },
      },
      create: {
        patientId,
        doctorId,
      },
      update: {},
    });

    return relation;
  }

  async createTariff(data: {
    title: string;
    price: number;
    discount?: number;
    imageUrl?: string;
    options?: Array<{ title: string; description?: string }>;
  }) {
    const tariff = await this.prisma.tariff.create({
      data: {
        title: data.title,
        price: data.price,
        discount: data.discount || 0,
        imageUrl: data.imageUrl,
        options: data.options
          ? {
              create: data.options,
            }
          : undefined,
      },
      include: {
        options: true,
      },
    });

    return tariff;
  }

  async createTrainer(data: {
    title: string;
    description?: string;
    iframeUrl: string;
    section: string;
  }) {
    return this.prisma.trainer.create({
      data,
    });
  }

  async assignTrainer(patientId: string, trainerId: string, doctorId?: string) {
    // Проверяем существование пациента и тренажёра
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    const trainer = await this.prisma.trainer.findUnique({
      where: { id: trainerId },
    });

    if (!trainer) {
      throw new NotFoundException('Trainer not found');
    }

    // Если doctorId не указан, берем первого врача пациента
    let finalDoctorId = doctorId;
    if (!finalDoctorId) {
      const patientDoctor = await this.prisma.patientDoctor.findFirst({
        where: { patientId },
      });

      if (!patientDoctor) {
        throw new NotFoundException('Patient has no assigned doctor. Please assign a doctor first or specify doctorId');
      }

      finalDoctorId = patientDoctor.doctorId;
    } else {
      // Проверяем существование врача
      const doctor = await this.prisma.doctor.findUnique({
        where: { id: finalDoctorId },
      });

      if (!doctor) {
        throw new NotFoundException('Doctor not found');
      }

      // Проверяем, что врач назначен пациенту
      const relation = await this.prisma.patientDoctor.findUnique({
        where: {
          patientId_doctorId: {
            patientId,
            doctorId: finalDoctorId,
          },
        },
      });

      if (!relation) {
        throw new NotFoundException('Doctor is not assigned to this patient');
      }
    }

    // Создаем назначение
    const assignment = await this.prisma.assignment.create({
      data: {
        patientId,
        doctorId: finalDoctorId,
        trainerId,
      },
      include: {
        trainer: true,
        patient: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                login: true,
                firstName: true,
                lastName: true,
                middleName: true,
              },
            },
          },
        },
        doctor: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                login: true,
                firstName: true,
                lastName: true,
                middleName: true,
              },
            },
          },
        },
      },
    });

    return assignment;
  }
}
