import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class StartSessionDto {
  @ApiProperty({ example: 'assignment-uuid или "preview"' })
  @IsString()
  @Matches(/^(preview|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i, {
    message: 'assignmentId must be a valid UUID or "preview"',
  })
  assignmentId: string;
}
