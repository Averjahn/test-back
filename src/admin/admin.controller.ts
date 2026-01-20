import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CreatePatientDto } from './dto/create-patient.dto';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { AssignDoctorDto } from './dto/assign-doctor.dto';
import { CreateTariffDto } from './dto/create-tariff.dto';
import { CreateTrainerDto } from '../trainers/dto/create-trainer.dto';
import { AssignTrainerDto } from './dto/assign-trainer.dto';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Post('patients')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new patient (Admin only)' })
  @ApiResponse({ status: 201, description: 'Patient successfully created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 403, description: 'Forbidden (Admin only)' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async createPatient(@Body() dto: CreatePatientDto) {
    return this.adminService.createPatient({
      ...dto,
      birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
    });
  }

  @Post('doctors')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new doctor (Admin only)' })
  @ApiResponse({ status: 201, description: 'Doctor successfully created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 403, description: 'Forbidden (Admin only)' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async createDoctor(@Body() dto: CreateDoctorDto) {
    return this.adminService.createDoctor(dto);
  }

  @Post('assign-doctor')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Assign doctor to patient (Admin only)' })
  @ApiResponse({ status: 201, description: 'Doctor assigned to patient' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 403, description: 'Forbidden (Admin only)' })
  @ApiResponse({ status: 404, description: 'Patient or Doctor not found' })
  async assignDoctor(@Body() dto: AssignDoctorDto) {
    return this.adminService.assignDoctor(dto.patientId, dto.doctorId);
  }

  @Post('tariffs')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new tariff (Admin only)' })
  @ApiResponse({ status: 201, description: 'Tariff successfully created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 403, description: 'Forbidden (Admin only)' })
  async createTariff(@Body() dto: CreateTariffDto) {
    return this.adminService.createTariff(dto);
  }

  @Post('trainers')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new trainer (Admin only)' })
  @ApiResponse({ status: 201, description: 'Trainer successfully created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 403, description: 'Forbidden (Admin only)' })
  async createTrainer(@Body() dto: CreateTrainerDto) {
    return this.adminService.createTrainer(dto);
  }

  @Post('assign-trainer')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Assign trainer to patient (Admin only)' })
  @ApiResponse({ status: 201, description: 'Trainer assigned to patient' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 403, description: 'Forbidden (Admin only)' })
  @ApiResponse({ status: 404, description: 'Patient, Trainer or Doctor not found' })
  async assignTrainer(@Body() dto: AssignTrainerDto) {
    return this.adminService.assignTrainer(dto.patientId, dto.trainerId, dto.doctorId);
  }
}
