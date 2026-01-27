import { PatientService } from './patient.service';
import { type User } from '@prisma/client';
import { UpdateTariffDto } from './dto/update-tariff.dto';
import { UpdatePatientProfileDto } from './dto/update-profile.dto';
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
    getAssignments(user: User): Promise<{
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
    getMedicalData(user: User): Promise<{
        data: import("@prisma/client/runtime/client").JsonValue;
        id: string;
        createdAt: Date;
        patientId: string;
        type: string;
    }[]>;
    updateTariff(user: User, dto: UpdateTariffDto): Promise<{
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
    getAchievements(user: User): Promise<{
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
    updateProfile(user: User, dto: UpdatePatientProfileDto): Promise<{
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
    uploadAvatar(user: User, file: {
        filename: string;
    }): Promise<{
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
}
