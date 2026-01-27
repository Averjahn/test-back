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

  async updateProfile(
    patientUserId: string,
    data: {
      firstName?: string;
      lastName?: string;
      middleName?: string;
      birthDate?: string;
      trustedContact?: string;
      avatarUrl?: string | null;
    }
  ) {
    const patient = await this.prisma.patient.findUnique({
      where: { userId: patientUserId },
    });

    if (!patient) {
      throw new NotFoundException('Patient profile not found');
    }

    // Обновляем данные пользователя (ФИО)
    const userUpdateData: {
      firstName?: string | null;
      lastName?: string | null;
      middleName?: string | null;
    } = {};
    
    if (data.firstName !== undefined) userUpdateData.firstName = data.firstName || null;
    if (data.lastName !== undefined) userUpdateData.lastName = data.lastName || null;
    if (data.middleName !== undefined) userUpdateData.middleName = data.middleName || null;

    // Обновляем данные пациента (дата рождения, аватар, доверенный контакт)
    const patientUpdateData: {
      birthDate?: Date | null;
      avatarUrl?: string | null;
      trustedContact?: string | null;
    } = {};

    if (data.birthDate !== undefined) {
      patientUpdateData.birthDate = data.birthDate ? new Date(data.birthDate) : null;
    }
    if (data.avatarUrl !== undefined) {
      patientUpdateData.avatarUrl = data.avatarUrl;
    }
    if (data.trustedContact !== undefined) {
      patientUpdateData.trustedContact = data.trustedContact || null;
    }

    // Обновляем пользователя и пациента в транзакции
    await this.prisma.$transaction(async (tx) => {
      // Обновляем пользователя, если есть изменения
      if (Object.keys(userUpdateData).length > 0) {
        await tx.user.update({
          where: { id: patientUserId },
          data: userUpdateData,
        });
      }

      // Обновляем пациента
      await tx.patient.update({
        where: { userId: patientUserId },
        data: patientUpdateData,
      });
    });

    // Возвращаем обновленный профиль
    return this.getProfile(patientUserId);
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

  async getAssignments(patientUserId: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { userId: patientUserId },
    });

    if (!patient) {
      throw new NotFoundException('Patient profile not found');
    }

    // Получаем все назначения пациента с полной информацией
    const assignments = await this.prisma.assignment.findMany({
      where: {
        patientId: patient.id,
      },
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
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Формируем данные для отображения
    return assignments.map((assignment) => {
      const trainer = assignment.trainer;
      
      // Парсим section для формирования текста рекомендации
      const sectionParts = trainer.section.split('.');
      const categoryNumber = sectionParts[0] || '';
      const subsectionNumber = sectionParts[1] || '';
      
      // Маппинг категорий
      const categoryMap: Record<string, string> = {
        '1': 'Тесты',
        '2': 'Буквы',
        '3': 'Слоги',
        '4': 'Слова',
        '5': 'Грамматика',
      };
      
      // Маппинг разделов
      const sectionMap: Record<string, string> = {
        '1.1': 'Известные ряды понятий',
        '1.2': 'Фразы и предложения, знакомые с детства',
        '2.1': 'Составление слов из букв',
        '3.1': 'Составление слов из слогов',
        '4.1': 'Антонимы и синонимы',
        '5.1': 'Число (единственное и множественное)',
      };
      
      const category = categoryMap[categoryNumber] || 'Тесты';
      const sectionName = sectionMap[trainer.section] || trainer.description || trainer.title || 'Не указано';
      
      // Формируем текст рекомендации в формате: "Рекомендуется проходить задания 1. Тесты/1.2. Фразы и предложения, знакомые с детства"
      const recommendation = `Рекомендуется проходить задания ${categoryNumber}. ${category}/${trainer.section}. ${sectionName}`;

      return {
        id: assignment.id,
        date: assignment.createdAt.toISOString().split('T')[0],
        recommendation,
        trainer: {
          id: trainer.id,
          title: trainer.title,
          section: trainer.section,
          description: trainer.description,
        },
        doctor: {
          id: assignment.doctor.user.id,
          firstName: assignment.doctor.user.firstName,
          lastName: assignment.doctor.user.lastName,
          middleName: assignment.doctor.user.middleName,
        },
        createdAt: assignment.createdAt,
      };
    });
  }

  async getAchievements(patientUserId: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { userId: patientUserId },
    });

    if (!patient) {
      throw new NotFoundException('Patient profile not found');
    }

    // Получаем все сессии пациента с полной информацией
    const sessions = await this.prisma.testSession.findMany({
      where: {
        assignment: {
          patientId: patient.id,
        },
      },
      include: {
        assignment: {
          include: {
            trainer: true,
          },
        },
      },
      orderBy: {
        startedAt: 'desc',
      },
    });

    // Формируем данные для отображения
    return sessions.map((session, index) => {
      const trainer = session.assignment.trainer;
      
      // Парсим section для получения категории и раздела
      // Формат section может быть "1.1", "1.2" и т.д.
      const sectionParts = trainer.section.split('.');
      const categoryNumber = sectionParts[0] || '';
      const subsectionNumber = sectionParts[1] || '';
      
      // Маппинг категорий на основе первой цифры section
      const categoryMap: Record<string, string> = {
        '1': 'Тесты',
        '2': 'Буквы',
        '3': 'Слоги',
        '4': 'Слова',
        '5': 'Грамматика',
      };
      
      // Маппинг разделов (можно расширить на основе полного section)
      const sectionMap: Record<string, string> = {
        '1.1': 'Известные ряды понятий',
        '1.2': 'Работа с изображениями',
        '2.1': 'Составление слов из букв',
        '3.1': 'Составление слов из слогов',
        '4.1': 'Антонимы и синонимы',
        '5.1': 'Число (единственное и множественное)',
      };
      
      // Определяем категорию, раздел и подраздел
      const category = categoryMap[categoryNumber] || 'Тесты';
      const section = sectionMap[trainer.section] || trainer.section || 'Не указано';
      const subsection = trainer.description || trainer.title || 'Не указано';
      
      // Формируем ID задания в формате "XXX-Y"
      // Используем хеш от trainer.id для получения стабильного номера
      let trainerNumber = 119; // значение по умолчанию
      if (trainer.id) {
        // Простой хеш для получения числа из UUID
        const hash = trainer.id.split('').reduce((acc, char) => {
          return ((acc << 5) - acc) + char.charCodeAt(0);
        }, 0);
        trainerNumber = Math.abs(hash) % 1000;
        if (trainerNumber < 100) trainerNumber += 100; // минимум 100
      }
      
      // Подсчитываем номер сессии для этого тренажера (в хронологическом порядке)
      const sessionsForTrainer = sessions
        .filter(s => s.assignment.trainerId === trainer.id)
        .sort((a, b) => a.startedAt.getTime() - b.startedAt.getTime());
      const sessionIndex = sessionsForTrainer.findIndex(s => s.id === session.id);
      const taskNumber = sessionIndex >= 0 ? sessionIndex + 1 : 1;
      const taskId = `${trainerNumber}-${taskNumber}`;

      return {
        id: session.id,
        date: session.startedAt.toISOString().split('T')[0],
        time: session.startedAt.toTimeString().split(' ')[0].slice(0, 5),
        category,
        section,
        subsection,
        taskId,
        correct: session.finishedAt ? session.correct : null,
        incorrect: session.finishedAt ? session.incorrect : null,
        startedAt: session.startedAt,
        finishedAt: session.finishedAt,
      };
    });
  }
}
