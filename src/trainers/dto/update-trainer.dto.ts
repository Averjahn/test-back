import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUrl, IsOptional, MinLength } from 'class-validator';

export class UpdateTrainerDto {
  @ApiProperty({ example: 'Тренажёр по произношению звуков', required: false })
  @IsOptional()
  @IsString()
  @MinLength(3)
  title?: string;

  @ApiProperty({ 
    example: 'Тренажёр для развития произношения звуков Р, Л, С',
    required: false 
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ 
    example: 'https://v0-test.vercel.app?userId=xxx&assignmentId=yyy&token=zzz',
    required: false,
    description: 'URL v0 проекта'
  })
  @IsOptional()
  @IsUrl()
  iframeUrl?: string;

  @ApiProperty({ 
    example: '1.1',
    required: false,
    description: 'Подразделение/категория'
  })
  @IsOptional()
  @IsString()
  section?: string;
}
