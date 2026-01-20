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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const admin_service_1 = require("./admin.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const create_patient_dto_1 = require("./dto/create-patient.dto");
const create_doctor_dto_1 = require("./dto/create-doctor.dto");
const assign_doctor_dto_1 = require("./dto/assign-doctor.dto");
const create_tariff_dto_1 = require("./dto/create-tariff.dto");
const create_trainer_dto_1 = require("../trainers/dto/create-trainer.dto");
const assign_trainer_dto_1 = require("./dto/assign-trainer.dto");
let AdminController = class AdminController {
    adminService;
    constructor(adminService) {
        this.adminService = adminService;
    }
    async createPatient(dto) {
        return this.adminService.createPatient({
            ...dto,
            birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
        });
    }
    async createDoctor(dto) {
        return this.adminService.createDoctor(dto);
    }
    async assignDoctor(dto) {
        return this.adminService.assignDoctor(dto.patientId, dto.doctorId);
    }
    async createTariff(dto) {
        return this.adminService.createTariff(dto);
    }
    async createTrainer(dto) {
        return this.adminService.createTrainer(dto);
    }
    async assignTrainer(dto) {
        return this.adminService.assignTrainer(dto.patientId, dto.trainerId, dto.doctorId);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Post)('patients'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create new patient (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Patient successfully created' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation error' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'User already exists' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_patient_dto_1.CreatePatientDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createPatient", null);
__decorate([
    (0, common_1.Post)('doctors'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create new doctor (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Doctor successfully created' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation error' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'User already exists' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_doctor_dto_1.CreateDoctorDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createDoctor", null);
__decorate([
    (0, common_1.Post)('assign-doctor'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Assign doctor to patient (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Doctor assigned to patient' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation error' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Patient or Doctor not found' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [assign_doctor_dto_1.AssignDoctorDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "assignDoctor", null);
__decorate([
    (0, common_1.Post)('tariffs'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create new tariff (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Tariff successfully created' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation error' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden (Admin only)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_tariff_dto_1.CreateTariffDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createTariff", null);
__decorate([
    (0, common_1.Post)('trainers'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create new trainer (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Trainer successfully created' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation error' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden (Admin only)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_trainer_dto_1.CreateTrainerDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createTrainer", null);
__decorate([
    (0, common_1.Post)('assign-trainer'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Assign trainer to patient (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Trainer assigned to patient' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation error' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Patient, Trainer or Doctor not found' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [assign_trainer_dto_1.AssignTrainerDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "assignTrainer", null);
exports.AdminController = AdminController = __decorate([
    (0, swagger_1.ApiTags)('admin'),
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map