"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcryptjs"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let AdminService = class AdminService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createPatient(data) {
        const existingUser = await this.prisma.user.findFirst({
            where: {
                OR: [{ email: data.email }, { login: data.login }],
            },
        });
        if (existingUser) {
            throw new common_1.ConflictException('User with this email or login already exists');
        }
        const passwordHash = await bcrypt.hash(data.password, 10);
        const user = await this.prisma.user.create({
            data: {
                email: data.email,
                login: data.login,
                passwordHash,
                role: client_1.UserRole.PATIENT,
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
    async createDoctor(data) {
        const existingUser = await this.prisma.user.findFirst({
            where: {
                OR: [{ email: data.email }, { login: data.login }],
            },
        });
        if (existingUser) {
            throw new common_1.ConflictException('User with this email or login already exists');
        }
        const passwordHash = await bcrypt.hash(data.password, 10);
        const user = await this.prisma.user.create({
            data: {
                email: data.email,
                login: data.login,
                passwordHash,
                role: client_1.UserRole.DOCTOR,
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
        if (user.doctor) {
            const allDays = [0, 1, 2, 3, 4, 5, 6];
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
    async assignDoctor(patientId, doctorId) {
        const patient = await this.prisma.patient.findUnique({
            where: { id: patientId },
        });
        if (!patient) {
            throw new common_1.NotFoundException('Patient not found');
        }
        const doctor = await this.prisma.doctor.findUnique({
            where: { id: doctorId },
        });
        if (!doctor) {
            throw new common_1.NotFoundException('Doctor not found');
        }
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
    async createTariff(data) {
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
    async createTrainer(data) {
        return this.prisma.trainer.create({
            data,
        });
    }
    async assignTrainer(patientId, trainerId, doctorId) {
        const patient = await this.prisma.patient.findUnique({
            where: { id: patientId },
        });
        if (!patient) {
            throw new common_1.NotFoundException('Patient not found');
        }
        const trainer = await this.prisma.trainer.findUnique({
            where: { id: trainerId },
        });
        if (!trainer) {
            throw new common_1.NotFoundException('Trainer not found');
        }
        let finalDoctorId = doctorId;
        if (!finalDoctorId) {
            const patientDoctor = await this.prisma.patientDoctor.findFirst({
                where: { patientId },
            });
            if (!patientDoctor) {
                throw new common_1.NotFoundException('Patient has no assigned doctor. Please assign a doctor first or specify doctorId');
            }
            finalDoctorId = patientDoctor.doctorId;
        }
        else {
            const doctor = await this.prisma.doctor.findUnique({
                where: { id: finalDoctorId },
            });
            if (!doctor) {
                throw new common_1.NotFoundException('Doctor not found');
            }
            const relation = await this.prisma.patientDoctor.findUnique({
                where: {
                    patientId_doctorId: {
                        patientId,
                        doctorId: finalDoctorId,
                    },
                },
            });
            if (!relation) {
                throw new common_1.NotFoundException('Doctor is not assigned to this patient');
            }
        }
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
    async getPatientDocuments(patientId) {
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
            throw new common_1.NotFoundException('Patient not found');
        }
        const hiddenDocumentIds = new Set(patient.hiddenDocuments.map(hd => hd.documentId));
        const medicalData = await this.prisma.medicalData.findMany({
            where: { patientId },
            orderBy: { createdAt: 'desc' },
        });
        const documents = [];
        if (patient.tariff && !hiddenDocumentIds.has(`contract-${patient.id}`)) {
            documents.push({
                id: `contract-${patient.id}`,
                title: 'Договор на оказание платных медицинских услуг',
                type: 'contract',
                createdAt: new Date(patient.createdAt),
            });
        }
        const assignments = await this.prisma.assignment.findMany({
            where: { patientId },
            include: {
                sessions: {
                    where: { finishedAt: { not: null } },
                    orderBy: { finishedAt: 'desc' },
                },
            },
        });
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
        sessionsByDate.forEach((sessions, date) => {
            const actId = `act-${patient.id}-${date}`;
            if (!hiddenDocumentIds.has(actId)) {
                const totalAmount = sessions.length * 3500;
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
        if (!hiddenDocumentIds.has(`consent-medical-${patient.id}`)) {
            documents.push({
                id: `consent-medical-${patient.id}`,
                title: 'Информированное добровольное согласие на медицинское вмешательство',
                type: 'consent',
                createdAt: new Date(patient.createdAt),
            });
        }
        if (!hiddenDocumentIds.has(`consent-data-${patient.id}`)) {
            documents.push({
                id: `consent-data-${patient.id}`,
                title: 'Согласие на обработку персональных данных',
                type: 'consent',
                createdAt: new Date(patient.createdAt),
            });
        }
        try {
            const dbDocuments = await this.prisma.document.findMany({
                where: { patientId },
                orderBy: { createdAt: 'desc' },
            });
            dbDocuments.forEach(doc => {
                documents.push({
                    id: doc.id,
                    title: doc.title,
                    type: doc.type,
                    fileUrl: doc.fileUrl || null,
                    createdAt: doc.createdAt,
                });
            });
        }
        catch (error) {
            console.warn('Documents table may not exist yet:', error?.message || error);
        }
        documents.sort((a, b) => {
            const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
            const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
            return dateB.getTime() - dateA.getTime();
        });
        return documents;
    }
    async createDocument(patientId, data) {
        const patient = await this.prisma.patient.findUnique({
            where: { id: patientId },
        });
        if (!patient) {
            throw new common_1.NotFoundException('Patient not found');
        }
        try {
            const document = await this.prisma.document.create({
                data: {
                    patientId,
                    title: data.title,
                    type: data.type,
                    fileUrl: data.fileUrl,
                },
            });
            return document;
        }
        catch (error) {
            if (error.code === 'P2021' || error.message?.includes('does not exist')) {
                throw new common_1.BadRequestException('Таблица документов еще не создана. Пожалуйста, выполните миграцию базы данных.');
            }
            throw error;
        }
    }
    async deleteDocument(patientId, documentId) {
        const patient = await this.prisma.patient.findUnique({
            where: { id: patientId },
        });
        if (!patient) {
            throw new common_1.NotFoundException('Patient not found');
        }
        const document = await this.prisma.document.findFirst({
            where: {
                id: documentId,
                patientId: patientId,
            },
        });
        if (!document) {
            const isDynamicDocument = documentId.startsWith(`contract-${patientId}`) ||
                documentId.startsWith(`act-${patientId}-`) ||
                documentId.startsWith(`consent-medical-${patientId}`) ||
                documentId.startsWith(`consent-data-${patientId}`);
            if (isDynamicDocument) {
                const existingHidden = await this.prisma.hiddenDocument.findUnique({
                    where: {
                        patientId_documentId: {
                            patientId: patientId,
                            documentId: documentId,
                        },
                    },
                });
                if (!existingHidden) {
                    await this.prisma.hiddenDocument.create({
                        data: {
                            patientId: patientId,
                            documentId: documentId,
                        },
                    });
                }
                return { message: 'Document deleted successfully (dynamic document)' };
            }
            throw new common_1.NotFoundException('Document not found');
        }
        if (document.fileUrl) {
            try {
                if (document.fileUrl.startsWith('/uploads/')) {
                    const filePath = path.join(process.cwd(), document.fileUrl);
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                        console.log(`Файл удален: ${filePath}`);
                    }
                }
            }
            catch (error) {
                console.error('Ошибка при удалении файла:', error);
            }
        }
        await this.prisma.document.delete({
            where: { id: documentId },
        });
        return { message: 'Document deleted successfully' };
    }
    async getAvailableDates(doctorId, startDate, endDate) {
        const doctor = await this.prisma.doctor.findUnique({
            where: { id: doctorId },
        });
        if (!doctor) {
            throw new common_1.NotFoundException('Doctor not found');
        }
        const schedules = await this.prisma.appointmentSchedule.findMany({
            where: {
                doctorId,
                isActive: true,
            },
        });
        const scheduleByDayOfWeek = new Map();
        schedules.forEach(schedule => {
            scheduleByDayOfWeek.set(schedule.dayOfWeek, true);
        });
        const hasSchedule = schedules.length > 0;
        const start = startDate ? new Date(startDate) : new Date();
        start.setHours(0, 0, 0, 0);
        const DAYS_AHEAD = 14;
        const end = new Date(start);
        end.setDate(end.getDate() + DAYS_AHEAD);
        const availableDates = [];
        const currentDate = new Date(start);
        while (currentDate <= end) {
            const dayOfWeek = currentDate.getDay();
            if (!hasSchedule || scheduleByDayOfWeek.has(dayOfWeek)) {
                const year = currentDate.getFullYear();
                const month = String(currentDate.getMonth() + 1).padStart(2, '0');
                const day = String(currentDate.getDate()).padStart(2, '0');
                const dateStr = `${year}-${month}-${day}`;
                availableDates.push(dateStr);
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return availableDates;
    }
    async getTimeSlots(doctorId, date) {
        const doctor = await this.prisma.doctor.findUnique({
            where: { id: doctorId },
        });
        if (!doctor) {
            throw new common_1.NotFoundException('Doctor not found');
        }
        const appointmentDate = new Date(date);
        const dayOfWeek = appointmentDate.getDay();
        let schedule = await this.prisma.appointmentSchedule.findFirst({
            where: {
                doctorId,
                dayOfWeek,
                isActive: true,
            },
        });
        const defaultSchedule = {
            startTime: '08:00',
            endTime: '17:00',
            slotDuration: 30,
        };
        const scheduleToUse = schedule || defaultSchedule;
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
        const slots = [];
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
            const existingAppointment = existingAppointments.find(apt => apt.startTime === slotStart);
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
            }
            else {
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
    async createAppointment(doctorId, dto) {
        const doctor = await this.prisma.doctor.findUnique({
            where: { id: doctorId },
        });
        if (!doctor) {
            throw new common_1.NotFoundException('Doctor not found');
        }
        const patient = await this.prisma.patient.findUnique({
            where: { id: dto.patientId },
        });
        if (!patient) {
            throw new common_1.NotFoundException('Patient not found');
        }
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
            throw new common_1.ConflictException('This time slot is already booked');
        }
        const dayOfWeek = appointmentDate.getDay();
        let schedule = await this.prisma.appointmentSchedule.findFirst({
            where: {
                doctorId,
                dayOfWeek,
                isActive: true,
            },
        });
        const slotDuration = schedule?.slotDuration || 30;
        const [startHour, startMinute] = dto.startTime.split(':').map(Number);
        const endTime = new Date();
        endTime.setHours(startHour, startMinute + slotDuration, 0, 0);
        const endTimeStr = `${String(endTime.getHours()).padStart(2, '0')}:${String(endTime.getMinutes()).padStart(2, '0')}`;
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
    async initializeDefaultSchedulesForAllDoctors() {
        const doctors = await this.prisma.doctor.findMany({
            include: {
                appointmentSchedules: true,
            },
        });
        let initializedCount = 0;
        for (const doctor of doctors) {
            if (doctor.appointmentSchedules.length === 0) {
                const allDays = [0, 1, 2, 3, 4, 5, 6];
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
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map