import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DoctorService } from './doctor.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole, type User } from '@prisma/client';
import { AssignTrainerDto } from './dto/assign-trainer.dto';
import { CreateMedicalDataDto } from './dto/create-medical-data.dto';

@ApiTags('doctor')
@Controller('doctor')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.DOCTOR)
@ApiBearerAuth()
export class DoctorController {
  constructor(private doctorService: DoctorService) {}

  @Get('patients')
  @ApiOperation({ summary: 'Get all patients assigned to doctor' })
  @ApiResponse({ status: 200, description: 'List of patients' })
  @ApiResponse({ status: 403, description: 'Forbidden (Doctor only)' })
  async getPatients(@CurrentUser() user: User) {
    return this.doctorService.getPatients(user.id);
  }

  @Post('assign-trainer')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Assign trainer to patient' })
  @ApiResponse({ status: 201, description: 'Trainer assigned to patient' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 403, description: 'Forbidden (Doctor only) or patient not assigned' })
  @ApiResponse({ status: 404, description: 'Patient or Trainer not found' })
  async assignTrainer(
    @CurrentUser() user: User,
    @Body() dto: AssignTrainerDto,
  ) {
    return this.doctorService.assignTrainer(user.id, dto.patientId, dto.trainerId);
  }

  @Get('patient/:id/data')
  @ApiOperation({ summary: 'Get patient data (medical records, assignments, sessions)' })
  @ApiResponse({ status: 200, description: 'Patient data' })
  @ApiResponse({ status: 403, description: 'Forbidden (Doctor only) or patient not assigned' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async getPatientData(
    @CurrentUser() user: User,
    @Param('id') patientId: string,
  ) {
    return this.doctorService.getPatientData(user.id, patientId);
  }

  @Post('patient/:id/medical-data')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create medical data (recommendation or note) for patient' })
  @ApiResponse({ status: 201, description: 'Medical data created' })
  @ApiResponse({ status: 403, description: 'Forbidden (Doctor only) or patient not assigned' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async createMedicalData(
    @CurrentUser() user: User,
    @Param('id') patientId: string,
    @Body() dto: CreateMedicalDataDto,
  ) {
    return this.doctorService.createMedicalData(user.id, patientId, dto.type, dto.data);
  }

  @Delete('patient/:id/medical-data/:medicalDataId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete medical data' })
  @ApiResponse({ status: 204, description: 'Medical data deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden (Doctor only) or patient not assigned' })
  @ApiResponse({ status: 404, description: 'Medical data not found' })
  async deleteMedicalData(
    @CurrentUser() user: User,
    @Param('id') patientId: string,
    @Param('medicalDataId') medicalDataId: string,
  ) {
    return this.doctorService.deleteMedicalData(user.id, patientId, medicalDataId);
  }

  @Get('patient/:id/diary')
  @ApiOperation({ summary: 'Get patient diary entries' })
  @ApiResponse({ status: 200, description: 'List of diary entries' })
  @ApiResponse({ status: 403, description: 'Forbidden (Doctor only) or patient not assigned' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async getPatientDiary(
    @CurrentUser() user: User,
    @Param('id') patientId: string,
  ) {
    return this.doctorService.getPatientDiary(user.id, patientId);
  }
}
