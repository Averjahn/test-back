import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsDateString, IsIn } from 'class-validator';

const WEATHER_OPTIONS = ['Ясно', 'Облачно', 'Дождь', 'Снег', 'Туман', 'Ветрено'];
const MOOD_OPTIONS = ['Бодрое', 'Спокойное', 'Подавленное', 'Тревожное', 'Радостное', 'Усталое'];
const WELLBEING_OPTIONS = ['Хорошее', 'Нормальное', 'Плохое', 'Отличное', 'Слабое'];

export class CreateDiaryEntryDto {
  @ApiProperty({ 
    example: '2025-01-11',
    required: false,
    description: 'Дата записи (по умолчанию текущая дата)'
  })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiProperty({ 
    example: 'Ясно',
    enum: WEATHER_OPTIONS,
    description: 'Погода'
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(WEATHER_OPTIONS)
  weather: string;

  @ApiProperty({ 
    example: 'Бодрое',
    enum: MOOD_OPTIONS,
    description: 'Настроение'
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(MOOD_OPTIONS)
  mood: string;

  @ApiProperty({ 
    example: 'Хорошее',
    enum: WELLBEING_OPTIONS,
    description: 'Самочувствие'
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(WELLBEING_OPTIONS)
  wellbeing: string;

  @ApiProperty({ 
    example: 'Сегодня был особенно продуктивный день...',
    description: 'Текст записи в дневнике'
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}
