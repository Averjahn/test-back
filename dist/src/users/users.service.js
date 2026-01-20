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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByEmail(email) {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }
    async findById(id) {
        return this.prisma.user.findUnique({
            where: { id },
            include: {
                patient: true,
                doctor: true,
            },
        });
    }
    async findAll() {
        return this.prisma.user.findMany({
            include: {
                patient: true,
                doctor: true,
            },
        });
    }
    async create(email, passwordHash, role, firstName, lastName, middleName, login) {
        const existingUser = await this.findByEmail(email);
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        const userLogin = login || email;
        const user = await this.prisma.user.create({
            data: {
                login: userLogin,
                email,
                passwordHash,
                role,
                firstName,
                lastName,
                middleName,
            },
        });
        if (role === client_1.UserRole.PATIENT) {
            await this.prisma.patient.create({
                data: {
                    userId: user.id,
                },
            });
        }
        else if (role === client_1.UserRole.DOCTOR) {
            await this.prisma.doctor.create({
                data: {
                    userId: user.id,
                },
            });
        }
        return user;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map