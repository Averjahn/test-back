import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';

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

    // Создаем дефолтное расписание для нового врача (все дни недели, 08:00-17:00, 30 минут)
    if (user.doctor) {
      const allDays = [0, 1, 2, 3, 4, 5, 6]; // Воскресенье - Суббота (все дни)
      const doctorId = user.doctor.id;
      await this.prisma.appointmentSchedule.createMany({
        data: allDays.map(dayOfWeek => ({
          doctorId,
          dayOfWeek,
          startTime: '08:00',
          endTime: '17:00',
          slotDuration: 30,
          isActive: true,
        })),
      });
    }

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

  async getPatientDocuments(patientId: string) {
    // Проверяем, что пациент существует
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
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
        tariff: true,
        hiddenDocuments: true,
      },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // Получаем список скрытых документов
    const hiddenDocumentIds = new Set(
      patient.hiddenDocuments.map(hd => hd.documentId)
    );

    // Получаем медицинские данные, которые могут содержать документы
    const medicalData = await this.prisma.medicalData.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
    });

    // Формируем список документов на основе данных пациента
    const documents: Array<{
      id: string;
      title: string;
      type: string;
      fileUrl?: string | null;
      createdAt: Date;
      date?: Date;
      amount?: number;
    }> = [];

    // Договор на оказание платных медицинских услуг
    if (patient.tariff && !hiddenDocumentIds.has(`contract-${patient.id}`)) {
      documents.push({
        id: `contract-${patient.id}`,
        title: 'Договор на оказание платных медицинских услуг',
        type: 'contract',
        createdAt: new Date(patient.createdAt),
      });
    }

    // Акт выполненных работ (на основе назначений)
    const assignments = await this.prisma.assignment.findMany({
      where: { patientId },
      include: {
        sessions: {
          where: { finishedAt: { not: null } },
          orderBy: { finishedAt: 'desc' },
        },
      },
    });

    // Группируем сессии по дате для формирования актов
    const sessionsByDate = new Map();
    assignments.forEach(assignment => {
      assignment.sessions.forEach(session => {
        if (session.finishedAt) {
          const dateKey = session.finishedAt.toISOString().split('T')[0];
          if (!sessionsByDate.has(dateKey)) {
            sessionsByDate.set(dateKey, []);
          }
          sessionsByDate.get(dateKey).push(session);
        }
      });
    });

    // Создаем акты выполненных работ
    sessionsByDate.forEach((sessions, date) => {
      const actId = `act-${patient.id}-${date}`;
      // Пропускаем скрытые акты
      if (!hiddenDocumentIds.has(actId)) {
        // Вычисляем сумму (примерная логика)
        const totalAmount = sessions.length * 3500; // Примерная стоимость за сессию
        documents.push({
          id: actId,
          title: `Акт выполненных работ (Сумма ${new Intl.NumberFormat('ru-RU').format(totalAmount)} руб, ${new Date(date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })})`,
          type: 'act',
          date: new Date(date),
          amount: totalAmount,
          createdAt: new Date(date),
        });
      }
    });

    // Информированное добровольное согласие
    if (!hiddenDocumentIds.has(`consent-medical-${patient.id}`)) {
      documents.push({
        id: `consent-medical-${patient.id}`,
        title: 'Информированное добровольное согласие на медицинское вмешательство',
        type: 'consent',
        createdAt: new Date(patient.createdAt),
      });
    }

    // Согласие на обработку персональных данных
    if (!hiddenDocumentIds.has(`consent-data-${patient.id}`)) {
      documents.push({
        id: `consent-data-${patient.id}`,
        title: 'Согласие на обработку персональных данных',
        type: 'consent',
        createdAt: new Date(patient.createdAt),
      });
    }

    // Получаем реальные документы из базы данных
    try {
      const dbDocuments = await this.prisma.document.findMany({
        where: { patientId },
        orderBy: { createdAt: 'desc' },
      });

      // Добавляем реальные документы из БД
      dbDocuments.forEach(doc => {
        documents.push({
          id: doc.id,
          title: doc.title,
          type: doc.type,
          fileUrl: doc.fileUrl || null,
          createdAt: doc.createdAt,
        });
      });
    } catch (error: any) {
      // Если таблица documents еще не создана, просто пропускаем
      console.warn('Documents table may not exist yet:', error?.message || error);
    }

    // Сортируем по дате создания (от новых к старым)
    documents.sort((a, b) => {
      const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
      const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });

    return documents;
  }

  async createDocument(patientId: string, data: {
    title: string;
    type: string;
    fileUrl?: string;
  }) {
    // Проверяем, что пациент существует
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    try {
      // Создаем документ
      const document = await this.prisma.document.create({
        data: {
          patientId,
          title: data.title,
          type: data.type,
          fileUrl: data.fileUrl,
        },
      });

      return document;
    } catch (error: any) {
      // Если таблица documents еще не создана
      if (error.code === 'P2021' || error.message?.includes('does not exist')) {
        throw new BadRequestException('Таблица документов еще не создана. Пожалуйста, выполните миграцию базы данных.');
      }
      throw error;
    }
  }

  async deleteDocument(patientId: string, documentId: string) {
    // Проверяем, что пациент существует
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // Проверяем, что документ существует и принадлежит пациенту
    const document = await this.prisma.document.findFirst({
      where: {
        id: documentId,
        patientId: patientId,
      },
    });

    // Если документ не найден в БД, это может быть динамически сгенерированный документ
    if (!document) {
      // Проверяем, является ли это динамическим документом
      const isDynamicDocument = 
        documentId.startsWith(`contract-${patientId}`) ||
        documentId.startsWith(`act-${patientId}-`) ||
        documentId.startsWith(`consent-medical-${patientId}`) ||
        documentId.startsWith(`consent-data-${patientId}`);

      if (isDynamicDocument) {
        // Для динамических документов сохраняем информацию о скрытии
        // Проверяем, не скрыт ли уже этот документ
        const existingHidden = await this.prisma.hiddenDocument.findUnique({
          where: {
            patientId_documentId: {
              patientId: patientId,
              documentId: documentId,
            },
          },
        });

        if (!existingHidden) {
          // Сохраняем информацию о скрытом документе
          await this.prisma.hiddenDocument.create({
            data: {
              patientId: patientId,
              documentId: documentId,
            },
          });
        }

        return { message: 'Document deleted successfully (dynamic document)' };
      }

      // Если это не динамический документ и не найден в БД, возвращаем ошибку
      throw new NotFoundException('Document not found');
    }

    // Удаляем физический файл с диска, если он существует
    if (document.fileUrl) {
      try {
        // Если fileUrl начинается с /uploads/, это локальный файл
        if (document.fileUrl.startsWith('/uploads/')) {
          const filePath = path.join(process.cwd(), document.fileUrl);
          
          // Проверяем существование файла и удаляем его
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`Файл удален: ${filePath}`);
          }
        }
      } catch (error) {
        // Логируем ошибку, но не прерываем удаление документа из БД
        console.error('Ошибка при удалении файла:', error);
      }
    }

    // Удаляем документ из базы данных
    await this.prisma.document.delete({
      where: { id: documentId },
    });

    return { message: 'Document deleted successfully' };
  }

  /**
   * Получает доступные даты для записи к врачу
   * Всегда возвращает минимум 14 дней (2 недели) вперед от текущей даты
   * 
   * @param doctorId - ID врача
   * @param startDate - Начальная дата (опционально, по умолчанию сегодня)
   * @param endDate - Конечная дата (опционально, игнорируется - всегда используется 14 дней от startDate)
   * @returns Массив доступных дат в формате YYYY-MM-DD
   */
  async getAvailableDates(doctorId: string, startDate?: string, endDate?: string): Promise<string[]> {
    // Проверяем, что врач существует
    const doctor = await this.prisma.doctor.findUnique({
      where: { id: doctorId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    // Получаем расписание врача один раз
    const schedules = await this.prisma.appointmentSchedule.findMany({
      where: {
        doctorId,
        isActive: true,
      },
    });

    // Создаем Map для быстрого поиска расписания по дню недели
    // Это более эффективно, чем использовать find() в цикле
    const scheduleByDayOfWeek = new Map<number, boolean>();
    schedules.forEach(schedule => {
      scheduleByDayOfWeek.set(schedule.dayOfWeek, true);
    });

    const hasSchedule = schedules.length > 0;

    // Определяем начальную дату (сегодня или переданная дата)
    const start = startDate ? new Date(startDate) : new Date();
    // Устанавливаем время на начало дня для корректного сравнения
    start.setHours(0, 0, 0, 0);

    // Всегда используем 14 дней (2 недели) вперед
    const DAYS_AHEAD = 14;
    const end = new Date(start);
    end.setDate(end.getDate() + DAYS_AHEAD);

    const availableDates: string[] = [];
    const currentDate = new Date(start);

    // Итерируемся по дням в диапазоне
    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      
      // Если расписание не настроено, все даты доступны
      // Если расписание настроено, проверяем наличие расписания на этот день
      if (!hasSchedule || scheduleByDayOfWeek.has(dayOfWeek)) {
        // Форматируем дату как YYYY-MM-DD (используем UTC для избежания проблем с часовыми поясами)
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        availableDates.push(dateStr);
      }

      // Переходим к следующему дню
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return availableDates;
  }

  async getTimeSlots(doctorId: string, date: string) {
    // Проверяем, что врач существует
    const doctor = await this.prisma.doctor.findUnique({
      where: { id: doctorId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    const appointmentDate = new Date(date);
    const dayOfWeek = appointmentDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    // Получаем расписание на этот день недели
    let schedule = await this.prisma.appointmentSchedule.findFirst({
      where: {
        doctorId,
        dayOfWeek,
        isActive: true,
      },
    });

    // Если расписание не найдено, используем дефолтное расписание
    // По умолчанию: 8:00 - 17:00, интервал 30 минут
    const defaultSchedule = {
      startTime: '08:00',
      endTime: '17:00',
      slotDuration: 30,
    };

    const scheduleToUse = schedule || defaultSchedule;

    // Получаем существующие записи на эту дату
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAppointments = await this.prisma.appointment.findMany({
      where: {
        doctorId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        patient: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                middleName: true,
              },
            },
          },
        },
      },
    });

    // Генерируем временные слоты
    const slots: Array<{
      startTime: string;
      endTime: string;
      available: boolean;
      appointment?: {
        patientName: string;
        type: string;
      };
    }> = [];

    const [startHour, startMinute] = scheduleToUse.startTime.split(':').map(Number);
    const [endHour, endMinute] = scheduleToUse.endTime.split(':').map(Number);
    const slotDuration = scheduleToUse.slotDuration;

    let currentTime = new Date();
    currentTime.setHours(startHour, startMinute, 0, 0);

    const endTime = new Date();
    endTime.setHours(endHour, endMinute, 0, 0);

    while (currentTime < endTime) {
      const slotStart = `${String(currentTime.getHours()).padStart(2, '0')}:${String(currentTime.getMinutes()).padStart(2, '0')}`;
      
      const slotEndTime = new Date(currentTime);
      slotEndTime.setMinutes(slotEndTime.getMinutes() + slotDuration);
      const slotEnd = `${String(slotEndTime.getHours()).padStart(2, '0')}:${String(slotEndTime.getMinutes()).padStart(2, '0')}`;

      // Проверяем, занят ли этот слот
      const existingAppointment = existingAppointments.find(
        apt => apt.startTime === slotStart
      );

      if (existingAppointment) {
        const patient = existingAppointment.patient.user;
        const patientName = [patient.lastName, patient.firstName, patient.middleName]
          .filter(Boolean)
          .join(' ');

        slots.push({
          startTime: slotStart,
          endTime: slotEnd,
          available: false,
          appointment: {
            patientName,
            type: existingAppointment.type,
          },
        });
      } else {
        slots.push({
          startTime: slotStart,
          endTime: slotEnd,
          available: true,
        });
      }

      currentTime = slotEndTime;
    }

    return slots;
  }

  async createAppointment(doctorId: string, dto: {
    patientId: string;
    date: string;
    startTime: string;
    type: string;
    notes?: string;
  }) {
    // Проверяем, что врач существует
    const doctor = await this.prisma.doctor.findUnique({
      where: { id: doctorId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    // Проверяем, что пациент существует
    const patient = await this.prisma.patient.findUnique({
      where: { id: dto.patientId },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // Проверяем, не занят ли этот временной слот
    const appointmentDate = new Date(dto.date);
    const existingAppointment = await this.prisma.appointment.findUnique({
      where: {
        doctorId_date_startTime: {
          doctorId,
          date: appointmentDate,
          startTime: dto.startTime,
        },
      },
    });

    if (existingAppointment) {
      throw new ConflictException('This time slot is already booked');
    }

    // Вычисляем время окончания на основе расписания
    const dayOfWeek = appointmentDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    let schedule = await this.prisma.appointmentSchedule.findFirst({
      where: {
        doctorId,
        dayOfWeek,
        isActive: true,
      },
    });

    // Если расписание не найдено, используем дефолтное расписание
    // По умолчанию: 8:00 - 17:00, интервал 30 минут
    const slotDuration = schedule?.slotDuration || 30;

    const [startHour, startMinute] = dto.startTime.split(':').map(Number);
    const endTime = new Date();
    endTime.setHours(startHour, startMinute + slotDuration, 0, 0);
    const endTimeStr = `${String(endTime.getHours()).padStart(2, '0')}:${String(endTime.getMinutes()).padStart(2, '0')}`;

    // Создаем запись
    const appointment = await this.prisma.appointment.create({
      data: {
        patientId: dto.patientId,
        doctorId,
        date: appointmentDate,
        startTime: dto.startTime,
        endTime: endTimeStr,
        type: dto.type,
        notes: dto.notes,
      },
      include: {
        patient: {
          include: {
            user: {
              select: {
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
                firstName: true,
                lastName: true,
                middleName: true,
              },
            },
          },
        },
      },
    });

    return appointment;
  }

  /**
   * Инициализирует дефолтное расписание для всех врачей, у которых его нет
   * Дефолтное расписание: все дни недели (0-6), 08:00-17:00, интервал 30 минут
   */
  async initializeDefaultSchedulesForAllDoctors() {
    // Получаем всех врачей
    const doctors = await this.prisma.doctor.findMany({
      include: {
        appointmentSchedules: true,
      },
    });

    let initializedCount = 0;

    for (const doctor of doctors) {
      // Проверяем, есть ли у врача расписание
      if (doctor.appointmentSchedules.length === 0) {
        // Создаем дефолтное расписание для всех дней недели
        const allDays = [0, 1, 2, 3, 4, 5, 6]; // Воскресенье - Суббота
        await this.prisma.appointmentSchedule.createMany({
          data: allDays.map(dayOfWeek => ({
            doctorId: doctor.id,
            dayOfWeek,
            startTime: '08:00',
            endTime: '17:00',
            slotDuration: 30,
            isActive: true,
          })),
        });
        initializedCount++;
      }
    }

    return {
      totalDoctors: doctors.length,
      initializedCount,
      message: `Initialized default schedules for ${initializedCount} doctor(s)`,
    };
  }
}
