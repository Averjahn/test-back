import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DoctorsService } from './doctors.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { ResourceAccessGuard } from '../common/guards/resource-access.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Resource, ResourceType } from '../common/decorators/resource.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole, User } from '@prisma/client';

@ApiTags('doctors')
@Controller('doctors')
@UseGuards(JwtAuthGuard, RolesGuard, ResourceAccessGuard)
@ApiBearerAuth()
export class DoctorsController {
  constructor(private doctorsService: DoctorsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  @ApiOperation({ summary: 'Get all doctors (Admin and Doctor only)' })
  @ApiResponse({ status: 200, description: 'List of doctors' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll() {
    return this.doctorsService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  @Resource(ResourceType.DOCTOR, 'id')
  @ApiOperation({ summary: 'Get doctor by ID' })
  @ApiResponse({ status: 200, description: 'Doctor data' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Doctor not found' })
  async findById(@Param('id') id: string) {
    return this.doctorsService.findById(id);
  }
}
