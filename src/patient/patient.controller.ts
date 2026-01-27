import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { PatientService } from './patient.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole, type User } from '@prisma/client';
import { UpdateTariffDto } from './dto/update-tariff.dto';
import { UpdatePatientProfileDto } from './dto/update-profile.dto';

@ApiTags('patient')
@Controller('patient')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.PATIENT)
@ApiBearerAuth()
export class PatientController {
  constructor(private patientService: PatientService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get patient profile' })
  @ApiResponse({ status: 200, description: 'Patient profile data' })
  @ApiResponse({ status: 403, description: 'Forbidden (Patient only)' })
  @ApiResponse({ status: 404, description: 'Patient profile not found' })
  async getProfile(@CurrentUser() user: User) {
    return this.patientService.getProfile(user.id);
  }

  @Get('trainers')
  @ApiOperation({ summary: 'Get assigned trainers' })
  @ApiResponse({ status: 200, description: 'List of assigned trainers' })
  @ApiResponse({ status: 403, description: 'Forbidden (Patient only)' })
  @ApiResponse({ status: 404, description: 'Patient profile not found' })
  async getTrainers(@CurrentUser() user: User) {
    return this.patientService.getTrainers(user.id);
  }

  @Get('assignments')
  @ApiOperation({ summary: 'Get doctor assignments' })
  @ApiResponse({ status: 200, description: 'List of doctor assignments' })
  @ApiResponse({ status: 403, description: 'Forbidden (Patient only)' })
  @ApiResponse({ status: 404, description: 'Patient profile not found' })
  async getAssignments(@CurrentUser() user: User) {
    return this.patientService.getAssignments(user.id);
  }

  @Get('medical-data')
  @ApiOperation({ summary: 'Get medical data' })
  @ApiResponse({ status: 200, description: 'List of medical data records' })
  @ApiResponse({ status: 403, description: 'Forbidden (Patient only)' })
  @ApiResponse({ status: 404, description: 'Patient profile not found' })
  async getMedicalData(@CurrentUser() user: User) {
    return this.patientService.getMedicalData(user.id);
  }

  @Put('tariff')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update patient tariff' })
  @ApiResponse({ status: 200, description: 'Tariff successfully updated' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 403, description: 'Forbidden (Patient only)' })
  @ApiResponse({ status: 404, description: 'Patient or tariff not found' })
  async updateTariff(@CurrentUser() user: User, @Body() dto: UpdateTariffDto) {
    return this.patientService.updateTariff(user.id, dto.tariffId);
  }

  @Get('achievements')
  @ApiOperation({ summary: 'Get patient achievements (test statistics)' })
  @ApiResponse({ status: 200, description: 'List of test sessions with statistics' })
  @ApiResponse({ status: 403, description: 'Forbidden (Patient only)' })
  @ApiResponse({ status: 404, description: 'Patient profile not found' })
  async getAchievements(@CurrentUser() user: User) {
    return this.patientService.getAchievements(user.id);
  }

  @Put('profile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update patient profile' })
  @ApiResponse({ status: 200, description: 'Profile successfully updated' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 403, description: 'Forbidden (Patient only)' })
  @ApiResponse({ status: 404, description: 'Patient profile not found' })
  async updateProfile(
    @CurrentUser() user: User,
    @Body() dto: UpdatePatientProfileDto
  ) {
    return this.patientService.updateProfile(user.id, dto);
  }

  @Put('profile/avatar')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads', 'avatars'),
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `avatar-${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    })
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload patient avatar' })
  @ApiResponse({ status: 200, description: 'Avatar successfully uploaded' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 403, description: 'Forbidden (Patient only)' })
  @ApiResponse({ status: 404, description: 'Patient profile not found' })
  async uploadAvatar(
    @CurrentUser() user: User,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: true,
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
        ],
      })
    )
    file: { filename: string }
  ) {
    const fileUrl = `/uploads/avatars/${file.filename}`;
    return this.patientService.updateProfile(user.id, { avatarUrl: fileUrl });
  }
}
