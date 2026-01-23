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
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
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
const create_document_dto_1 = require("./dto/create-document.dto");
const create_appointment_dto_1 = require("./dto/create-appointment.dto");
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
    async getPatientDocuments(patientId) {
        return this.adminService.getPatientDocuments(patientId);
    }
    async uploadDocument(patientId, file, dto) {
        const fileUrl = `/uploads/documents/${file.filename}`;
        return this.adminService.createDocument(patientId, {
            title: dto.title,
            type: dto.type,
            fileUrl,
        });
    }
    async createDocument(patientId, dto) {
        return this.adminService.createDocument(patientId, dto);
    }
    async deleteDocument(patientId, documentId) {
        return this.adminService.deleteDocument(patientId, documentId);
    }
    async getAvailableDates(doctorId, startDate, endDate) {
        return this.adminService.getAvailableDates(doctorId, startDate, endDate);
    }
    async getTimeSlots(doctorId, date) {
        return this.adminService.getTimeSlots(doctorId, date);
    }
    async createAppointment(doctorId, dto) {
        return this.adminService.createAppointment(doctorId, dto);
    }
    async initializeDefaultSchedules() {
        return this.adminService.initializeDefaultSchedulesForAllDoctors();
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
__decorate([
    (0, common_1.Get)('patients/:patientId/documents'),
    (0, swagger_1.ApiOperation)({ summary: 'Get patient documents (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of patient documents' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Patient not found' }),
    __param(0, (0, common_1.Param)('patientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getPatientDocuments", null);
__decorate([
    (0, common_1.Post)('patients/:patientId/documents/upload'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: (0, path_1.join)(process.cwd(), 'uploads', 'documents'),
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const ext = (0, path_1.extname)(file.originalname);
                cb(null, `document-${uniqueSuffix}${ext}`);
            },
        }),
        limits: {
            fileSize: 10 * 1024 * 1024,
        },
    })),
    (0, swagger_1.ApiOperation)({ summary: 'Upload document file for patient (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Document file uploaded successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation error' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Patient not found' }),
    __param(0, (0, common_1.Param)('patientId')),
    __param(1, (0, common_1.UploadedFile)(new common_1.ParseFilePipe({
        fileIsRequired: true,
        validators: [
            new common_1.MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
        ],
    }))),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "uploadDocument", null);
__decorate([
    (0, common_1.Post)('patients/:patientId/documents'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create document for patient (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Document successfully created' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation error' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Patient not found' }),
    __param(0, (0, common_1.Param)('patientId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_document_dto_1.CreateDocumentDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createDocument", null);
__decorate([
    (0, common_1.Delete)('patients/:patientId/documents/:documentId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Delete patient document (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Document successfully deleted' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Patient or Document not found' }),
    __param(0, (0, common_1.Param)('patientId')),
    __param(1, (0, common_1.Param)('documentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteDocument", null);
__decorate([
    (0, common_1.Get)('doctors/:doctorId/available-dates'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get available dates for doctor (Admin only)',
        description: 'Returns available dates for the next 14 days (2 weeks) from today or from the specified startDate. Always returns a rolling window of 14 days.'
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of available dates (14 days ahead)' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Doctor not found' }),
    __param(0, (0, common_1.Param)('doctorId')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAvailableDates", null);
__decorate([
    (0, common_1.Get)('doctors/:doctorId/time-slots'),
    (0, swagger_1.ApiOperation)({ summary: 'Get time slots for doctor and date (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of time slots' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Doctor not found' }),
    __param(0, (0, common_1.Param)('doctorId')),
    __param(1, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getTimeSlots", null);
__decorate([
    (0, common_1.Post)('doctors/:doctorId/appointments'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create appointment (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Appointment successfully created' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation error' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Doctor or Patient not found' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Time slot already booked' }),
    __param(0, (0, common_1.Param)('doctorId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_appointment_dto_1.CreateAppointmentDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createAppointment", null);
__decorate([
    (0, common_1.Post)('doctors/initialize-schedules'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Initialize default schedules for all doctors without schedules (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Default schedules initialized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden (Admin only)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "initializeDefaultSchedules", null);
exports.AdminController = AdminController = __decorate([
    (0, swagger_1.ApiTags)('admin'),
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map