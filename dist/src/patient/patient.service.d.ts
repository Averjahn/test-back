import { PrismaService } from '../prisma/prisma.service';
export declare class PatientService {
    private prisma;
    constructor(prisma: PrismaService);
    getProfile(patientUserId: string): Promise<{
        user: {
            id: string;
            email: string;
            role: import("@prisma/client").$Enums.UserRole;
            firstName: string | null;
            lastName: string | null;
            middleName: string | null;
            createdAt: Date;
            login: string;
        };
        doctors: ({
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
        } & {
            patientId: string;
            doctorId: string;
        })[];
        tariff: ({
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
        }) | null;
    } & {
        id: string;
        createdAt: Date;
        birthDate: Date | null;
        avatarUrl: string | null;
        trustedContact: string | null;
        tariffId: string | null;
        userId: string;
    }>;
    getTrainers(patientUserId: string): Promise<({
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
        trainer: {
            id: string;
            createdAt: Date;
            title: string;
            updatedAt: Date;
            description: string | null;
            iframeUrl: string;
            section: string;
        };
        sessions: {
            id: string;
            startedAt: Date;
            finishedAt: Date | null;
            correct: number;
            incorrect: number;
            durationSec: number;
            assignmentId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        patientId: string;
        doctorId: string;
        trainerId: string;
    })[]>;
    getMedicalData(patientUserId: string): Promise<{
        data: import("@prisma/client/runtime/client").JsonValue;
        id: string;
        createdAt: Date;
        patientId: string;
        type: string;
    }[]>;
    updateTariff(patientUserId: string, tariffId: string): Promise<{
        tariff: ({
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
        }) | null;
    } & {
        id: string;
        createdAt: Date;
        birthDate: Date | null;
        avatarUrl: string | null;
        trustedContact: string | null;
        tariffId: string | null;
        userId: string;
    }>;
    getAssignments(patientUserId: string): Promise<{
        id: string;
        date: string;
        recommendation: string;
        trainer: {
            id: string;
            title: string;
            section: string;
            description: string | null;
        };
        doctor: {
            id: string;
            firstName: string | null;
            lastName: string | null;
            middleName: string | null;
        };
        createdAt: Date;
    }[]>;
    getAchievements(patientUserId: string): Promise<{
        id: string;
        date: string;
        time: string;
        category: string;
        section: string;
        subsection: string;
        taskId: string;
        correct: number | null;
        incorrect: number | null;
        startedAt: Date;
        finishedAt: Date | null;
    }[]>;
}
