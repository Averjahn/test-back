import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TestsService } from './tests.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole, type User } from '@prisma/client';
import { StartSessionDto } from './dto/start-session.dto';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import { FinishSessionDto } from './dto/finish-session.dto';

@ApiTags('tests')
@Controller('tests')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TestsController {
  constructor(private testsService: TestsService) {}

  @Post('start-session')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Start test session' })
  @ApiResponse({ status: 201, description: 'Session started' })
  @ApiResponse({ status: 400, description: 'Validation error or active session exists' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Assignment not found' })
  async startSession(
    @CurrentUser() user: User,
    @Body() dto: StartSessionDto,
  ) {
    console.log('Start session request:', { userId: user.id, role: user.role, assignmentId: dto.assignmentId });
    
    // Для режима preview (врач просматривает) разрешаем без проверки роли
    if (dto.assignmentId === 'preview') {
      console.log('Preview mode - returning mock session');
      const now = new Date().toISOString();
      // Возвращаем mock сессию для просмотра с полной структурой
      // Важно: используем ISO строки для дат, чтобы они правильно сериализовались в JSON
      // Структура должна полностью соответствовать реальному ответу от Prisma
      // Мок-сессия для preview режима с полной структурой для отслеживания статистики
      return {
        id: 'preview-session-' + Date.now(),
        assignmentId: 'preview',
        startedAt: now,
        finishedAt: null,
        correct: 0,
        incorrect: 0,
        durationSec: 0,
        answers: [], // Массив ответов (будет заполняться при отправке ответов)
        questions: [], // Массив вопросов для preview режима (пустой, т.к. вопросы генерируются в v0)
        assignment: {
          id: 'preview',
          patientId: null,
          doctorId: null,
          trainerId: 'preview-trainer',
          createdAt: now,
          patient: null,
          doctor: null,
          trainer: {
            id: 'preview-trainer',
            title: 'Preview Mode',
            description: 'Preview mode for doctors and admins',
            iframeUrl: '',
            section: '1.1',
            createdAt: now,
            updatedAt: now,
            questions: [], // Вопросы могут храниться здесь или генерироваться в v0
          },
        },
      };
    }
    
    // Для реальных сессий проверяем роль PATIENT
    if (user.role !== UserRole.PATIENT) {
      throw new ForbiddenException('Only patients can start test sessions');
    }
    
    return this.testsService.startSession(user.id, dto.assignmentId);
  }

  @Post('answer')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit answer to question' })
  @ApiResponse({ status: 201, description: 'Answer submitted' })
  @ApiResponse({ status: 400, description: 'Validation error or session finished' })
  @ApiResponse({ status: 403, description: 'Forbidden (Patient only)' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async submitAnswer(
    @CurrentUser() user: User,
    @Body() dto: SubmitAnswerDto,
  ) {
    return this.testsService.submitAnswer(
      user.id,
      dto.sessionId,
      dto.questionId,
      dto.answer,
      dto.isCorrect,
    );
  }

  // Алиас для совместимости с v0 проектом
  @Post('submit-answer')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit answer to question (alias)' })
  async submitAnswerAlias(
    @CurrentUser() user: User,
    @Body() dto: SubmitAnswerDto,
  ) {
    return this.submitAnswer(user, dto);
  }

  @Post('finish')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Finish test session' })
  @ApiResponse({ status: 200, description: 'Session finished' })
  @ApiResponse({ status: 400, description: 'Validation error or session already finished' })
  @ApiResponse({ status: 403, description: 'Forbidden (Patient only)' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async finishSession(
    @CurrentUser() user: User,
    @Body() dto: FinishSessionDto,
  ) {
    return this.testsService.finishSession(user.id, dto.sessionId);
  }

  // Алиас для совместимости с v0 проектом
  @Post('complete-session')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Complete test session (alias)' })
  async completeSessionAlias(
    @CurrentUser() user: User,
    @Body() dto: FinishSessionDto,
  ) {
    return this.finishSession(user, dto);
  }
}
