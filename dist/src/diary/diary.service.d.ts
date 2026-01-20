import { PrismaService } from '../prisma/prisma.service';
export declare class DiaryService {
    private prisma;
    constructor(prisma: PrismaService);
    getEntries(patientUserId: string): Promise<{
        id: string;
        createdAt: Date;
        patientId: string;
        content: string;
        updatedAt: Date;
        date: Date;
        weather: string;
        mood: string;
        wellbeing: string;
    }[]>;
    getEntryById(patientUserId: string, entryId: string): Promise<{
        id: string;
        createdAt: Date;
        patientId: string;
        content: string;
        updatedAt: Date;
        date: Date;
        weather: string;
        mood: string;
        wellbeing: string;
    }>;
    createEntry(patientUserId: string, data: {
        date?: Date;
        weather: string;
        mood: string;
        wellbeing: string;
        content: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        patientId: string;
        content: string;
        updatedAt: Date;
        date: Date;
        weather: string;
        mood: string;
        wellbeing: string;
    }>;
    updateEntry(patientUserId: string, entryId: string, data: {
        date?: Date;
        weather?: string;
        mood?: string;
        wellbeing?: string;
        content?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        patientId: string;
        content: string;
        updatedAt: Date;
        date: Date;
        weather: string;
        mood: string;
        wellbeing: string;
    }>;
    deleteEntry(patientUserId: string, entryId: string): Promise<{
        id: string;
        createdAt: Date;
        patientId: string;
        content: string;
        updatedAt: Date;
        date: Date;
        weather: string;
        mood: string;
        wellbeing: string;
    }>;
}
