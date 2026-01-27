import { DoctorService } from './doctor.service';
import { type User } from '@prisma/client';
import { AssignTrainerDto } from './dto/assign-trainer.dto';
import { CreateMedicalDataDto } from './dto/create-medical-data.dto';
export declare class DoctorController {
    private doctorService;
    constructor(doctorService: DoctorService);
    getPatients(user: User): Promise<({
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
    getPatientData(user: User, patientId: string): Promise<{
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
    createMedicalData(user: User, patientId: string, dto: CreateMedicalDataDto): Promise<{
        data: import("@prisma/client/runtime/client").JsonValue;
        id: string;
        createdAt: Date;
        patientId: string;
        type: string;
    }>;
    deleteMedicalData(user: User, patientId: string, medicalDataId: string): Promise<{
        data: import("@prisma/client/runtime/client").JsonValue;
        id: string;
        createdAt: Date;
        patientId: string;
        type: string;
    }>;
    getPatientDiary(user: User, patientId: string): Promise<{
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
