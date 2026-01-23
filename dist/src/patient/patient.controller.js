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
exports.PatientController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const patient_service_1 = require("./patient.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const client_1 = require("@prisma/client");
const update_tariff_dto_1 = require("./dto/update-tariff.dto");
let PatientController = class PatientController {
    patientService;
    constructor(patientService) {
        this.patientService = patientService;
    }
    async getProfile(user) {
        return this.patientService.getProfile(user.id);
    }
    async getTrainers(user) {
        return this.patientService.getTrainers(user.id);
    }
    async getAssignments(user) {
        return this.patientService.getAssignments(user.id);
    }
    async getMedicalData(user) {
        return this.patientService.getMedicalData(user.id);
    }
    async updateTariff(user, dto) {
        return this.patientService.updateTariff(user.id, dto.tariffId);
    }
    async getAchievements(user) {
        return this.patientService.getAchievements(user.id);
    }
};
exports.PatientController = PatientController;
__decorate([
    (0, common_1.Get)('profile'),
    (0, swagger_1.ApiOperation)({ summary: 'Get patient profile' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Patient profile data' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden (Patient only)' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Patient profile not found' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PatientController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Get)('trainers'),
    (0, swagger_1.ApiOperation)({ summary: 'Get assigned trainers' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of assigned trainers' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden (Patient only)' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Patient profile not found' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PatientController.prototype, "getTrainers", null);
__decorate([
    (0, common_1.Get)('assignments'),
    (0, swagger_1.ApiOperation)({ summary: 'Get doctor assignments' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of doctor assignments' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden (Patient only)' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Patient profile not found' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PatientController.prototype, "getAssignments", null);
__decorate([
    (0, common_1.Get)('medical-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Get medical data' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of medical data records' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden (Patient only)' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Patient profile not found' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PatientController.prototype, "getMedicalData", null);
__decorate([
    (0, common_1.Put)('tariff'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Update patient tariff' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Tariff successfully updated' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation error' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden (Patient only)' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Patient or tariff not found' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_tariff_dto_1.UpdateTariffDto]),
    __metadata("design:returntype", Promise)
], PatientController.prototype, "updateTariff", null);
__decorate([
    (0, common_1.Get)('achievements'),
    (0, swagger_1.ApiOperation)({ summary: 'Get patient achievements (test statistics)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of test sessions with statistics' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden (Patient only)' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Patient profile not found' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PatientController.prototype, "getAchievements", null);
exports.PatientController = PatientController = __decorate([
    (0, swagger_1.ApiTags)('patient'),
    (0, common_1.Controller)('patient'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.PATIENT),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [patient_service_1.PatientService])
], PatientController);
//# sourceMappingURL=patient.controller.js.map