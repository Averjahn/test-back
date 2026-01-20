import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsIn } from 'class-validator';

const WEATHER_OPTIONS = ['Ясно', 'Облачно', 'Дождь', 'Снег', 'Туман', 'Ветрено'];
const MOOD_OPTIONS = ['Бодрое', 'Спокойное', 'Подавленное', 'Тревожное', 'Радостное', 'Усталое'];
const WELLBEING_OPTIONS = ['Хорошее', 'Нормальное', 'Плохое', 'Отличное', 'Слабое'];

export class UpdateDiaryEntryDto {
  @ApiProperty({ example: '2025-01-11', required: false })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiProperty({ example: 'Ясно', enum: WEATHER_OPTIONS, required: false })
  @IsOptional()
  @IsString()
  @IsIn(WEATHER_OPTIONS)
  weather?: string;

  @ApiProperty({ example: 'Бодрое', enum: MOOD_OPTIONS, required: false })
  @IsOptional()
  @IsString()
  @IsIn(MOOD_OPTIONS)
  mood?: string;

  @ApiProperty({ example: 'Хорошее', enum: WELLBEING_OPTIONS, required: false })
  @IsOptional()
  @IsString()
  @IsIn(WELLBEING_OPTIONS)
  wellbeing?: string;

  @ApiProperty({ example: 'Сегодня был особенно продуктивный день...', required: false })
  @IsOptional()
  @IsString()
  content?: string;
}
