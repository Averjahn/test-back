import { PrismaService } from '../prisma/prisma.service';
import { Doctor } from '@prisma/client';
export declare class DoctorsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<Doctor[]>;
    findById(id: string): Promise<Doctor | null>;
    findByUserId(userId: string): Promise<Doctor | null>;
}
