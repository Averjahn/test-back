import { PrismaService } from '../prisma/prisma.service';
import { Patient } from '@prisma/client';
import { DoctorsService } from '../doctors/doctors.service';
export declare class PatientsService {
    private prisma;
    private doctorsService;
    constructor(prisma: PrismaService, doctorsService: DoctorsService);
    findAll(currentUserId?: string, currentUserRole?: string): Promise<Patient[]>;
    findById(id: string): Promise<Patient | null>;
    findByUserId(userId: string): Promise<Patient | null>;
    findPatientsByDoctorId(doctorId: string): Promise<Patient[]>;
    checkDoctorPatientAccess(doctorId: string, patientId: string): Promise<boolean>;
    createPatient(data: {
        email: string;
        passwordHash: string;
        firstName?: string;
        lastName?: string;
        middleName?: string;
    }): Promise<Patient>;
}
