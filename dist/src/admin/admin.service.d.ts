import { PrismaService } from '../prisma/prisma.service';
export declare class AdminService {
    private prisma;
    constructor(prisma: PrismaService);
    createPatient(data: {
        email: string;
        login: string;
        password: string;
        firstName?: string;
        lastName?: string;
        middleName?: string;
        birthDate?: Date;
    }): Promise<({
        user: {
            id: string;
            createdAt: Date;
            email: string;
            login: string;
            passwordHash: string;
            role: import("@prisma/client").$Enums.UserRole;
            firstName: string | null;
            lastName: string | null;
            middleName: string | null;
        };
    } & {
        id: string;
        userId: string;
        createdAt: Date;
        birthDate: Date | null;
        avatarUrl: string | null;
        trustedContact: string | null;
        tariffId: string | null;
    }) | null>;
    createDoctor(data: {
        email: string;
        login: string;
        password: string;
        firstName?: string;
        lastName?: string;
        middleName?: string;
    }): Promise<({
        user: {
            id: string;
            createdAt: Date;
            email: string;
            login: string;
            passwordHash: string;
            role: import("@prisma/client").$Enums.UserRole;
            firstName: string | null;
            lastName: string | null;
            middleName: string | null;
        };
    } & {
        id: string;
        userId: string;
        createdAt: Date;
    }) | null>;
    assignDoctor(patientId: string, doctorId: string): Promise<{
        doctorId: string;
        patientId: string;
    }>;
    createTariff(data: {
        title: string;
        price: number;
        discount?: number;
        imageUrl?: string;
        options?: Array<{
            title: string;
            description?: string;
        }>;
    }): Promise<{
        options: {
            id: string;
            createdAt: Date;
            tariffId: string;
            description: string | null;
            title: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        title: string;
        price: number;
        discount: number;
        imageUrl: string | null;
        updatedAt: Date;
    }>;
    createTrainer(data: {
        title: string;
        description?: string;
        iframeUrl: string;
        section: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        description: string | null;
        title: string;
        updatedAt: Date;
        iframeUrl: string;
        section: string;
    }>;
    assignTrainer(patientId: string, trainerId: string, doctorId?: string): Promise<{
        patient: {
            user: {
                id: string;
                email: string;
                login: string;
                firstName: string | null;
                lastName: string | null;
                middleName: string | null;
            };
        } & {
            id: string;
            userId: string;
            createdAt: Date;
            birthDate: Date | null;
            avatarUrl: string | null;
            trustedContact: string | null;
            tariffId: string | null;
        };
        doctor: {
            user: {
                id: string;
                email: string;
                login: string;
                firstName: string | null;
                lastName: string | null;
                middleName: string | null;
            };
        } & {
            id: string;
            userId: string;
            createdAt: Date;
        };
        trainer: {
            id: string;
            createdAt: Date;
            description: string | null;
            title: string;
            updatedAt: Date;
            iframeUrl: string;
            section: string;
        };
    } & {
        id: string;
        createdAt: Date;
        doctorId: string;
        patientId: string;
        trainerId: string;
    }>;
}
