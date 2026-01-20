import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DiaryService } from './diary.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole, type User } from '@prisma/client';
import { CreateDiaryEntryDto } from './dto/create-diary-entry.dto';
import { UpdateDiaryEntryDto } from './dto/update-diary-entry.dto';

@ApiTags('diary')
@Controller('patient/diary')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.PATIENT)
@ApiBearerAuth()
export class DiaryController {
  constructor(private diaryService: DiaryService) {}

  @Get()
  @ApiOperation({ summary: 'Get all diary entries' })
  @ApiResponse({ status: 200, description: 'List of diary entries' })
  @ApiResponse({ status: 403, description: 'Forbidden (Patient only)' })
  @ApiResponse({ status: 404, description: 'Patient profile not found' })
  async getEntries(@CurrentUser() user: User) {
    return this.diaryService.getEntries(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get diary entry by ID' })
  @ApiResponse({ status: 200, description: 'Diary entry data' })
  @ApiResponse({ status: 403, description: 'Forbidden (Patient only) or entry not owned' })
  @ApiResponse({ status: 404, description: 'Diary entry not found' })
  async getEntryById(
    @CurrentUser() user: User,
    @Param('id') entryId: string,
  ) {
    return this.diaryService.getEntryById(user.id, entryId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new diary entry' })
  @ApiResponse({ status: 201, description: 'Diary entry successfully created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 403, description: 'Forbidden (Patient only)' })
  @ApiResponse({ status: 404, description: 'Patient profile not found' })
  async createEntry(
    @CurrentUser() user: User,
    @Body() dto: CreateDiaryEntryDto,
  ) {
    return this.diaryService.createEntry(user.id, {
      ...dto,
      date: dto.date ? new Date(dto.date) : undefined,
    });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update diary entry' })
  @ApiResponse({ status: 200, description: 'Diary entry successfully updated' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 403, description: 'Forbidden (Patient only) or entry not owned' })
  @ApiResponse({ status: 404, description: 'Diary entry not found' })
  async updateEntry(
    @CurrentUser() user: User,
    @Param('id') entryId: string,
    @Body() dto: UpdateDiaryEntryDto,
  ) {
    return this.diaryService.updateEntry(user.id, entryId, {
      ...dto,
      date: dto.date ? new Date(dto.date) : undefined,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete diary entry' })
  @ApiResponse({ status: 204, description: 'Diary entry successfully deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden (Patient only) or entry not owned' })
  @ApiResponse({ status: 404, description: 'Diary entry not found' })
  async deleteEntry(
    @CurrentUser() user: User,
    @Param('id') entryId: string,
  ) {
    return this.diaryService.deleteEntry(user.id, entryId);
  }
}
