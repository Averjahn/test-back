import { PrismaService } from '../prisma/prisma.service';
export declare class DoctorService {
    private prisma;
    constructor(prisma: PrismaService);
    getPatients(doctorUserId: string): Promise<({
        user: {
            id: string;
            email: string;
            login: string;
            firstName: string | null;
            lastName: string | null;
            middleName: string | null;
        };
        tariff: {
            id: string;
            createdAt: Date;
            title: string;
            price: number;
            discount: number;
            imageUrl: string | null;
            updatedAt: Date;
        } | null;
        assignments: ({
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
        })[];
    } & {
        id: string;
        userId: string;
        createdAt: Date;
        birthDate: Date | null;
        avatarUrl: string | null;
        trustedContact: string | null;
        tariffId: string | null;
    })[]>;
    assignTrainer(doctorUserId: string, patientId: string, trainerId: string): Promise<{
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
    getPatientData(doctorUserId: string, patientId: string): Promise<{
        user: {
            id: string;
            email: string;
            login: string;
            firstName: string | null;
            lastName: string | null;
            middleName: string | null;
        };
        tariff: {
            id: string;
            createdAt: Date;
            title: string;
            price: number;
            discount: number;
            imageUrl: string | null;
            updatedAt: Date;
        } | null;
        medicalData: {
            id: string;
            type: string;
            createdAt: Date;
            patientId: string;
            data: import("@prisma/client/runtime/client").JsonValue;
        }[];
        assignments: ({
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
    createMedicalData(doctorUserId: string, patientId: string, type: string, data: any): Promise<{
        id: string;
        type: string;
        createdAt: Date;
        patientId: string;
        data: import("@prisma/client/runtime/client").JsonValue;
    }>;
    deleteMedicalData(doctorUserId: string, patientId: string, medicalDataId: string): Promise<{
        id: string;
        type: string;
        createdAt: Date;
        patientId: string;
        data: import("@prisma/client/runtime/client").JsonValue;
    }>;
}
