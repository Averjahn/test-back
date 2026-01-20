import { PrismaService } from '../prisma/prisma.service';
export declare class TrainersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(section?: string): Promise<{
        id: string;
        createdAt: Date;
        description: string | null;
        title: string;
        updatedAt: Date;
        iframeUrl: string;
        section: string;
    }[]>;
    findById(id: string): Promise<{
        assignments: ({
            patient: {
                user: {
                    id: string;
                    email: string;
                    login: string;
                    firstName: string | null;
                    lastName: string | null;
                    middleName: string | null;
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
        } & {
            id: string;
            createdAt: Date;
            doctorId: string;
            patientId: string;
            trainerId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        description: string | null;
        title: string;
        updatedAt: Date;
        iframeUrl: string;
        section: string;
    }>;
    findBySection(section: string): Promise<{
        id: string;
        createdAt: Date;
        description: string | null;
        title: string;
        updatedAt: Date;
        iframeUrl: string;
        section: string;
    }[]>;
    getSections(): Promise<string[]>;
    create(data: {
        title: string;
        description?: string;
        iframeUrl: string;
        section: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        description: string | null;
        title: string;
        updatedAt: Date;
        iframeUrl: string;
        section: string;
    }>;
    update(id: string, data: {
        title?: string;
        description?: string;
        iframeUrl?: string;
        section?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        description: string | null;
        title: string;
        updatedAt: Date;
        iframeUrl: string;
        section: string;
    }>;
    delete(id: string): Promise<{
        id: string;
        createdAt: Date;
        description: string | null;
        title: string;
        updatedAt: Date;
        iframeUrl: string;
        section: string;
    }>;
}
