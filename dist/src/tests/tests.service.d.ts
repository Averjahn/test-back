import { PrismaService } from '../prisma/prisma.service';
export declare class TestsService {
    private prisma;
    constructor(prisma: PrismaService);
    startSession(userId: string, assignmentId: string): Promise<{
        assignment: {
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
            patientId: string;
            doctorId: string;
            trainerId: string;
        };
    } & {
        id: string;
        startedAt: Date;
        finishedAt: Date | null;
        correct: number;
        incorrect: number;
        durationSec: number;
        assignmentId: string;
    }>;
    submitAnswer(userId: string, sessionId: string, questionId: string, answer: any, isCorrect: boolean): Promise<{
        id: string;
        createdAt: Date;
        questionId: string;
        answer: import("@prisma/client/runtime/client").JsonValue;
        isCorrect: boolean;
        sessionId: string;
    }>;
    finishSession(userId: string, sessionId: string): Promise<{
        assignment: {
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
            patientId: string;
            doctorId: string;
            trainerId: string;
        };
        answers: {
            id: string;
            createdAt: Date;
            questionId: string;
            answer: import("@prisma/client/runtime/client").JsonValue;
            isCorrect: boolean;
            sessionId: string;
        }[];
    } & {
        id: string;
        startedAt: Date;
        finishedAt: Date | null;
        correct: number;
        incorrect: number;
        durationSec: number;
        assignmentId: string;
    }>;
}
