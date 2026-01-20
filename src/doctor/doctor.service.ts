import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class DoctorService {
  constructor(private prisma: PrismaService) {}

  async getPatients(doctorUserId: string) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId: doctorUserId },
      include: {
        patients: {
          include: {
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
                tariff: true,
                assignments: {
                  include: {
                    trainer: true,
                    sessions: {
                      orderBy: {
                        startedAt: 'desc',
                      },
                      take: 1,
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor profile not found');
    }

    return doctor.patients.map((pd) => pd.patient);
  }

  async assignTrainer(doctorUserId: string, patientId: string, trainerId: string) {
    // Проверяем, что врач имеет доступ к этому пациенту
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId: doctorUserId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor profile not found');
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
      throw new ForbiddenException('You can only assign trainers to your own patients');
    }

    // Проверяем существование тренажёра
    const trainer = await this.prisma.trainer.findUnique({
      where: { id: trainerId },
    });

    if (!trainer) {
      throw new NotFoundException('Trainer not found');
    }

    // Создаем назначение
    const assignment = await this.prisma.assignment.create({
      data: {
        patientId,
        doctorId: doctor.id,
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
      },
    });

    return assignment;
  }

  async getPatientData(doctorUserId: string, patientId: string) {
    // Проверяем доступ
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId: doctorUserId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor profile not found');
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
      throw new ForbiddenException('You can only access your own patients');
    }

    // Получаем данные пациента
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
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
        tariff: true,
        medicalData: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        assignments: {
          include: {
            trainer: true,
            sessions: {
              orderBy: {
                startedAt: 'desc',
              },
              take: 10,
            },
          },
        },
      },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    return patient;
  }

  async createMedicalData(doctorUserId: string, patientId: string, type: string, data: any) {
    // Проверяем доступ
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId: doctorUserId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor profile not found');
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
      throw new ForbiddenException('You can only add medical data for your own patients');
    }

    // Если это текущая рекомендация или заметка, помечаем предыдущие как неактуальные
    if ((type === 'recommendation' || type === 'note') && data.isCurrent) {
      const existingRecords = await this.prisma.medicalData.findMany({
        where: {
          patientId,
          type,
        },
      });

      // Обновляем каждую запись отдельно
      for (const record of existingRecords) {
        const recordData = record.data as any;
        await this.prisma.medicalData.update({
          where: { id: record.id },
          data: {
            data: {
              ...recordData,
              isCurrent: false,
            },
          },
        });
      }
    }

    return this.prisma.medicalData.create({
      data: {
        patientId,
        type,
        data,
      },
    });
  }

  async deleteMedicalData(doctorUserId: string, patientId: string, medicalDataId: string) {
    // Проверяем доступ
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId: doctorUserId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor profile not found');
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
      throw new ForbiddenException('You can only delete medical data for your own patients');
    }

    const medicalData = await this.prisma.medicalData.findUnique({
      where: { id: medicalDataId },
    });

    if (!medicalData || medicalData.patientId !== patientId) {
      throw new NotFoundException('Medical data not found');
    }

    return this.prisma.medicalData.delete({
      where: { id: medicalDataId },
    });
  }
}
