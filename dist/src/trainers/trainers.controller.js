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
exports.TrainersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const trainers_service_1 = require("./trainers.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const create_trainer_dto_1 = require("./dto/create-trainer.dto");
const update_trainer_dto_1 = require("./dto/update-trainer.dto");
let TrainersController = class TrainersController {
    trainersService;
    constructor(trainersService) {
        this.trainersService = trainersService;
    }
    async findAll(section) {
        return this.trainersService.findAll(section);
    }
    async getSections() {
        return this.trainersService.getSections();
    }
    async findBySection(section) {
        return this.trainersService.findBySection(section);
    }
    async findById(id) {
        return this.trainersService.findById(id);
    }
    async create(dto) {
        return this.trainersService.create(dto);
    }
    async update(id, dto) {
        return this.trainersService.update(id, dto);
    }
    async delete(id) {
        return this.trainersService.delete(id);
    }
};
exports.TrainersController = TrainersController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.DOCTOR, client_1.UserRole.PATIENT),
    (0, swagger_1.ApiOperation)({ summary: 'Get all trainers (optionally filtered by section)' }),
    (0, swagger_1.ApiQuery)({ name: 'section', required: false, description: 'Filter by section (e.g., 1.1)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of trainers' }),
    __param(0, (0, common_1.Query)('section')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TrainersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('sections'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.DOCTOR, client_1.UserRole.PATIENT),
    (0, swagger_1.ApiOperation)({ summary: 'Get all available sections' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of sections' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TrainersController.prototype, "getSections", null);
__decorate([
    (0, common_1.Get)('section/:section'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.DOCTOR, client_1.UserRole.PATIENT),
    (0, swagger_1.ApiOperation)({ summary: 'Get trainers by section' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of trainers in section' }),
    __param(0, (0, common_1.Param)('section')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TrainersController.prototype, "findBySection", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.DOCTOR, client_1.UserRole.PATIENT),
    (0, swagger_1.ApiOperation)({ summary: 'Get trainer by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Trainer data' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Trainer not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TrainersController.prototype, "findById", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create new trainer (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Trainer successfully created' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation error' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden (Admin only)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_trainer_dto_1.CreateTrainerDto]),
    __metadata("design:returntype", Promise)
], TrainersController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Update trainer (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Trainer successfully updated' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation error' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Trainer not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_trainer_dto_1.UpdateTrainerDto]),
    __metadata("design:returntype", Promise)
], TrainersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete trainer (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Trainer successfully deleted' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Trainer not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Cannot delete trainer with assignments' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TrainersController.prototype, "delete", null);
exports.TrainersController = TrainersController = __decorate([
    (0, swagger_1.ApiTags)('trainers'),
    (0, common_1.Controller)('trainers'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [trainers_service_1.TrainersService])
], TrainersController);
//# sourceMappingURL=trainers.controller.js.map