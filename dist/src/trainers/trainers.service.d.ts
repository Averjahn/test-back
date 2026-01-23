import { PrismaService } from '../prisma/prisma.service';
export declare class TrainersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(section?: string): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        updatedAt: Date;
        description: string | null;
        iframeUrl: string;
        section: string;
    }[]>;
    findById(id: string): Promise<{
        assignments: ({
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
        } & {
            id: string;
            createdAt: Date;
            patientId: string;
            doctorId: string;
            trainerId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        title: string;
        updatedAt: Date;
        description: string | null;
        iframeUrl: string;
        section: string;
    }>;
    findBySection(section: string): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        updatedAt: Date;
        description: string | null;
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
        title: string;
        updatedAt: Date;
        description: string | null;
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
        title: string;
        updatedAt: Date;
        description: string | null;
        iframeUrl: string;
        section: string;
    }>;
    delete(id: string): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        updatedAt: Date;
        description: string | null;
        iframeUrl: string;
        section: string;
    }>;
}
