import { PrismaService } from '../prisma/prisma.service';
export declare class DoctorService {
    private prisma;
    constructor(prisma: PrismaService);
    getPatients(doctorUserId: string): Promise<({
        assignments: ({
            trainer: {
                id: string;
                createdAt: Date;
                title: string;
                description: string | null;
                iframeUrl: string;
                section: string;
                updatedAt: Date;
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
        user: {
            id: string;
            email: string;
            firstName: string | null;
            lastName: string | null;
            middleName: string | null;
            login: string;
        };
        tariff: {
            id: string;
            createdAt: Date;
            title: string;
            updatedAt: Date;
            price: number;
            discount: number;
            imageUrl: string | null;
        } | null;
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
                firstName: string | null;
                lastName: string | null;
                middleName: string | null;
                login: string;
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
            title: string;
            description: string | null;
            iframeUrl: string;
            section: string;
            updatedAt: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        doctorId: string;
        patientId: string;
        trainerId: string;
    }>;
    getPatientData(doctorUserId: string, patientId: string): Promise<{
        assignments: ({
            trainer: {
                id: string;
                createdAt: Date;
                title: string;
                description: string | null;
                iframeUrl: string;
                section: string;
                updatedAt: Date;
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
        user: {
            id: string;
            email: string;
            firstName: string | null;
            lastName: string | null;
            middleName: string | null;
            login: string;
        };
        tariff: {
            id: string;
            createdAt: Date;
            title: string;
            updatedAt: Date;
            price: number;
            discount: number;
            imageUrl: string | null;
        } | null;
        medicalData: {
            id: string;
            createdAt: Date;
            patientId: string;
            data: import("@prisma/client/runtime/client").JsonValue;
            type: string;
        }[];
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
        createdAt: Date;
        patientId: string;
        data: import("@prisma/client/runtime/client").JsonValue;
        type: string;
    }>;
    deleteMedicalData(doctorUserId: string, patientId: string, medicalDataId: string): Promise<{
        id: string;
        createdAt: Date;
        patientId: string;
        data: import("@prisma/client/runtime/client").JsonValue;
        type: string;
    }>;
    getPatientDiary(doctorUserId: string, patientId: string): Promise<{
        id: string;
        createdAt: Date;
        patientId: string;
        updatedAt: Date;
        date: Date;
        weather: string;
        mood: string;
        wellbeing: string;
        content: string;
    }[]>;
}
