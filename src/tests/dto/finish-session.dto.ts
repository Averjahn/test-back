import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class FinishSessionDto {
  @ApiProperty({ example: 'session-uuid' })
  @IsString()
  @IsUUID()
  sessionId: string;
}
