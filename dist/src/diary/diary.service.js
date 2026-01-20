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
exports.DiaryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let DiaryService = class DiaryService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getEntries(patientUserId) {
        const patient = await this.prisma.patient.findUnique({
            where: { userId: patientUserId },
        });
        if (!patient) {
            throw new common_1.NotFoundException('Patient profile not found');
        }
        return this.prisma.diaryEntry.findMany({
            where: { patientId: patient.id },
            orderBy: { date: 'desc' },
        });
    }
    async getEntryById(patientUserId, entryId) {
        const patient = await this.prisma.patient.findUnique({
            where: { userId: patientUserId },
        });
        if (!patient) {
            throw new common_1.NotFoundException('Patient profile not found');
        }
        const entry = await this.prisma.diaryEntry.findUnique({
            where: { id: entryId },
        });
        if (!entry) {
            throw new common_1.NotFoundException('Diary entry not found');
        }
        if (entry.patientId !== patient.id) {
            throw new common_1.ForbiddenException('You can only access your own diary entries');
        }
        return entry;
    }
    async createEntry(patientUserId, data) {
        const patient = await this.prisma.patient.findUnique({
            where: { userId: patientUserId },
        });
        if (!patient) {
            throw new common_1.NotFoundException('Patient profile not found');
        }
        return this.prisma.diaryEntry.create({
            data: {
                patientId: patient.id,
                date: data.date || new Date(),
                weather: data.weather,
                mood: data.mood,
                wellbeing: data.wellbeing,
                content: data.content,
            },
        });
    }
    async updateEntry(patientUserId, entryId, data) {
        const patient = await this.prisma.patient.findUnique({
            where: { userId: patientUserId },
        });
        if (!patient) {
            throw new common_1.NotFoundException('Patient profile not found');
        }
        const entry = await this.prisma.diaryEntry.findUnique({
            where: { id: entryId },
        });
        if (!entry) {
            throw new common_1.NotFoundException('Diary entry not found');
        }
        if (entry.patientId !== patient.id) {
            throw new common_1.ForbiddenException('You can only update your own diary entries');
        }
        return this.prisma.diaryEntry.update({
            where: { id: entryId },
            data: {
                ...(data.date && { date: data.date }),
                ...(data.weather && { weather: data.weather }),
                ...(data.mood && { mood: data.mood }),
                ...(data.wellbeing && { wellbeing: data.wellbeing }),
                ...(data.content && { content: data.content }),
            },
        });
    }
    async deleteEntry(patientUserId, entryId) {
        const patient = await this.prisma.patient.findUnique({
            where: { userId: patientUserId },
        });
        if (!patient) {
            throw new common_1.NotFoundException('Patient profile not found');
        }
        const entry = await this.prisma.diaryEntry.findUnique({
            where: { id: entryId },
        });
        if (!entry) {
            throw new common_1.NotFoundException('Diary entry not found');
        }
        if (entry.patientId !== patient.id) {
            throw new common_1.ForbiddenException('You can only delete your own diary entries');
        }
        return this.prisma.diaryEntry.delete({
            where: { id: entryId },
        });
    }
};
exports.DiaryService = DiaryService;
exports.DiaryService = DiaryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DiaryService);
//# sourceMappingURL=diary.service.js.map