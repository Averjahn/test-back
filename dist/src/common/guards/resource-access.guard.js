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
exports.ResourceAccessGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const client_1 = require("@prisma/client");
const resource_decorator_1 = require("../decorators/resource.decorator");
const prisma_service_1 = require("../../prisma/prisma.service");
let ResourceAccessGuard = class ResourceAccessGuard {
    reflector;
    prisma;
    constructor(reflector, prisma) {
        this.reflector = reflector;
        this.prisma = prisma;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            throw new common_1.ForbiddenException('User not authenticated');
        }
        if (user.role === client_1.UserRole.ADMIN) {
            return true;
        }
        const resourceMetadata = this.reflector.get(resource_decorator_1.RESOURCE_TYPE_KEY, context.getHandler());
        if (!resourceMetadata) {
            return true;
        }
        const { type, paramName } = resourceMetadata;
        const resourceId = request.params[paramName] || request.body[paramName];
        if (!resourceId) {
            return true;
        }
        switch (type) {
            case resource_decorator_1.ResourceType.PATIENT:
                return this.checkPatientAccess(user, resourceId);
            case resource_decorator_1.ResourceType.DOCTOR:
                return this.checkDoctorAccess(user, resourceId);
            case resource_decorator_1.ResourceType.USER:
                return this.checkUserAccess(user, resourceId);
            default:
                return true;
        }
    }
    async checkPatientAccess(user, patientId) {
        const patient = await this.prisma.patient.findUnique({
            where: { id: patientId },
        });
        if (!patient) {
            throw new common_1.NotFoundException('Patient not found');
        }
        if (user.role === client_1.UserRole.PATIENT) {
            if (patient.userId !== user.id) {
                throw new common_1.ForbiddenException('Access denied: You can only access your own data');
            }
            return true;
        }
        if (user.role === client_1.UserRole.DOCTOR) {
            const doctor = await this.prisma.doctor.findUnique({
                where: { userId: user.id },
            });
            if (!doctor) {
                throw new common_1.ForbiddenException('Doctor profile not found');
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
                throw new common_1.ForbiddenException('Access denied: You can only access your own patients');
            }
            return true;
        }
        return false;
    }
    async checkDoctorAccess(user, doctorId) {
        const doctor = await this.prisma.doctor.findUnique({
            where: { id: doctorId },
        });
        if (!doctor) {
            throw new common_1.NotFoundException('Doctor not found');
        }
        if (user.role === client_1.UserRole.DOCTOR) {
            if (doctor.userId !== user.id) {
                throw new common_1.ForbiddenException('Access denied: You can only access your own data');
            }
            return true;
        }
        if (user.role === client_1.UserRole.PATIENT) {
            throw new common_1.ForbiddenException('Access denied');
        }
        return false;
    }
    async checkUserAccess(user, userId) {
        const targetUser = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!targetUser) {
            throw new common_1.NotFoundException('User not found');
        }
        if (user.id !== userId) {
            throw new common_1.ForbiddenException('Access denied: You can only access your own data');
        }
        return true;
    }
};
exports.ResourceAccessGuard = ResourceAccessGuard;
exports.ResourceAccessGuard = ResourceAccessGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        prisma_service_1.PrismaService])
], ResourceAccessGuard);
//# sourceMappingURL=resource-access.guard.js.map