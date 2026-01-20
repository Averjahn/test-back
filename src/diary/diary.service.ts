import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DiaryService {
  constructor(private prisma: PrismaService) {}

  async getEntries(patientUserId: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { userId: patientUserId },
    });

    if (!patient) {
      throw new NotFoundException('Patient profile not found');
    }

    return this.prisma.diaryEntry.findMany({
      where: { patientId: patient.id },
      orderBy: { date: 'desc' },
    });
  }

  async getEntryById(patientUserId: string, entryId: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { userId: patientUserId },
    });

    if (!patient) {
      throw new NotFoundException('Patient profile not found');
    }

    const entry = await this.prisma.diaryEntry.findUnique({
      where: { id: entryId },
    });

    if (!entry) {
      throw new NotFoundException('Diary entry not found');
    }

    if (entry.patientId !== patient.id) {
      throw new ForbiddenException('You can only access your own diary entries');
    }

    return entry;
  }

  async createEntry(patientUserId: string, data: {
    date?: Date;
    weather: string;
    mood: string;
    wellbeing: string;
    content: string;
  }) {
    const patient = await this.prisma.patient.findUnique({
      where: { userId: patientUserId },
    });

    if (!patient) {
      throw new NotFoundException('Patient profile not found');
    }

    return this.prisma.diaryEntry.create({
      data: {
        patientId: patient.id,
        date: data.date || new Date(),
        weather: data.weather,
        mood: data.mood,
        wellbeing: data.wellbeing,
        content: data.content,
      },
    });
  }

  async updateEntry(patientUserId: string, entryId: string, data: {
    date?: Date;
    weather?: string;
    mood?: string;
    wellbeing?: string;
    content?: string;
  }) {
    const patient = await this.prisma.patient.findUnique({
      where: { userId: patientUserId },
    });

    if (!patient) {
      throw new NotFoundException('Patient profile not found');
    }

    const entry = await this.prisma.diaryEntry.findUnique({
      where: { id: entryId },
    });

    if (!entry) {
      throw new NotFoundException('Diary entry not found');
    }

    if (entry.patientId !== patient.id) {
      throw new ForbiddenException('You can only update your own diary entries');
    }

    return this.prisma.diaryEntry.update({
      where: { id: entryId },
      data: {
        ...(data.date && { date: data.date }),
        ...(data.weather && { weather: data.weather }),
        ...(data.mood && { mood: data.mood }),
        ...(data.wellbeing && { wellbeing: data.wellbeing }),
        ...(data.content && { content: data.content }),
      },
    });
  }

  async deleteEntry(patientUserId: string, entryId: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { userId: patientUserId },
    });

    if (!patient) {
      throw new NotFoundException('Patient profile not found');
    }

    const entry = await this.prisma.diaryEntry.findUnique({
      where: { id: entryId },
    });

    if (!entry) {
      throw new NotFoundException('Diary entry not found');
    }

    if (entry.patientId !== patient.id) {
      throw new ForbiddenException('You can only delete your own diary entries');
    }

    return this.prisma.diaryEntry.delete({
      where: { id: entryId },
    });
  }
}
