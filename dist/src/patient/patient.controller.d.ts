import { PatientService } from './patient.service';
import { type User } from '@prisma/client';
import { UpdateTariffDto } from './dto/update-tariff.dto';
export declare class PatientController {
    private patientService;
    constructor(patientService: PatientService);
    getProfile(user: User): Promise<{
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
                description: string | null;
                title: string;
                tariffId: string;
                id: string;
                createdAt: Date;
            }[];
        } & {
            title: string;
            id: string;
            createdAt: Date;
            price: number;
            discount: number;
            imageUrl: string | null;
            updatedAt: Date;
        }) | null;
    } & {
        tariffId: string | null;
        id: string;
        createdAt: Date;
        userId: string;
        birthDate: Date | null;
        avatarUrl: string | null;
        trustedContact: string | null;
    }>;
    getTrainers(user: User): Promise<({
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
            description: string | null;
            title: string;
            id: string;
            createdAt: Date;
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
        patientId: string;
        doctorId: string;
        trainerId: string;
    })[]>;
    getMedicalData(user: User): Promise<{
        type: string;
        id: string;
        createdAt: Date;
        patientId: string;
        data: import("@prisma/client/runtime/client").JsonValue;
    }[]>;
    updateTariff(user: User, dto: UpdateTariffDto): Promise<{
        tariff: ({
            options: {
                description: string | null;
                title: string;
                tariffId: string;
                id: string;
                createdAt: Date;
            }[];
        } & {
            title: string;
            id: string;
            createdAt: Date;
            price: number;
            discount: number;
            imageUrl: string | null;
            updatedAt: Date;
        }) | null;
    } & {
        tariffId: string | null;
        id: string;
        createdAt: Date;
        userId: string;
        birthDate: Date | null;
        avatarUrl: string | null;
        trustedContact: string | null;
    }>;
}
