import { PrismaService } from '../prisma/prisma.service';
export declare class PatientService {
    private prisma;
    constructor(prisma: PrismaService);
    getProfile(patientUserId: string): Promise<{
        user: {
            id: string;
            createdAt: Date;
            email: string;
            login: string;
            role: import("@prisma/client").$Enums.UserRole;
            firstName: string | null;
            lastName: string | null;
            middleName: string | null;
        };
        tariff: ({
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
        }) | null;
        doctors: ({
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
        } & {
            doctorId: string;
            patientId: string;
        })[];
    } & {
        id: string;
        userId: string;
        createdAt: Date;
        birthDate: Date | null;
        avatarUrl: string | null;
        trustedContact: string | null;
        tariffId: string | null;
    }>;
    getTrainers(patientUserId: string): Promise<({
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
        sessions: {
            id: string;
            startedAt: Date;
            assignmentId: string;
            finishedAt: Date | null;
            correct: number;
            incorrect: number;
            durationSec: number;
        }[];
    } & {
        id: string;
        createdAt: Date;
        doctorId: string;
        patientId: string;
        trainerId: string;
    })[]>;
    getMedicalData(patientUserId: string): Promise<{
        id: string;
        type: string;
        createdAt: Date;
        patientId: string;
        data: import("@prisma/client/runtime/client").JsonValue;
    }[]>;
    updateTariff(patientUserId: string, tariffId: string): Promise<{
        tariff: ({
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
        }) | null;
    } & {
        id: string;
        userId: string;
        createdAt: Date;
        birthDate: Date | null;
        avatarUrl: string | null;
        trustedContact: string | null;
        tariffId: string | null;
    }>;
}
