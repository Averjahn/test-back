import { PrismaService } from '../prisma/prisma.service';
export declare class DoctorService {
    private prisma;
    constructor(prisma: PrismaService);
    getPatients(doctorUserId: string): Promise<({
        user: {
            id: string;
            email: string;
            firstName: string | null;
            lastName: string | null;
            middleName: string | null;
            login: string;
        };
        assignments: ({
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
        })[];
        tariff: {
            id: string;
            createdAt: Date;
            title: string;
            price: number;
            discount: number;
            imageUrl: string | null;
            updatedAt: Date;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        birthDate: Date | null;
        avatarUrl: string | null;
        trustedContact: string | null;
        tariffId: string | null;
        userId: string;
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
    getPatientData(doctorUserId: string, patientId: string): Promise<{
        user: {
            id: string;
            email: string;
            firstName: string | null;
            lastName: string | null;
            middleName: string | null;
            login: string;
        };
        assignments: ({
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
        })[];
        medicalData: {
            data: import("@prisma/client/runtime/client").JsonValue;
            id: string;
            createdAt: Date;
            patientId: string;
            type: string;
        }[];
        tariff: {
            id: string;
            createdAt: Date;
            title: string;
            price: number;
            discount: number;
            imageUrl: string | null;
            updatedAt: Date;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        birthDate: Date | null;
        avatarUrl: string | null;
        trustedContact: string | null;
        tariffId: string | null;
        userId: string;
    }>;
    createMedicalData(doctorUserId: string, patientId: string, type: string, data: any): Promise<{
        data: import("@prisma/client/runtime/client").JsonValue;
        id: string;
        createdAt: Date;
        patientId: string;
        type: string;
    }>;
    deleteMedicalData(doctorUserId: string, patientId: string, medicalDataId: string): Promise<{
        data: import("@prisma/client/runtime/client").JsonValue;
        id: string;
        createdAt: Date;
        patientId: string;
        type: string;
    }>;
    getPatientDiary(doctorUserId: string, patientId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        patientId: string;
        date: Date;
        weather: string;
        mood: string;
        wellbeing: string;
        content: string;
    }[]>;
}
