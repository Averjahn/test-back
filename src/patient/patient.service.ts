import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Сервис для работы с данными пациентов
 * 
 * Отвечает за:
 * - Получение профиля пациента
 * - Обновление профиля пациента
 * - Получение назначенных тренажеров
 * - Получение назначений врача
 * - Получение медицинских данных
 * - Обновление тарифа
 * - Получение достижений (результатов тестов)
 * 
 * Все методы работают с userId (ID пользователя), а не с patientId
 * Это упрощает логику, так как userId уникален и связан с Patient через relation
 */
@Injectable()
export class PatientService {
  constructor(private prisma: PrismaService) {}

  /**
   * Получить полный профиль пациента
   * 
   * Возвращает:
   * - Данные пользователя (User): email, login, ФИО, роль
   * - Данные пациента (Patient): дата рождения, аватар, доверенный контакт
   * - Текущий тариф с опциями (Tariff + TariffOption[])
   * - Список связанных врачей (PatientDoctor[] с данными врачей)
   * 
   * @param patientUserId - ID пользователя (User.id), связанного с Patient
   * @returns Полный профиль пациента со всеми связанными данными
   * @throws NotFoundException если профиль пациента не найден
   */
  async getProfile(patientUserId: string) {
    // Ищем пациента по userId (связь один-к-одному)
    const patient = await this.prisma.patient.findUnique({
      where: { userId: patientUserId },
      include: {
        // Включаем данные пользователя (User)
        // select ограничивает поля - passwordHash никогда не возвращается
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
            // passwordHash НЕ включается в select - безопасность
          },
        },
        // Включаем текущий тариф с опциями
        tariff: {
          include: {
            options: true, // Все опции тарифа
          },
        },
        // Включаем связанных врачей через промежуточную таблицу PatientDoctor
        doctors: {
          include: {
            doctor: {
              include: {
                // Данные пользователя врача (ФИО, email)
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

    // Если профиль не найден, выбрасываем исключение
    if (!patient) {
      throw new NotFoundException('Patient profile not found');
    }

    return patient;
  }

  /**
   * Обновить профиль пациента
   * 
   * Обновляет данные в двух таблицах:
   * 1. User - ФИО (firstName, lastName, middleName)
   * 2. Patient - дата рождения, аватар, доверенный контакт
   * 
   * Процесс:
   * 1. Проверка существования профиля пациента
   * 2. Подготовка данных для обновления (только переданные поля)
   * 3. Атомарное обновление через транзакцию Prisma
   * 4. Возврат обновленного профиля
   * 
   * Важно:
   * - Все поля опциональны (можно обновить только нужные)
   * - Используется транзакция для атомарности (либо все обновляется, либо ничего)
   * - null значения разрешены (можно очистить поле, передав null)
   * - Пустые строки преобразуются в null для консистентности БД
   * 
   * @param patientUserId - ID пользователя (User.id)
   * @param data - Данные для обновления (все поля опциональны)
   * @returns Обновленный профиль пациента
   * @throws NotFoundException если профиль пациента не найден
   */
  async updateProfile(
    patientUserId: string,
    data: {
      firstName?: string;        // Имя (обновляется в User)
      lastName?: string;         // Фамилия (обновляется в User)
      middleName?: string;       // Отчество (обновляется в User)
      birthDate?: string;        // Дата рождения в формате ISO (обновляется в Patient)
      trustedContact?: string;   // Доверенный контакт (обновляется в Patient)
      avatarUrl?: string | null;  // URL аватара (null для удаления, обновляется в Patient)
    }
  ) {
    // Проверяем, что профиль пациента существует
    const patient = await this.prisma.patient.findUnique({
      where: { userId: patientUserId },
    });

    if (!patient) {
      throw new NotFoundException('Patient profile not found');
    }

    // Подготавливаем данные для обновления User (ФИО)
    // Создаем объект только с теми полями, которые были переданы
    const userUpdateData: {
      firstName?: string | null;
      lastName?: string | null;
      middleName?: string | null;
    } = {};
    
    // Проверяем каждое поле через !== undefined (чтобы отличить от null)
    // Пустые строки преобразуем в null для консистентности БД
    if (data.firstName !== undefined) userUpdateData.firstName = data.firstName || null;
    if (data.lastName !== undefined) userUpdateData.lastName = data.lastName || null;
    if (data.middleName !== undefined) userUpdateData.middleName = data.middleName || null;

    // Подготавливаем данные для обновления Patient
    const patientUpdateData: {
      birthDate?: Date | null;
      avatarUrl?: string | null;
      trustedContact?: string | null;
    } = {};

    // Дата рождения: преобразуем строку в Date или null
    if (data.birthDate !== undefined) {
      patientUpdateData.birthDate = data.birthDate ? new Date(data.birthDate) : null;
    }
    
    // Аватар: сохраняем как есть (может быть string или null для удаления)
    if (data.avatarUrl !== undefined) {
      patientUpdateData.avatarUrl = data.avatarUrl;
    }
    
    // Доверенный контакт: пустые строки преобразуем в null
    if (data.trustedContact !== undefined) {
      patientUpdateData.trustedContact = data.trustedContact || null;
    }

    // Обновляем пользователя и пациента в транзакции
    // Транзакция гарантирует атомарность: либо все обновляется, либо ничего
    // Используем callback синтаксис для условной логики
    await this.prisma.$transaction(async (tx) => {
      // Обновляем пользователя, только если есть изменения
      // Это оптимизация - не делаем лишний запрос, если ФИО не изменилось
      if (Object.keys(userUpdateData).length > 0) {
        await tx.user.update({
          where: { id: patientUserId },
          data: userUpdateData,
        });
      }

      // Всегда обновляем пациента (даже если данные пустые, это нормально)
      await tx.patient.update({
        where: { userId: patientUserId },
        data: patientUpdateData,
      });
    });

    // Возвращаем обновленный профиль через getProfile
    // Это гарантирует, что вернутся все связанные данные (тариф, врачи и т.д.)
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
