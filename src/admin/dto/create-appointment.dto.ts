import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString, IsOptional, IsIn } from 'class-validator';

export class CreateAppointmentDto {
  @ApiProperty({ example: 'c96711ea-cbeb-40a3-b52d-be74122cf71a' })
  @IsString()
  patientId: string;

  @ApiProperty({ example: '2025-06-27' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: '09:00' })
  @IsString()
  startTime: string;

  @ApiProperty({ example: 'first', description: 'first (впервые) or repeat (повторно)' })
  @IsString()
  @IsIn(['first', 'repeat'])
  type: string;

  @ApiProperty({ example: 'Дополнительные заметки', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
