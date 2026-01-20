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
      // Возвращаем mock сессию для просмотра
      return {
        id: 'preview-session-' + Date.now(),
        assignmentId: 'preview',
        startedAt: new Date(),
        finishedAt: null,
        correct: 0,
        incorrect: 0,
        durationSec: 0,
        assignment: {
          id: 'preview',
          trainer: {
            id: 'preview-trainer',
            title: 'Preview Mode',
            section: '1.1'
          }
        }
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
}
