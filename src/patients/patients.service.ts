import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Patient } from '@prisma/client';
import { DoctorsService } from '../doctors/doctors.service';

@Injectable()
export class PatientsService {
  constructor(
    private prisma: PrismaService,
    private doctorsService: DoctorsService,
  ) {}

  async findAll(currentUserId?: string, currentUserRole?: string): Promise<Patient[]> {
    // Если пользователь DOCTOR, возвращаем только его пациентов
    if (currentUserRole === 'DOCTOR' && currentUserId) {
      const doctor = await this.doctorsService.findByUserId(currentUserId);
      if (doctor) {
        return this.findPatientsByDoctorId(doctor.id);
      }
    }

    // Если пользователь PATIENT, возвращаем только его профиль
    if (currentUserRole === 'PATIENT' && currentUserId) {
      const patient = await this.findByUserId(currentUserId);
      return patient ? [patient] : [];
    }

    // ADMIN видит всех пациентов
    return this.prisma.patient.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            firstName: true,
            lastName: true,
            middleName: true,
            createdAt: true,
          },
        },
        tariff: true,
        doctors: {
          include: {
            doctor: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    middleName: true,
                  },
                },
              },
            },
          },
        },
        assignments: {
          include: {
            sessions: {
              orderBy: {
                startedAt: 'desc',
              },
            },
          },
        },
      },
    });
  }

  async findById(id: string): Promise<Patient | null> {
    return this.prisma.patient.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            firstName: true,
            lastName: true,
            middleName: true,
          },
        },
      },
    });
  }

  async findByUserId(userId: string): Promise<Patient | null> {
    return this.prisma.patient.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            firstName: true,
            lastName: true,
            middleName: true,
          },
        },
      },
    });
  }

  async findPatientsByDoctorId(doctorId: string): Promise<Patient[]> {
    return this.prisma.patient.findMany({
      where: {
        doctors: {
          some: {
            doctorId,
          },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            firstName: true,
            lastName: true,
            middleName: true,
          },
        },
      },
    });
  }

  async checkDoctorPatientAccess(doctorId: string, patientId: string): Promise<boolean> {
    const relation = await this.prisma.patientDoctor.findUnique({
      where: {
        patientId_doctorId: {
          patientId,
          doctorId,
        },
      },
    });
    return !!relation;
  }

  async createPatient(data: {
    email: string;
    passwordHash: string;
    firstName?: string;
    lastName?: string;
    middleName?: string;
  }): Promise<Patient> {
    const { email, passwordHash, firstName, lastName, middleName } = data;

    // Создаем пользователя с ролью PATIENT и связанным Patient
    const user = await this.prisma.user.create({
      data: {
        login: email, // Используем email как login
        email,
        passwordHash,
        role: 'PATIENT',
        firstName,
        lastName,
        middleName,
        patient: {
          create: {},
        },
      },
      include: {
        patient: true,
      },
    });

    return this.prisma.patient.findUnique({
      where: { userId: user.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            login: true,
            role: true,
            firstName: true,
            lastName: true,
            middleName: true,
          },
        },
      },
    }) as Promise<Patient>;
  }
}
