import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class TariffOptionDto {
  @ApiProperty({ example: 'Безлимитный доступ' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Доступ ко всем тренажёрам', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateTariffDto {
  @ApiProperty({ example: 'Базовый тариф' })
  @IsString()
  title: string;

  @ApiProperty({ example: 1000 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 10, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;

  @ApiProperty({ example: 'https://example.com/image.jpg', required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ type: [TariffOptionDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TariffOptionDto)
  options?: TariffOptionDto[];
}
