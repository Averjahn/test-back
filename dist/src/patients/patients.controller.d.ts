import { PatientsService } from './patients.service';
import { type User } from '@prisma/client';
import { CreatePatientDto } from './dto/create-patient.dto';
export declare class PatientsController {
    private patientsService;
    constructor(patientsService: PatientsService);
    create(dto: CreatePatientDto): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        birthDate: Date | null;
        avatarUrl: string | null;
        trustedContact: string | null;
        tariffId: string | null;
    }>;
    findAll(user: User): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        birthDate: Date | null;
        avatarUrl: string | null;
        trustedContact: string | null;
        tariffId: string | null;
    }[]>;
    findById(id: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        birthDate: Date | null;
        avatarUrl: string | null;
        trustedContact: string | null;
        tariffId: string | null;
    } | null>;
}
