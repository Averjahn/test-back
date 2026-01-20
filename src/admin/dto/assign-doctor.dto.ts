import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class AssignDoctorDto {
  @ApiProperty({ example: 'patient-uuid' })
  @IsString()
  @IsUUID()
  patientId: string;

  @ApiProperty({ example: 'doctor-uuid' })
  @IsString()
  @IsUUID()
  doctorId: string;
}
