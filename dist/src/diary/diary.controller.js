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
exports.DiaryController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const diary_service_1 = require("./diary.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const client_1 = require("@prisma/client");
const create_diary_entry_dto_1 = require("./dto/create-diary-entry.dto");
const update_diary_entry_dto_1 = require("./dto/update-diary-entry.dto");
let DiaryController = class DiaryController {
    diaryService;
    constructor(diaryService) {
        this.diaryService = diaryService;
    }
    async getEntries(user) {
        return this.diaryService.getEntries(user.id);
    }
    async getEntryById(user, entryId) {
        return this.diaryService.getEntryById(user.id, entryId);
    }
    async createEntry(user, dto) {
        return this.diaryService.createEntry(user.id, {
            ...dto,
            date: dto.date ? new Date(dto.date) : undefined,
        });
    }
    async updateEntry(user, entryId, dto) {
        return this.diaryService.updateEntry(user.id, entryId, {
            ...dto,
            date: dto.date ? new Date(dto.date) : undefined,
        });
    }
    async deleteEntry(user, entryId) {
        return this.diaryService.deleteEntry(user.id, entryId);
    }
};
exports.DiaryController = DiaryController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all diary entries' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of diary entries' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden (Patient only)' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Patient profile not found' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DiaryController.prototype, "getEntries", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get diary entry by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Diary entry data' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden (Patient only) or entry not owned' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Diary entry not found' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DiaryController.prototype, "getEntryById", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create new diary entry' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Diary entry successfully created' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation error' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden (Patient only)' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Patient profile not found' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_diary_entry_dto_1.CreateDiaryEntryDto]),
    __metadata("design:returntype", Promise)
], DiaryController.prototype, "createEntry", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update diary entry' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Diary entry successfully updated' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation error' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden (Patient only) or entry not owned' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Diary entry not found' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_diary_entry_dto_1.UpdateDiaryEntryDto]),
    __metadata("design:returntype", Promise)
], DiaryController.prototype, "updateEntry", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete diary entry' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Diary entry successfully deleted' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden (Patient only) or entry not owned' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Diary entry not found' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DiaryController.prototype, "deleteEntry", null);
exports.DiaryController = DiaryController = __decorate([
    (0, swagger_1.ApiTags)('diary'),
    (0, common_1.Controller)('patient/diary'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.PATIENT),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [diary_service_1.DiaryService])
], DiaryController);
//# sourceMappingURL=diary.controller.js.map