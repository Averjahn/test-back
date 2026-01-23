import { DiaryService } from './diary.service';
import { type User } from '@prisma/client';
import { CreateDiaryEntryDto } from './dto/create-diary-entry.dto';
import { UpdateDiaryEntryDto } from './dto/update-diary-entry.dto';
export declare class DiaryController {
    private diaryService;
    constructor(diaryService: DiaryService);
    getEntries(user: User): Promise<{
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
    getEntryById(user: User, entryId: string): Promise<{
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
    createEntry(user: User, dto: CreateDiaryEntryDto): Promise<{
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
    updateEntry(user: User, entryId: string, dto: UpdateDiaryEntryDto): Promise<{
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
    deleteEntry(user: User, entryId: string): Promise<{
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
