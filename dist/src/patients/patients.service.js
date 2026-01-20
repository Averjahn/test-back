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
exports.PatientsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const doctors_service_1 = require("../doctors/doctors.service");
let PatientsService = class PatientsService {
    prisma;
    doctorsService;
    constructor(prisma, doctorsService) {
        this.prisma = prisma;
        this.doctorsService = doctorsService;
    }
    async findAll(currentUserId, currentUserRole) {
        if (currentUserRole === 'DOCTOR' && currentUserId) {
            const doctor = await this.doctorsService.findByUserId(currentUserId);
            if (doctor) {
                return this.findPatientsByDoctorId(doctor.id);
            }
        }
        if (currentUserRole === 'PATIENT' && currentUserId) {
            const patient = await this.findByUserId(currentUserId);
            return patient ? [patient] : [];
        }
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
                    },
                },
            },
        });
    }
    async findById(id) {
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
    async findByUserId(userId) {
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
    async findPatientsByDoctorId(doctorId) {
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
    async checkDoctorPatientAccess(doctorId, patientId) {
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
    async createPatient(data) {
        const { email, passwordHash, firstName, lastName, middleName } = data;
        const user = await this.prisma.user.create({
            data: {
                login: email,
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
        });
    }
};
exports.PatientsService = PatientsService;
exports.PatientsService = PatientsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        doctors_service_1.DoctorsService])
], PatientsService);
//# sourceMappingURL=patients.service.js.map