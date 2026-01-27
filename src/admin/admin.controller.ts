import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
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
import { CreateDocumentDto } from './dto/create-document.dto';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

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

  @Get('patients/:patientId/documents')
  @ApiOperation({ summary: 'Get patient documents (Admin only)' })
  @ApiResponse({ status: 200, description: 'List of patient documents' })
  @ApiResponse({ status: 403, description: 'Forbidden (Admin only)' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async getPatientDocuments(@Param('patientId') patientId: string) {
    return this.adminService.getPatientDocuments(patientId);
  }

  @Post('patients/:patientId/documents/upload')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads', 'documents'),
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `document-${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    })
  )
  @ApiOperation({ summary: 'Upload document file for patient (Admin only)' })
  @ApiResponse({ status: 201, description: 'Document file uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 403, description: 'Forbidden (Admin only)' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async uploadDocument(
    @Param('patientId') patientId: string,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: true,
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
        ],
      })
    )
    // Не используем Express.Multer.File, чтобы избежать зависимости от типов Multer в global.Express
    // Для контроллера достаточно знать, что у файла есть поле filename, которое мы используем ниже
    file: { filename: string },
    @Body() dto: { title: string; type: string }
  ) {
    // Формируем URL файла
    const fileUrl = `/uploads/documents/${file.filename}`;
    
    return this.adminService.createDocument(patientId, {
      title: dto.title,
      type: dto.type,
      fileUrl,
    });
  }

  @Post('patients/:patientId/documents')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create document for patient (Admin only)' })
  @ApiResponse({ status: 201, description: 'Document successfully created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 403, description: 'Forbidden (Admin only)' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async createDocument(
    @Param('patientId') patientId: string,
    @Body() dto: CreateDocumentDto
  ) {
    return this.adminService.createDocument(patientId, dto);
  }

  @Delete('patients/:patientId/documents/:documentId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete patient document (Admin only)' })
  @ApiResponse({ status: 200, description: 'Document successfully deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden (Admin only)' })
  @ApiResponse({ status: 404, description: 'Patient or Document not found' })
  async deleteDocument(
    @Param('patientId') patientId: string,
    @Param('documentId') documentId: string
  ) {
    return this.adminService.deleteDocument(patientId, documentId);
  }

  @Get('doctors/:doctorId/available-dates')
  @ApiOperation({ 
    summary: 'Get available dates for doctor (Admin only)',
    description: 'Returns available dates for the next 14 days (2 weeks) from today or from the specified startDate. Always returns a rolling window of 14 days.'
  })
  @ApiResponse({ status: 200, description: 'List of available dates (14 days ahead)' })
  @ApiResponse({ status: 403, description: 'Forbidden (Admin only)' })
  @ApiResponse({ status: 404, description: 'Doctor not found' })
  async getAvailableDates(
    @Param('doctorId') doctorId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string // Игнорируется, всегда используется 14 дней от startDate
  ) {
    return this.adminService.getAvailableDates(doctorId, startDate, endDate);
  }

  @Get('doctors/:doctorId/time-slots')
  @ApiOperation({ summary: 'Get time slots for doctor and date (Admin only)' })
  @ApiResponse({ status: 200, description: 'List of time slots' })
  @ApiResponse({ status: 403, description: 'Forbidden (Admin only)' })
  @ApiResponse({ status: 404, description: 'Doctor not found' })
  async getTimeSlots(
    @Param('doctorId') doctorId: string,
    @Query('date') date: string
  ) {
    return this.adminService.getTimeSlots(doctorId, date);
  }

  @Post('doctors/:doctorId/appointments')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create appointment (Admin only)' })
  @ApiResponse({ status: 201, description: 'Appointment successfully created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 403, description: 'Forbidden (Admin only)' })
  @ApiResponse({ status: 404, description: 'Doctor or Patient not found' })
  @ApiResponse({ status: 409, description: 'Time slot already booked' })
  async createAppointment(
    @Param('doctorId') doctorId: string,
    @Body() dto: CreateAppointmentDto
  ) {
    return this.adminService.createAppointment(doctorId, dto);
  }

  @Post('doctors/initialize-schedules')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Initialize default schedules for all doctors without schedules (Admin only)' })
  @ApiResponse({ status: 200, description: 'Default schedules initialized' })
  @ApiResponse({ status: 403, description: 'Forbidden (Admin only)' })
  async initializeDefaultSchedules() {
    return this.adminService.initializeDefaultSchedulesForAllDoctors();
  }
}
