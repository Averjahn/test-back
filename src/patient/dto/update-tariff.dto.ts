import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class UpdateTariffDto {
  @ApiProperty({ example: 'uuid-of-tariff' })
  @IsUUID()
  tariffId: string;
}
