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
exports.DoctorController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const doctor_service_1 = require("./doctor.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const client_1 = require("@prisma/client");
const assign_trainer_dto_1 = require("./dto/assign-trainer.dto");
const create_medical_data_dto_1 = require("./dto/create-medical-data.dto");
let DoctorController = class DoctorController {
    doctorService;
    constructor(doctorService) {
        this.doctorService = doctorService;
    }
    async getPatients(user) {
        return this.doctorService.getPatients(user.id);
    }
    async assignTrainer(user, dto) {
        return this.doctorService.assignTrainer(user.id, dto.patientId, dto.trainerId);
    }
    async getPatientData(user, patientId) {
        return this.doctorService.getPatientData(user.id, patientId);
    }
    async createMedicalData(user, patientId, dto) {
        return this.doctorService.createMedicalData(user.id, patientId, dto.type, dto.data);
    }
    async deleteMedicalData(user, patientId, medicalDataId) {
        return this.doctorService.deleteMedicalData(user.id, patientId, medicalDataId);
    }
};
exports.DoctorController = DoctorController;
__decorate([
    (0, common_1.Get)('patients'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all patients assigned to doctor' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of patients' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden (Doctor only)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DoctorController.prototype, "getPatients", null);
__decorate([
    (0, common_1.Post)('assign-trainer'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Assign trainer to patient' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Trainer assigned to patient' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation error' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden (Doctor only) or patient not assigned' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Patient or Trainer not found' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, assign_trainer_dto_1.AssignTrainerDto]),
    __metadata("design:returntype", Promise)
], DoctorController.prototype, "assignTrainer", null);
__decorate([
    (0, common_1.Get)('patient/:id/data'),
    (0, swagger_1.ApiOperation)({ summary: 'Get patient data (medical records, assignments, sessions)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Patient data' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden (Doctor only) or patient not assigned' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Patient not found' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DoctorController.prototype, "getPatientData", null);
__decorate([
    (0, common_1.Post)('patient/:id/medical-data'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create medical data (recommendation or note) for patient' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Medical data created' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden (Doctor only) or patient not assigned' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Patient not found' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, create_medical_data_dto_1.CreateMedicalDataDto]),
    __metadata("design:returntype", Promise)
], DoctorController.prototype, "createMedicalData", null);
__decorate([
    (0, common_1.Delete)('patient/:id/medical-data/:medicalDataId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete medical data' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Medical data deleted' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden (Doctor only) or patient not assigned' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Medical data not found' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('medicalDataId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], DoctorController.prototype, "deleteMedicalData", null);
exports.DoctorController = DoctorController = __decorate([
    (0, swagger_1.ApiTags)('doctor'),
    (0, common_1.Controller)('doctor'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.DOCTOR),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [doctor_service_1.DoctorService])
], DoctorController);
//# sourceMappingURL=doctor.controller.js.map