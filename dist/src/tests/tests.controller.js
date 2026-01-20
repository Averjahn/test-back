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
exports.TestsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const tests_service_1 = require("./tests.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const client_1 = require("@prisma/client");
const start_session_dto_1 = require("./dto/start-session.dto");
const submit_answer_dto_1 = require("./dto/submit-answer.dto");
const finish_session_dto_1 = require("./dto/finish-session.dto");
let TestsController = class TestsController {
    testsService;
    constructor(testsService) {
        this.testsService = testsService;
    }
    async startSession(user, dto) {
        console.log('Start session request:', { userId: user.id, role: user.role, assignmentId: dto.assignmentId });
        if (dto.assignmentId === 'preview') {
            console.log('Preview mode - returning mock session');
            return {
                id: 'preview-session-' + Date.now(),
                assignmentId: 'preview',
                startedAt: new Date(),
                finishedAt: null,
                correct: 0,
                incorrect: 0,
                durationSec: 0,
                assignment: {
                    id: 'preview',
                    trainer: {
                        id: 'preview-trainer',
                        title: 'Preview Mode',
                        section: '1.1'
                    }
                }
            };
        }
        if (user.role !== client_1.UserRole.PATIENT) {
            throw new common_1.ForbiddenException('Only patients can start test sessions');
        }
        return this.testsService.startSession(user.id, dto.assignmentId);
    }
    async submitAnswer(user, dto) {
        return this.testsService.submitAnswer(user.id, dto.sessionId, dto.questionId, dto.answer, dto.isCorrect);
    }
    async finishSession(user, dto) {
        return this.testsService.finishSession(user.id, dto.sessionId);
    }
};
exports.TestsController = TestsController;
__decorate([
    (0, common_1.Post)('start-session'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Start test session' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Session started' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation error or active session exists' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Assignment not found' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, start_session_dto_1.StartSessionDto]),
    __metadata("design:returntype", Promise)
], TestsController.prototype, "startSession", null);
__decorate([
    (0, common_1.Post)('answer'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Submit answer to question' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Answer submitted' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation error or session finished' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden (Patient only)' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Session not found' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, submit_answer_dto_1.SubmitAnswerDto]),
    __metadata("design:returntype", Promise)
], TestsController.prototype, "submitAnswer", null);
__decorate([
    (0, common_1.Post)('finish'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Finish test session' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Session finished' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation error or session already finished' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden (Patient only)' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Session not found' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, finish_session_dto_1.FinishSessionDto]),
    __metadata("design:returntype", Promise)
], TestsController.prototype, "finishSession", null);
exports.TestsController = TestsController = __decorate([
    (0, swagger_1.ApiTags)('tests'),
    (0, common_1.Controller)('tests'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [tests_service_1.TestsService])
], TestsController);
//# sourceMappingURL=tests.controller.js.map