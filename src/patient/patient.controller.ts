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

/**
 * Контроллер для работы пациента со своими данными
 * 
 * Назначение: Endpoints для пациента для работы со своим профилем и данными
 * 
 * Защита:
 * - JwtAuthGuard: Проверяет наличие и валидность JWT токена
 * - RolesGuard: Проверяет, что пользователь имеет роль PATIENT
 * 
 * Все методы автоматически работают с данными текущего аутентифицированного пациента
 * (не нужно передавать patientId - используется user.id из токена)
 */
@ApiTags('patient')
@Controller('patient')
@UseGuards(JwtAuthGuard, RolesGuard) // Применяем guards ко всем методам контроллера
@Roles(UserRole.PATIENT) // Только пациенты могут использовать эти endpoints
@ApiBearerAuth() // Swagger документация для Bearer токенов
export class PatientController {
  constructor(private patientService: PatientService) {}

  /**
   * Получить профиль текущего пациента
   * 
   * Возвращает:
   * - Данные пользователя (ФИО, email, login)
   * - Данные пациента (дата рождения, аватар, доверенный контакт)
   * - Текущий тариф с опциями
   * - Список связанных врачей
   * 
   * @param user - Текущий аутентифицированный пользователь (из JWT токена)
   * @returns Полный профиль пациента
   */
  @Get('profile')
  @ApiOperation({ summary: 'Get patient profile' })
  @ApiResponse({ status: 200, description: 'Patient profile data' })
  @ApiResponse({ status: 403, description: 'Forbidden (Patient only)' })
  @ApiResponse({ status: 404, description: 'Patient profile not found' })
  async getProfile(@CurrentUser() user: User) {
    // Используем user.id из токена - пациент может получить только свой профиль
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

  /**
   * Обновить профиль пациента
   * 
   * Можно обновить:
   * - ФИО (firstName, lastName, middleName)
   * - Дата рождения (birthDate)
   * - Доверенный контакт (trustedContact)
   * - Аватар (avatarUrl) - обычно обновляется через отдельный endpoint
   * 
   * Процесс:
   * 1. Валидация данных через DTO (class-validator)
   * 2. Обновление данных пользователя (User) и пациента (Patient) в транзакции
   * 3. Возврат обновленного профиля
   * 
   * Безопасность:
   * - Пациент может обновить только свой профиль (user.id из токена)
   * - Все поля опциональны (можно обновить только нужные)
   * 
   * @param user - Текущий аутентифицированный пользователь
   * @param dto - Данные для обновления (валидируются через class-validator)
   * @returns Обновленный профиль пациента
   */
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
    // Обновляем профиль текущего пациента (user.id из токена)
    return this.patientService.updateProfile(user.id, dto);
  }

  /**
   * Загрузить аватар пациента
   * 
   * Процесс:
   * 1. Прием файла через multipart/form-data
   * 2. Валидация размера файла (максимум 5MB)
   * 3. Сохранение файла в /uploads/avatars/ с уникальным именем
   * 4. Обновление avatarUrl в профиле пациента
   * 
   * Безопасность:
   * - Ограничение размера файла (5MB) - защита от DoS атак
   * - Уникальные имена файлов - предотвращение перезаписи
   * - Файл сохраняется на сервере, в БД хранится только URL
   * 
   * Формат запроса:
   * Content-Type: multipart/form-data
   * Поле: avatar (file)
   * 
   * @param user - Текущий аутентифицированный пользователь
   * @param file - Загруженный файл (Multer обрабатывает загрузку)
   * @returns Обновленный профиль пациента с новым avatarUrl
   */
  @Put('profile/avatar')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    // FileInterceptor обрабатывает загрузку файла
    // 'avatar' - имя поля в form-data
    FileInterceptor('avatar', {
      storage: diskStorage({
        // Директория для сохранения аватаров
        destination: join(process.cwd(), 'uploads', 'avatars'),
        // Генерация уникального имени файла
        filename: (req, file, cb) => {
          // Уникальный суффикс: timestamp + случайное число
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          // Сохраняем расширение оригинального файла
          const ext = extname(file.originalname);
          // Формат: avatar-1234567890-987654321.jpg
          cb(null, `avatar-${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB - максимальный размер файла
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
      // ParseFilePipe валидирует загруженный файл
      new ParseFilePipe({
        fileIsRequired: true, // Файл обязателен
        validators: [
          // Проверка максимального размера файла
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
        ],
      })
    )
    file: { filename: string } // Multer сохраняет файл и возвращает информацию о нем
  ) {
    // Формируем URL файла для сохранения в БД
    // Файл доступен по этому URL через статическую раздачу (main.ts)
    const fileUrl = `/uploads/avatars/${file.filename}`;
    
    // Обновляем avatarUrl в профиле пациента
    return this.patientService.updateProfile(user.id, { avatarUrl: fileUrl });
  }
}
