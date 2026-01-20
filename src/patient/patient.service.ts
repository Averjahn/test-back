import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PatientService {
  constructor(private prisma: PrismaService) {}

  async getProfile(patientUserId: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { userId: patientUserId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            login: true,
            firstName: true,
            lastName: true,
            middleName: true,
            role: true,
            createdAt: true,
          },
        },
        tariff: {
          include: {
            options: true,
          },
        },
        doctors: {
          include: {
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
        },
      },
    });

    if (!patient) {
      throw new NotFoundException('Patient profile not found');
    }

    return patient;
  }

  async getTrainers(patientUserId: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { userId: patientUserId },
      include: {
        assignments: {
          include: {
            trainer: true,
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
            sessions: {
              orderBy: {
                startedAt: 'desc',
              },
              take: 1,
            },
          },
        },
      },
    });

    if (!patient) {
      throw new NotFoundException('Patient profile not found');
    }

    return patient.assignments;
  }

  async getMedicalData(patientUserId: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { userId: patientUserId },
      include: {
        medicalData: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!patient) {
      throw new NotFoundException('Patient profile not found');
    }

    return patient.medicalData;
  }

  async updateTariff(patientUserId: string, tariffId: string) {
    // Проверяем, что пациент существует
    const patient = await this.prisma.patient.findUnique({
      where: { userId: patientUserId },
    });

    if (!patient) {
      throw new NotFoundException('Patient profile not found');
    }

    // Проверяем, что тариф существует
    const tariff = await this.prisma.tariff.findUnique({
      where: { id: tariffId },
    });

    if (!tariff) {
      throw new NotFoundException('Tariff not found');
    }

    // Обновляем тариф пациента
    const updatedPatient = await this.prisma.patient.update({
      where: { userId: patientUserId },
      data: {
        tariffId: tariffId,
      },
      include: {
        tariff: {
          include: {
            options: true,
          },
        },
      },
    });

    return updatedPatient;
  }
}
