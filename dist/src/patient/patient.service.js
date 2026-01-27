"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PatientService = class PatientService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getProfile(patientUserId) {
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
            throw new common_1.NotFoundException('Patient profile not found');
        }
        return patient;
    }
    async updateProfile(patientUserId, data) {
        const patient = await this.prisma.patient.findUnique({
            where: { userId: patientUserId },
        });
        if (!patient) {
            throw new common_1.NotFoundException('Patient profile not found');
        }
        const userUpdateData = {};
        if (data.firstName !== undefined)
            userUpdateData.firstName = data.firstName || null;
        if (data.lastName !== undefined)
            userUpdateData.lastName = data.lastName || null;
        if (data.middleName !== undefined)
            userUpdateData.middleName = data.middleName || null;
        const patientUpdateData = {};
        if (data.birthDate !== undefined) {
            patientUpdateData.birthDate = data.birthDate ? new Date(data.birthDate) : null;
        }
        if (data.avatarUrl !== undefined) {
            patientUpdateData.avatarUrl = data.avatarUrl;
        }
        if (data.trustedContact !== undefined) {
            patientUpdateData.trustedContact = data.trustedContact || null;
        }
        await this.prisma.$transaction(async (tx) => {
            if (Object.keys(userUpdateData).length > 0) {
                await tx.user.update({
                    where: { id: patientUserId },
                    data: userUpdateData,
                });
            }
            await tx.patient.update({
                where: { userId: patientUserId },
                data: patientUpdateData,
            });
        });
        return this.getProfile(patientUserId);
    }
    async getTrainers(patientUserId) {
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
            throw new common_1.NotFoundException('Patient profile not found');
        }
        return patient.assignments;
    }
    async getMedicalData(patientUserId) {
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
            throw new common_1.NotFoundException('Patient profile not found');
        }
        return patient.medicalData;
    }
    async updateTariff(patientUserId, tariffId) {
        const patient = await this.prisma.patient.findUnique({
            where: { userId: patientUserId },
        });
        if (!patient) {
            throw new common_1.NotFoundException('Patient profile not found');
        }
        const tariff = await this.prisma.tariff.findUnique({
            where: { id: tariffId },
        });
        if (!tariff) {
            throw new common_1.NotFoundException('Tariff not found');
        }
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
    async getAssignments(patientUserId) {
        const patient = await this.prisma.patient.findUnique({
            where: { userId: patientUserId },
        });
        if (!patient) {
            throw new common_1.NotFoundException('Patient profile not found');
        }
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
        return assignments.map((assignment) => {
            const trainer = assignment.trainer;
            const sectionParts = trainer.section.split('.');
            const categoryNumber = sectionParts[0] || '';
            const subsectionNumber = sectionParts[1] || '';
            const categoryMap = {
                '1': 'Тесты',
                '2': 'Буквы',
                '3': 'Слоги',
                '4': 'Слова',
                '5': 'Грамматика',
            };
            const sectionMap = {
                '1.1': 'Известные ряды понятий',
                '1.2': 'Фразы и предложения, знакомые с детства',
                '2.1': 'Составление слов из букв',
                '3.1': 'Составление слов из слогов',
                '4.1': 'Антонимы и синонимы',
                '5.1': 'Число (единственное и множественное)',
            };
            const category = categoryMap[categoryNumber] || 'Тесты';
            const sectionName = sectionMap[trainer.section] || trainer.description || trainer.title || 'Не указано';
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
    async getAchievements(patientUserId) {
        const patient = await this.prisma.patient.findUnique({
            where: { userId: patientUserId },
        });
        if (!patient) {
            throw new common_1.NotFoundException('Patient profile not found');
        }
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
        return sessions.map((session, index) => {
            const trainer = session.assignment.trainer;
            const sectionParts = trainer.section.split('.');
            const categoryNumber = sectionParts[0] || '';
            const subsectionNumber = sectionParts[1] || '';
            const categoryMap = {
                '1': 'Тесты',
                '2': 'Буквы',
                '3': 'Слоги',
                '4': 'Слова',
                '5': 'Грамматика',
            };
            const sectionMap = {
                '1.1': 'Известные ряды понятий',
                '1.2': 'Работа с изображениями',
                '2.1': 'Составление слов из букв',
                '3.1': 'Составление слов из слогов',
                '4.1': 'Антонимы и синонимы',
                '5.1': 'Число (единственное и множественное)',
            };
            const category = categoryMap[categoryNumber] || 'Тесты';
            const section = sectionMap[trainer.section] || trainer.section || 'Не указано';
            const subsection = trainer.description || trainer.title || 'Не указано';
            let trainerNumber = 119;
            if (trainer.id) {
                const hash = trainer.id.split('').reduce((acc, char) => {
                    return ((acc << 5) - acc) + char.charCodeAt(0);
                }, 0);
                trainerNumber = Math.abs(hash) % 1000;
                if (trainerNumber < 100)
                    trainerNumber += 100;
            }
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
};
exports.PatientService = PatientService;
exports.PatientService = PatientService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PatientService);
//# sourceMappingURL=patient.service.js.map