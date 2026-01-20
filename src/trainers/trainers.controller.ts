import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TrainersService } from './trainers.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CreateTrainerDto } from './dto/create-trainer.dto';
import { UpdateTrainerDto } from './dto/update-trainer.dto';

@ApiTags('trainers')
@Controller('trainers')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TrainersController {
  constructor(private trainersService: TrainersService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT)
  @ApiOperation({ summary: 'Get all trainers (optionally filtered by section)' })
  @ApiQuery({ name: 'section', required: false, description: 'Filter by section (e.g., 1.1)' })
  @ApiResponse({ status: 200, description: 'List of trainers' })
  async findAll(@Query('section') section?: string) {
    return this.trainersService.findAll(section);
  }

  @Get('sections')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT)
  @ApiOperation({ summary: 'Get all available sections' })
  @ApiResponse({ status: 200, description: 'List of sections' })
  async getSections() {
    return this.trainersService.getSections();
  }

  @Get('section/:section')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT)
  @ApiOperation({ summary: 'Get trainers by section' })
  @ApiResponse({ status: 200, description: 'List of trainers in section' })
  async findBySection(@Param('section') section: string) {
    return this.trainersService.findBySection(section);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT)
  @ApiOperation({ summary: 'Get trainer by ID' })
  @ApiResponse({ status: 200, description: 'Trainer data' })
  @ApiResponse({ status: 404, description: 'Trainer not found' })
  async findById(@Param('id') id: string) {
    return this.trainersService.findById(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new trainer (Admin only)' })
  @ApiResponse({ status: 201, description: 'Trainer successfully created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 403, description: 'Forbidden (Admin only)' })
  async create(@Body() dto: CreateTrainerDto) {
    return this.trainersService.create(dto);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update trainer (Admin only)' })
  @ApiResponse({ status: 200, description: 'Trainer successfully updated' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 403, description: 'Forbidden (Admin only)' })
  @ApiResponse({ status: 404, description: 'Trainer not found' })
  async update(@Param('id') id: string, @Body() dto: UpdateTrainerDto) {
    return this.trainersService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete trainer (Admin only)' })
  @ApiResponse({ status: 204, description: 'Trainer successfully deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden (Admin only)' })
  @ApiResponse({ status: 404, description: 'Trainer not found' })
  @ApiResponse({ status: 400, description: 'Cannot delete trainer with assignments' })
  async delete(@Param('id') id: string) {
    return this.trainersService.delete(id);
  }
}
