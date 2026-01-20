import { TestsService } from './tests.service';
import { type User } from '@prisma/client';
import { StartSessionDto } from './dto/start-session.dto';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import { FinishSessionDto } from './dto/finish-session.dto';
export declare class TestsController {
    private testsService;
    constructor(testsService: TestsService);
    startSession(user: User, dto: StartSessionDto): Promise<({
        assignment: {
            trainer: {
                description: string | null;
                id: string;
                createdAt: Date;
                title: string;
                updatedAt: Date;
                iframeUrl: string;
                section: string;
            };
        } & {
            id: string;
            createdAt: Date;
            doctorId: string;
            patientId: string;
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
    }) | {
        id: string;
        assignmentId: string;
        startedAt: Date;
        finishedAt: null;
        correct: number;
        incorrect: number;
        durationSec: number;
        assignment: {
            id: string;
            trainer: {
                id: string;
                title: string;
                section: string;
            };
        };
    }>;
    submitAnswer(user: User, dto: SubmitAnswerDto): Promise<{
        id: string;
        createdAt: Date;
        answer: import("@prisma/client/runtime/client").JsonValue;
        questionId: string;
        isCorrect: boolean;
        sessionId: string;
    }>;
    finishSession(user: User, dto: FinishSessionDto): Promise<{
        assignment: {
            trainer: {
                description: string | null;
                id: string;
                createdAt: Date;
                title: string;
                updatedAt: Date;
                iframeUrl: string;
                section: string;
            };
        } & {
            id: string;
            createdAt: Date;
            doctorId: string;
            patientId: string;
            trainerId: string;
        };
        answers: {
            id: string;
            createdAt: Date;
            answer: import("@prisma/client/runtime/client").JsonValue;
            questionId: string;
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
