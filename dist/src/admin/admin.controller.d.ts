import { AdminService } from './admin.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { AssignDoctorDto } from './dto/assign-doctor.dto';
import { CreateTariffDto } from './dto/create-tariff.dto';
import { CreateTrainerDto } from '../trainers/dto/create-trainer.dto';
import { AssignTrainerDto } from './dto/assign-trainer.dto';
import { CreateDocumentDto } from './dto/create-document.dto';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
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
        birthDate: Date | null;
        avatarUrl: string | null;
        trustedContact: string | null;
        tariffId: string | null;
        userId: string;
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
    }>;
    createTrainer(dto: CreateTrainerDto): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        updatedAt: Date;
        description: string | null;
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
        doctorId: string;
        patientId: string;
        trainerId: string;
    }>;
    getPatientDocuments(patientId: string): Promise<{
        id: string;
        title: string;
        type: string;
        fileUrl?: string | null;
        createdAt: Date;
        date?: Date;
        amount?: number;
    }[]>;
    uploadDocument(patientId: string, file: Express.Multer.File, dto: {
        title: string;
        type: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        patientId: string;
        title: string;
        updatedAt: Date;
        type: string;
        fileUrl: string | null;
    }>;
    createDocument(patientId: string, dto: CreateDocumentDto): Promise<{
        id: string;
        createdAt: Date;
        patientId: string;
        title: string;
        updatedAt: Date;
        type: string;
        fileUrl: string | null;
    }>;
    deleteDocument(patientId: string, documentId: string): Promise<{
        message: string;
    }>;
    getAvailableDates(doctorId: string, startDate?: string, endDate?: string): Promise<string[]>;
    getTimeSlots(doctorId: string, date: string): Promise<{
        startTime: string;
        endTime: string;
        available: boolean;
        appointment?: {
            patientName: string;
            type: string;
        } | undefined;
    }[]>;
    createAppointment(doctorId: string, dto: CreateAppointmentDto): Promise<{
        doctor: {
            user: {
                firstName: string | null;
                lastName: string | null;
                middleName: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            userId: string;
        };
        patient: {
            user: {
                firstName: string | null;
                lastName: string | null;
                middleName: string | null;
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
    } & {
        id: string;
        createdAt: Date;
        doctorId: string;
        patientId: string;
        updatedAt: Date;
        type: string;
        date: Date;
        startTime: string;
        endTime: string;
        notes: string | null;
    }>;
    initializeDefaultSchedules(): Promise<{
        totalDoctors: number;
        initializedCount: number;
        message: string;
    }>;
}
