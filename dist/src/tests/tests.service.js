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
exports.TestsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let TestsService = class TestsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async startSession(userId, assignmentId) {
        const assignment = await this.prisma.assignment.findUnique({
            where: { id: assignmentId },
            include: {
                patient: {
                    include: {
                        user: true,
                    },
                },
            },
        });
        if (!assignment) {
            throw new common_1.NotFoundException('Assignment not found');
        }
        if (assignment.patient.userId !== userId) {
            throw new common_1.BadRequestException('You can only start sessions for your own assignments');
        }
        const activeSession = await this.prisma.testSession.findFirst({
            where: {
                assignmentId,
                finishedAt: null,
            },
        });
        if (activeSession) {
            throw new common_1.BadRequestException('You already have an active session for this assignment');
        }
        const session = await this.prisma.testSession.create({
            data: {
                assignmentId,
                startedAt: new Date(),
            },
            include: {
                assignment: {
                    include: {
                        trainer: true,
                    },
                },
            },
        });
        return session;
    }
    async submitAnswer(userId, sessionId, questionId, answer, isCorrect) {
        const session = await this.prisma.testSession.findUnique({
            where: { id: sessionId },
            include: {
                assignment: {
                    include: {
                        patient: {
                            include: {
                                user: true,
                            },
                        },
                    },
                },
            },
        });
        if (!session) {
            throw new common_1.NotFoundException('Session not found');
        }
        if (session.assignment.patient.userId !== userId) {
            throw new common_1.BadRequestException('You can only submit answers for your own sessions');
        }
        if (session.finishedAt) {
            throw new common_1.BadRequestException('Session is already finished');
        }
        const testAnswer = await this.prisma.testAnswer.create({
            data: {
                sessionId,
                questionId,
                answer,
                isCorrect,
            },
        });
        return testAnswer;
    }
    async finishSession(userId, sessionId) {
        const session = await this.prisma.testSession.findUnique({
            where: { id: sessionId },
            include: {
                assignment: {
                    include: {
                        patient: {
                            include: {
                                user: true,
                            },
                        },
                    },
                },
                answers: true,
            },
        });
        if (!session) {
            throw new common_1.NotFoundException('Session not found');
        }
        if (session.assignment.patient.userId !== userId) {
            throw new common_1.BadRequestException('You can only finish your own sessions');
        }
        if (session.finishedAt) {
            throw new common_1.BadRequestException('Session is already finished');
        }
        const correct = session.answers.filter((a) => a.isCorrect).length;
        const incorrect = session.answers.filter((a) => !a.isCorrect).length;
        const durationSec = Math.floor((new Date().getTime() - session.startedAt.getTime()) / 1000);
        const updatedSession = await this.prisma.testSession.update({
            where: { id: sessionId },
            data: {
                finishedAt: new Date(),
                correct,
                incorrect,
                durationSec,
            },
            include: {
                assignment: {
                    include: {
                        trainer: true,
                    },
                },
                answers: true,
            },
        });
        return updatedSession;
    }
};
exports.TestsService = TestsService;
exports.TestsService = TestsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TestsService);
//# sourceMappingURL=tests.service.js.map