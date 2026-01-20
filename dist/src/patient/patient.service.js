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
};
exports.PatientService = PatientService;
exports.PatientService = PatientService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PatientService);
//# sourceMappingURL=patient.service.js.map