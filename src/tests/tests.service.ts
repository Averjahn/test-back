import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class TestsService {
  constructor(private prisma: PrismaService) {}

  async startSession(userId: string, assignmentId: string) {
    // Проверяем, что назначение существует и принадлежит пользователю
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        patient: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    // Проверяем, что пользователь - это пациент из назначения
    if (assignment.patient.userId !== userId) {
      throw new BadRequestException('You can only start sessions for your own assignments');
    }

    // Проверяем, нет ли активной сессии
    const activeSession = await this.prisma.testSession.findFirst({
      where: {
        assignmentId,
        finishedAt: null,
      },
    });

    if (activeSession) {
      throw new BadRequestException('You already have an active session for this assignment');
    }

    // Создаем новую сессию
    const session = await this.prisma.testSession.create({
      data: {
        assignmentId,
        startedAt: new Date(),
      },
      include: {
        assignment: {
          include: {
            trainer: true,
          },
        },
      },
    });

    return session;
  }

  async submitAnswer(
    userId: string,
    sessionId: string,
    questionId: string,
    answer: any,
    isCorrect: boolean,
  ) {
    // Проверяем, что сессия существует и принадлежит пользователю
    const session = await this.prisma.testSession.findUnique({
      where: { id: sessionId },
      include: {
        assignment: {
          include: {
            patient: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    // Проверяем, что пользователь - это пациент из назначения
    if (session.assignment.patient.userId !== userId) {
      throw new BadRequestException('You can only submit answers for your own sessions');
    }

    // Проверяем, что сессия не завершена
    if (session.finishedAt) {
      throw new BadRequestException('Session is already finished');
    }

    // Создаем ответ
    const testAnswer = await this.prisma.testAnswer.create({
      data: {
        sessionId,
        questionId,
        answer,
        isCorrect,
      },
    });

    return testAnswer;
  }

  async finishSession(userId: string, sessionId: string) {
    // Проверяем, что сессия существует и принадлежит пользователю
    const session = await this.prisma.testSession.findUnique({
      where: { id: sessionId },
      include: {
        assignment: {
          include: {
            patient: {
              include: {
                user: true,
              },
            },
          },
        },
        answers: true,
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    // Проверяем, что пользователь - это пациент из назначения
    if (session.assignment.patient.userId !== userId) {
      throw new BadRequestException('You can only finish your own sessions');
    }

    // Проверяем, что сессия еще не завершена
    if (session.finishedAt) {
      throw new BadRequestException('Session is already finished');
    }

    // Подсчитываем правильные и неправильные ответы
    const correct = session.answers.filter((a) => a.isCorrect).length;
    const incorrect = session.answers.filter((a) => !a.isCorrect).length;

    // Вычисляем длительность
    const durationSec = Math.floor(
      (new Date().getTime() - session.startedAt.getTime()) / 1000,
    );

    // Обновляем сессию
    const updatedSession = await this.prisma.testSession.update({
      where: { id: sessionId },
      data: {
        finishedAt: new Date(),
        correct,
        incorrect,
        durationSec,
      },
      include: {
        assignment: {
          include: {
            trainer: true,
          },
        },
        answers: true,
      },
    });

    return updatedSession;
  }
}
