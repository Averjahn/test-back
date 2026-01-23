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
    }) | {
        id: string;
        assignmentId: string;
        startedAt: string;
        finishedAt: null;
        correct: number;
        incorrect: number;
        durationSec: number;
        answers: never[];
        questions: never[];
        assignment: {
            id: string;
            patientId: null;
            doctorId: null;
            trainerId: string;
            createdAt: string;
            patient: null;
            doctor: null;
            trainer: {
                id: string;
                title: string;
                description: string;
                iframeUrl: string;
                section: string;
                createdAt: string;
                updatedAt: string;
                questions: never[];
            };
        };
    }>;
    submitAnswer(user: User, dto: SubmitAnswerDto): Promise<{
        id: string;
        createdAt: Date;
        questionId: string;
        answer: import("@prisma/client/runtime/client").JsonValue;
        isCorrect: boolean;
        sessionId: string;
    }>;
    submitAnswerAlias(user: User, dto: SubmitAnswerDto): Promise<{
        id: string;
        createdAt: Date;
        questionId: string;
        answer: import("@prisma/client/runtime/client").JsonValue;
        isCorrect: boolean;
        sessionId: string;
    }>;
    finishSession(user: User, dto: FinishSessionDto): Promise<{
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
    completeSessionAlias(user: User, dto: FinishSessionDto): Promise<{
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
