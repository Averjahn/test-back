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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const patients_service_1 = require("./patients.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const resource_access_guard_1 = require("../common/guards/resource-access.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const resource_decorator_1 = require("../common/decorators/resource.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const client_1 = require("@prisma/client");
const create_patient_dto_1 = require("./dto/create-patient.dto");
let PatientsController = class PatientsController {
    patientsService;
    constructor(patientsService) {
        this.patientsService = patientsService;
    }
    async create(dto) {
        const bcrypt = await import('bcryptjs');
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(dto.password, saltRounds);
        const patient = await this.patientsService.createPatient({
            email: dto.email,
            passwordHash,
            firstName: dto.firstName,
            lastName: dto.lastName,
            middleName: dto.middleName,
        });
        return patient;
    }
    async findAll(user) {
        return this.patientsService.findAll(user.id, user.role);
    }
    async findById(id) {
        return this.patientsService.findById(id);
    }
};
exports.PatientsController = PatientsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Create new patient (Admin only)' }),
    (0, swagger_1.ApiBody)({
        type: create_patient_dto_1.CreatePatientDto,
        examples: {
            default: {
                summary: 'Create patient',
                value: {
                    email: 'new.patient@example.com',
                    password: 'password123',
                    firstName: 'Пётр',
                    lastName: 'Петров',
                    middleName: 'Петрович',
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Patient successfully created',
        schema: {
            example: {
                id: 'patient-profile-uuid',
                userId: 'user-uuid',
                createdAt: '2026-01-19T12:00:00.000Z',
                user: {
                    id: 'user-uuid',
                    email: 'new.patient@example.com',
                    role: 'PATIENT',
                    firstName: 'Пётр',
                    lastName: 'Петров',
                    middleName: 'Петрович',
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Validation error',
        schema: {
            example: {
                statusCode: 400,
                message: ['email must be an email', 'password must be longer than or equal to 6 characters'],
                error: 'Bad Request',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden (only ADMIN can create patients)',
        schema: {
            example: {
                statusCode: 403,
                message: 'Insufficient permissions',
                error: 'Forbidden',
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_patient_dto_1.CreatePatientDto]),
    __metadata("design:returntype", Promise)
], PatientsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.DOCTOR, client_1.UserRole.PATIENT),
    (0, swagger_1.ApiOperation)({ summary: 'Get patients (filtered by role)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of patients' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PatientsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.DOCTOR, client_1.UserRole.PATIENT),
    (0, resource_decorator_1.Resource)(resource_decorator_1.ResourceType.PATIENT, 'id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get patient by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Patient data' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Patient not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PatientsController.prototype, "findById", null);
exports.PatientsController = PatientsController = __decorate([
    (0, swagger_1.ApiTags)('patients'),
    (0, common_1.Controller)('patients'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, resource_access_guard_1.ResourceAccessGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [patients_service_1.PatientsService])
], PatientsController);
//# sourceMappingURL=patients.controller.js.map