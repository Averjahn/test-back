import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { PatientsService } from './patients.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { ResourceAccessGuard } from '../common/guards/resource-access.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Resource, ResourceType } from '../common/decorators/resource.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole, type User } from '@prisma/client';
import { CreatePatientDto } from './dto/create-patient.dto';

@ApiTags('patients')
@Controller('patients')
@UseGuards(JwtAuthGuard, RolesGuard, ResourceAccessGuard)
@ApiBearerAuth()
export class PatientsController {
  constructor(private patientsService: PatientsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create new patient (Admin only)' })
  @ApiBody({
    type: CreatePatientDto,
    examples: {
      default: {
        summary: 'Create patient',
        value: {
          email: 'new.patient@example.com',
          password: 'password123',
          firstName: 'Пётр',
          lastName: 'Петров',
          middleName: 'Петрович',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Patient successfully created',
    schema: {
      example: {
        id: 'patient-profile-uuid',
        userId: 'user-uuid',
        createdAt: '2026-01-19T12:00:00.000Z',
        user: {
          id: 'user-uuid',
          email: 'new.patient@example.com',
          role: 'PATIENT',
          firstName: 'Пётр',
          lastName: 'Петров',
          middleName: 'Петрович',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
    schema: {
      example: {
        statusCode: 400,
        message: ['email must be an email', 'password must be longer than or equal to 6 characters'],
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden (only ADMIN can create patients)',
    schema: {
      example: {
        statusCode: 403,
        message: 'Insufficient permissions',
        error: 'Forbidden',
      },
    },
  })
  async create(@Body() dto: CreatePatientDto) {
    // Хеширование пароля делаем здесь, чтобы не дублировать логику
    const bcrypt = await import('bcryptjs');
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);

    const patient = await this.patientsService.createPatient({
      email: dto.email,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      middleName: dto.middleName,
    });

    return patient;
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT)
  @ApiOperation({ summary: 'Get patients (filtered by role)' })
  @ApiResponse({ status: 200, description: 'List of patients' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll(@CurrentUser() user: User) {
    return this.patientsService.findAll(user.id, user.role);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT)
  @Resource(ResourceType.PATIENT, 'id')
  @ApiOperation({ summary: 'Get patient by ID' })
  @ApiResponse({ status: 200, description: 'Patient data' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async findById(@Param('id') id: string) {
    return this.patientsService.findById(id);
  }
}
