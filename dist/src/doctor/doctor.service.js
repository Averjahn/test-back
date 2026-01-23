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
exports.DoctorService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let DoctorService = class DoctorService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getPatients(doctorUserId) {
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
            throw new common_1.NotFoundException('Doctor profile not found');
        }
        return doctor.patients.map((pd) => pd.patient);
    }
    async assignTrainer(doctorUserId, patientId, trainerId) {
        const doctor = await this.prisma.doctor.findUnique({
            where: { userId: doctorUserId },
        });
        if (!doctor) {
            throw new common_1.NotFoundException('Doctor profile not found');
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
            throw new common_1.ForbiddenException('You can only assign trainers to your own patients');
        }
        const trainer = await this.prisma.trainer.findUnique({
            where: { id: trainerId },
        });
        if (!trainer) {
            throw new common_1.NotFoundException('Trainer not found');
        }
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
    async getPatientData(doctorUserId, patientId) {
        const doctor = await this.prisma.doctor.findUnique({
            where: { userId: doctorUserId },
        });
        if (!doctor) {
            throw new common_1.NotFoundException('Doctor profile not found');
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
            throw new common_1.ForbiddenException('You can only access your own patients');
        }
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
            throw new common_1.NotFoundException('Patient not found');
        }
        return patient;
    }
    async createMedicalData(doctorUserId, patientId, type, data) {
        const doctor = await this.prisma.doctor.findUnique({
            where: { userId: doctorUserId },
        });
        if (!doctor) {
            throw new common_1.NotFoundException('Doctor profile not found');
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
            throw new common_1.ForbiddenException('You can only add medical data for your own patients');
        }
        if ((type === 'recommendation' || type === 'note') && data.isCurrent) {
            const existingRecords = await this.prisma.medicalData.findMany({
                where: {
                    patientId,
                    type,
                },
            });
            for (const record of existingRecords) {
                const recordData = record.data;
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
    async deleteMedicalData(doctorUserId, patientId, medicalDataId) {
        const doctor = await this.prisma.doctor.findUnique({
            where: { userId: doctorUserId },
        });
        if (!doctor) {
            throw new common_1.NotFoundException('Doctor profile not found');
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
            throw new common_1.ForbiddenException('You can only delete medical data for your own patients');
        }
        const medicalData = await this.prisma.medicalData.findUnique({
            where: { id: medicalDataId },
        });
        if (!medicalData || medicalData.patientId !== patientId) {
            throw new common_1.NotFoundException('Medical data not found');
        }
        return this.prisma.medicalData.delete({
            where: { id: medicalDataId },
        });
    }
    async getPatientDiary(doctorUserId, patientId) {
        const doctor = await this.prisma.doctor.findUnique({
            where: { userId: doctorUserId },
        });
        if (!doctor) {
            throw new common_1.NotFoundException('Doctor profile not found');
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
            throw new common_1.ForbiddenException('You can only access diary of your own patients');
        }
        const patient = await this.prisma.patient.findUnique({
            where: { id: patientId },
        });
        if (!patient) {
            throw new common_1.NotFoundException('Patient not found');
        }
        return this.prisma.diaryEntry.findMany({
            where: { patientId: patient.id },
            orderBy: { date: 'desc' },
        });
    }
};
exports.DoctorService = DoctorService;
exports.DoctorService = DoctorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DoctorService);
//# sourceMappingURL=doctor.service.js.map