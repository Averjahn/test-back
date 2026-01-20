import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TrainersService {
  constructor(private prisma: PrismaService) {}

  async findAll(section?: string) {
    const where = section ? { section } : {};
    
    return this.prisma.trainer.findMany({
      where,
      orderBy: [
        { section: 'asc' },
        { title: 'asc' },
      ],
    });
  }

  async findById(id: string) {
    const trainer = await this.prisma.trainer.findUnique({
      where: { id },
      include: {
        assignments: {
          include: {
            patient: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    login: true,
                    firstName: true,
                    lastName: true,
                    middleName: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!trainer) {
      throw new NotFoundException('Trainer not found');
    }

    return trainer;
  }

  async findBySection(section: string) {
    return this.prisma.trainer.findMany({
      where: { section },
      orderBy: { title: 'asc' },
    });
  }

  async getSections() {
    const trainers = await this.prisma.trainer.findMany({
      select: { section: true },
      distinct: ['section'],
      orderBy: { section: 'asc' },
    });

    return trainers.map(t => t.section);
  }

  async create(data: {
    title: string;
    description?: string;
    iframeUrl: string;
    section: string;
  }) {
    return this.prisma.trainer.create({
      data,
    });
  }

  async update(id: string, data: {
    title?: string;
    description?: string;
    iframeUrl?: string;
    section?: string;
  }) {
    const trainer = await this.prisma.trainer.findUnique({
      where: { id },
    });

    if (!trainer) {
      throw new NotFoundException('Trainer not found');
    }

    return this.prisma.trainer.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    const trainer = await this.prisma.trainer.findUnique({
      where: { id },
    });

    if (!trainer) {
      throw new NotFoundException('Trainer not found');
    }

    // Проверяем, есть ли назначения
    const assignments = await this.prisma.assignment.findMany({
      where: { trainerId: id },
    });

    if (assignments.length > 0) {
      throw new Error('Cannot delete trainer with existing assignments');
    }

    return this.prisma.trainer.delete({
      where: { id },
    });
  }
}
