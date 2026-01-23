import { PrismaService } from '../prisma/prisma.service';
export declare class DiaryService {
    private prisma;
    constructor(prisma: PrismaService);
    getEntries(patientUserId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        patientId: string;
        date: Date;
        weather: string;
        mood: string;
        wellbeing: string;
        content: string;
    }[]>;
    getEntryById(patientUserId: string, entryId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        patientId: string;
        date: Date;
        weather: string;
        mood: string;
        wellbeing: string;
        content: string;
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
        updatedAt: Date;
        patientId: string;
        date: Date;
        weather: string;
        mood: string;
        wellbeing: string;
        content: string;
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
        updatedAt: Date;
        patientId: string;
        date: Date;
        weather: string;
        mood: string;
        wellbeing: string;
        content: string;
    }>;
    deleteEntry(patientUserId: string, entryId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        patientId: string;
        date: Date;
        weather: string;
        mood: string;
        wellbeing: string;
        content: string;
    }>;
}
