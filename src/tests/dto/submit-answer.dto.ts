import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsBoolean, IsObject } from 'class-validator';

export class SubmitAnswerDto {
  @ApiProperty({ example: 'session-uuid' })
  @IsString()
  @IsUUID()
  sessionId: string;

  @ApiProperty({ example: 'question-1' })
  @IsString()
  questionId: string;

  @ApiProperty({ example: { answer: 'some answer' } })
  @IsObject()
  answer: any;

  @ApiProperty({ example: true })
  @IsBoolean()
  isCorrect: boolean;
}
