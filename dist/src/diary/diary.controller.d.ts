import { DiaryService } from './diary.service';
import { type User } from '@prisma/client';
import { CreateDiaryEntryDto } from './dto/create-diary-entry.dto';
import { UpdateDiaryEntryDto } from './dto/update-diary-entry.dto';
export declare class DiaryController {
    private diaryService;
    constructor(diaryService: DiaryService);
    getEntries(user: User): Promise<{
        content: string;
        id: string;
        createdAt: Date;
        patientId: string;
        updatedAt: Date;
        date: Date;
        weather: string;
        mood: string;
        wellbeing: string;
    }[]>;
    getEntryById(user: User, entryId: string): Promise<{
        content: string;
        id: string;
        createdAt: Date;
        patientId: string;
        updatedAt: Date;
        date: Date;
        weather: string;
        mood: string;
        wellbeing: string;
    }>;
    createEntry(user: User, dto: CreateDiaryEntryDto): Promise<{
        content: string;
        id: string;
        createdAt: Date;
        patientId: string;
        updatedAt: Date;
        date: Date;
        weather: string;
        mood: string;
        wellbeing: string;
    }>;
    updateEntry(user: User, entryId: string, dto: UpdateDiaryEntryDto): Promise<{
        content: string;
        id: string;
        createdAt: Date;
        patientId: string;
        updatedAt: Date;
        date: Date;
        weather: string;
        mood: string;
        wellbeing: string;
    }>;
    deleteEntry(user: User, entryId: string): Promise<{
        content: string;
        id: string;
        createdAt: Date;
        patientId: string;
        updatedAt: Date;
        date: Date;
        weather: string;
        mood: string;
        wellbeing: string;
    }>;
}
