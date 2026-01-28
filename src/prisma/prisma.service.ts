import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly pool: Pool;

  constructor(configService: ConfigService) {
    const databaseUrl = configService.get<string>('DATABASE_URL');
    if (!databaseUrl) {
      throw new Error('DATABASE_URL is not defined');
    }

    // Настройка Pool с поддержкой SSL для Render PostgreSQL
    // Render требует SSL даже для Internal подключений
    const pool = new Pool({
      connectionString: databaseUrl,
      // SSL настройки для Render PostgreSQL
      ssl: process.env.NODE_ENV === 'production' || databaseUrl.includes('render.com')
        ? {
            rejectUnauthorized: false, // Render использует самоподписанные сертификаты
          }
        : undefined,
    });
    const adapter = new PrismaPg(pool);

    super({ adapter });
    this.pool = pool;
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool.end();
  }
}
