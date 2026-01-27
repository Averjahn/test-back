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
            email: string;
            passwordHash: string;
            role: import("@prisma/client").$Enums.UserRole;
            firstName: string | null;
            lastName: string | null;
            middleName: string | null;
            createdAt: Date;
            login: string;
        };
    } & {
        id: string;
        createdAt: Date;
        birthDate: Date | null;
        avatarUrl: string | null;
        trustedContact: string | null;
        tariffId: string | null;
        userId: string;
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
            email: string;
            passwordHash: string;
            role: import("@prisma/client").$Enums.UserRole;
            firstName: string | null;
            lastName: string | null;
            middleName: string | null;
            createdAt: Date;
            login: string;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
    }) | null>;
    assignDoctor(patientId: string, doctorId: string): Promise<{
        patientId: string;
        doctorId: string;
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
            title: string;
            description: string | null;
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
        title: string;
        updatedAt: Date;
        description: string | null;
        iframeUrl: string;
        section: string;
    }>;
    assignTrainer(patientId: string, trainerId: string, doctorId?: string): Promise<{
        doctor: {
            user: {
                id: string;
                email: string;
                firstName: string | null;
                lastName: string | null;
                middleName: string | null;
                login: string;
            };
        } & {
            id: string;
            createdAt: Date;
            userId: string;
        };
        patient: {
            user: {
                id: string;
                email: string;
                firstName: string | null;
                lastName: string | null;
                middleName: string | null;
                login: string;
            };
        } & {
            id: string;
            createdAt: Date;
            birthDate: Date | null;
            avatarUrl: string | null;
            trustedContact: string | null;
            tariffId: string | null;
            userId: string;
        };
        trainer: {
            id: string;
            createdAt: Date;
            title: string;
            updatedAt: Date;
            description: string | null;
            iframeUrl: string;
            section: string;
        };
    } & {
        id: string;
        createdAt: Date;
        patientId: string;
        doctorId: string;
        trainerId: string;
    }>;
    getPatientDocuments(patientId: string): Promise<{
        id: string;
        title: string;
        type: string;
        fileUrl?: string | null;
        createdAt: Date;
        date?: Date;
        amount?: number;
    }[]>;
    createDocument(patientId: string, data: {
        title: string;
        type: string;
        fileUrl?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        updatedAt: Date;
        patientId: string;
        type: string;
        fileUrl: string | null;
    }>;
    deleteDocument(patientId: string, documentId: string): Promise<{
        message: string;
    }>;
    getAvailableDates(doctorId: string, startDate?: string, endDate?: string): Promise<string[]>;
    getTimeSlots(doctorId: string, date: string): Promise<{
        startTime: string;
        endTime: string;
        available: boolean;
        appointment?: {
            patientName: string;
            type: string;
        };
    }[]>;
    createAppointment(doctorId: string, dto: {
        patientId: string;
        date: string;
        startTime: string;
        type: string;
        notes?: string;
    }): Promise<{
        doctor: {
            user: {
                firstName: string | null;
                lastName: string | null;
                middleName: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            userId: string;
        };
        patient: {
            user: {
                firstName: string | null;
                lastName: string | null;
                middleName: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            birthDate: Date | null;
            avatarUrl: string | null;
            trustedContact: string | null;
            tariffId: string | null;
            userId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        patientId: string;
        doctorId: string;
        date: Date;
        startTime: string;
        endTime: string;
        type: string;
        notes: string | null;
    }>;
    initializeDefaultSchedulesForAllDoctors(): Promise<{
        totalDoctors: number;
        initializedCount: number;
        message: string;
    }>;
}
