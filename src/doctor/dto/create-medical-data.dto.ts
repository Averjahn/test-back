import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsObject, IsOptional } from 'class-validator';

export class CreateMedicalDataDto {
  @ApiProperty({ 
    example: 'recommendation',
    enum: ['recommendation', 'note', 'diagnosis', 'prescription'],
    description: 'Тип медицинских данных'
  })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ 
    example: { text: 'Рекомендуется проходить задания...', isCurrent: true },
    description: 'Данные в формате JSON'
  })
  @IsObject()
  @IsNotEmpty()
  data: Record<string, any>;
}
