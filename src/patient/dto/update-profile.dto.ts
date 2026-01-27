import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString, MaxLength } from 'class-validator';

export class UpdatePatientProfileDto {
  @ApiProperty({ 
    example: 'Иван', 
    required: false,
    description: 'Имя пациента'
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @ApiProperty({ 
    example: 'Иванов', 
    required: false,
    description: 'Фамилия пациента'
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @ApiProperty({ 
    example: 'Иванович', 
    required: false,
    description: 'Отчество пациента'
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  middleName?: string;

  @ApiProperty({ 
    example: '1990-01-15', 
    required: false,
    description: 'Дата рождения в формате YYYY-MM-DD'
  })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiProperty({ 
    example: '+7 999 123-45-67', 
    required: false,
    description: 'Доверенный контакт'
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  trustedContact?: string;

  @ApiProperty({ 
    example: '/uploads/avatars/avatar-123.jpg', 
    required: false,
    description: 'URL аватара (null для удаления)'
  })
  @IsOptional()
  @IsString()
  avatarUrl?: string | null;
}
