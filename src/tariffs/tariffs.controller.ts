import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TariffsService } from './tariffs.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('tariffs')
@Controller('tariffs')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TariffsController {
  constructor(private tariffsService: TariffsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT)
  @ApiOperation({ summary: 'Get all available tariffs' })
  @ApiResponse({ status: 200, description: 'List of tariffs' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll() {
    return this.tariffsService.findAll();
  }
}
