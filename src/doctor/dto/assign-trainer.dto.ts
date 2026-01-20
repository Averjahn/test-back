import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class AssignTrainerDto {
  @ApiProperty({ example: 'patient-uuid' })
  @IsString()
  @IsUUID()
  patientId: string;

  @ApiProperty({ example: 'trainer-uuid' })
  @IsString()
  @IsUUID()
  trainerId: string;
}
