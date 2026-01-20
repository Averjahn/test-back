import { PrismaService } from '../prisma/prisma.service';
import { User, UserRole } from '@prisma/client';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findByEmail(email: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    findAll(): Promise<User[]>;
    create(email: string, passwordHash: string, role: UserRole, firstName?: string, lastName?: string, middleName?: string, login?: string): Promise<User>;
}
