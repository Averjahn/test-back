import { DoctorService } from './doctor.service';
import { type User } from '@prisma/client';
import { AssignTrainerDto } from './dto/assign-trainer.dto';
import { CreateMedicalDataDto } from './dto/create-medical-data.dto';
export declare class DoctorController {
    private doctorService;
    constructor(doctorService: DoctorService);
    getPatients(user: User): Promise<({
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
    assignTrainer(user: User, dto: AssignTrainerDto): Promise<{
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
    getPatientData(user: User, patientId: string): Promise<{
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
    createMedicalData(user: User, patientId: string, dto: CreateMedicalDataDto): Promise<{
        id: string;
        createdAt: Date;
        patientId: string;
        data: import("@prisma/client/runtime/client").JsonValue;
        type: string;
    }>;
    deleteMedicalData(user: User, patientId: string, medicalDataId: string): Promise<{
        id: string;
        createdAt: Date;
        patientId: string;
        data: import("@prisma/client/runtime/client").JsonValue;
        type: string;
    }>;
    getPatientDiary(user: User, patientId: string): Promise<{
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
