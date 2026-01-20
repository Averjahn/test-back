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
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map