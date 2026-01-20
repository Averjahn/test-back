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
                description: string | null;
                id: string;
                createdAt: Date;
                title: string;
                updatedAt: Date;
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
            doctorId: string;
            patientId: string;
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
        userId: string;
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
            createdAt: Date;
            userId: string;
            birthDate: Date | null;
            avatarUrl: string | null;
            trustedContact: string | null;
            tariffId: string | null;
        };
        trainer: {
            description: string | null;
            id: string;
            createdAt: Date;
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
                description: string | null;
                id: string;
                createdAt: Date;
                title: string;
                updatedAt: Date;
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
            doctorId: string;
            patientId: string;
            trainerId: string;
        })[];
        medicalData: {
            type: string;
            id: string;
            createdAt: Date;
            data: import("@prisma/client/runtime/client").JsonValue;
            patientId: string;
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
        userId: string;
        birthDate: Date | null;
        avatarUrl: string | null;
        trustedContact: string | null;
        tariffId: string | null;
    }>;
    createMedicalData(user: User, patientId: string, dto: CreateMedicalDataDto): Promise<{
        type: string;
        id: string;
        createdAt: Date;
        data: import("@prisma/client/runtime/client").JsonValue;
        patientId: string;
    }>;
    deleteMedicalData(user: User, patientId: string, medicalDataId: string): Promise<{
        type: string;
        id: string;
        createdAt: Date;
        data: import("@prisma/client/runtime/client").JsonValue;
        patientId: string;
    }>;
}
