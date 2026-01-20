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
exports.TrainersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let TrainersService = class TrainersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(section) {
        const where = section ? { section } : {};
        return this.prisma.trainer.findMany({
            where,
            orderBy: [
                { section: 'asc' },
                { title: 'asc' },
            ],
        });
    }
    async findById(id) {
        const trainer = await this.prisma.trainer.findUnique({
            where: { id },
            include: {
                assignments: {
                    include: {
                        patient: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        email: true,
                                        login: true,
                                        firstName: true,
                                        lastName: true,
                                        middleName: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        if (!trainer) {
            throw new common_1.NotFoundException('Trainer not found');
        }
        return trainer;
    }
    async findBySection(section) {
        return this.prisma.trainer.findMany({
            where: { section },
            orderBy: { title: 'asc' },
        });
    }
    async getSections() {
        const trainers = await this.prisma.trainer.findMany({
            select: { section: true },
            distinct: ['section'],
            orderBy: { section: 'asc' },
        });
        return trainers.map(t => t.section);
    }
    async create(data) {
        return this.prisma.trainer.create({
            data,
        });
    }
    async update(id, data) {
        const trainer = await this.prisma.trainer.findUnique({
            where: { id },
        });
        if (!trainer) {
            throw new common_1.NotFoundException('Trainer not found');
        }
        return this.prisma.trainer.update({
            where: { id },
            data,
        });
    }
    async delete(id) {
        const trainer = await this.prisma.trainer.findUnique({
            where: { id },
        });
        if (!trainer) {
            throw new common_1.NotFoundException('Trainer not found');
        }
        const assignments = await this.prisma.assignment.findMany({
            where: { trainerId: id },
        });
        if (assignments.length > 0) {
            throw new Error('Cannot delete trainer with existing assignments');
        }
        return this.prisma.trainer.delete({
            where: { id },
        });
    }
};
exports.TrainersService = TrainersService;
exports.TrainersService = TrainersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TrainersService);
//# sourceMappingURL=trainers.service.js.map