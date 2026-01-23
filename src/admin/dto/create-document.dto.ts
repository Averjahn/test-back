import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, IsOptional, IsUrl } from 'class-validator';

export class CreateDocumentDto {
  @ApiProperty({ example: 'Договор на оказание платных медицинских услуг' })
  @IsString()
  @MinLength(3)
  title: string;

  @ApiProperty({ 
    example: 'contract',
    description: 'Тип документа: contract, act, consent, other'
  })
  @IsString()
  type: string;

  @ApiProperty({ 
    example: 'https://example.com/documents/contract.pdf',
    required: false,
    description: 'URL файла документа (если есть)'
  })
  @IsOptional()
  @IsUrl()
  fileUrl?: string;
}
