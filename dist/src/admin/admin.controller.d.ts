import { AdminService } from './admin.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { AssignDoctorDto } from './dto/assign-doctor.dto';
import { CreateTariffDto } from './dto/create-tariff.dto';
import { CreateTrainerDto } from '../trainers/dto/create-trainer.dto';
import { AssignTrainerDto } from './dto/assign-trainer.dto';
export declare class AdminController {
    private adminService;
    constructor(adminService: AdminService);
    createPatient(dto: CreatePatientDto): Promise<({
        user: {
            id: string;
            email: string;
            passwordHash: string;
            role: import("@prisma/client").$Enums.UserRole;
            firstName: string | null;
            lastName: string | null;
            middleName: string | null;
            createdAt: Date;
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
    }) | null>;
    createDoctor(dto: CreateDoctorDto): Promise<({
        user: {
            id: string;
            email: string;
            passwordHash: string;
            role: import("@prisma/client").$Enums.UserRole;
            firstName: string | null;
            lastName: string | null;
            middleName: string | null;
            createdAt: Date;
            login: string;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
    }) | null>;
    assignDoctor(dto: AssignDoctorDto): Promise<{
        doctorId: string;
        patientId: string;
    }>;
    createTariff(dto: CreateTariffDto): Promise<{
        options: {
            description: string | null;
            id: string;
            createdAt: Date;
            tariffId: string;
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
    }>;
    createTrainer(dto: CreateTrainerDto): Promise<{
        description: string | null;
        id: string;
        createdAt: Date;
        title: string;
        updatedAt: Date;
        iframeUrl: string;
        section: string;
    }>;
    assignTrainer(dto: AssignTrainerDto): Promise<{
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
}
