import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUrl, IsOptional, MinLength } from 'class-validator';

export class CreateTrainerDto {
  @ApiProperty({ example: 'Тренажёр по произношению звуков' })
  @IsString()
  @MinLength(3)
  title: string;

  @ApiProperty({ 
    example: 'Тренажёр для развития произношения звуков Р, Л, С',
    required: false 
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ 
    example: 'https://v0-test.vercel.app?userId=xxx&assignmentId=yyy&token=zzz',
    description: 'URL v0 проекта с параметрами userId, assignmentId, token'
  })
  @IsUrl()
  iframeUrl: string;

  @ApiProperty({ 
    example: '1.1',
    description: 'Подразделение/категория (например: 1.1, 1.2, 2.1)'
  })
  @IsString()
  section: string;
}
