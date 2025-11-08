import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { TenantContext } from '../../modules/tenants/tenant-context';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
      ],
      errorFormat: 'colorless',
    });
  }

  async onModuleInit() {
    this.logger.log('Connecting to database...');

    // Note: Prisma middleware ($use) is not available in Prisma 6.x
    // Multi-tenancy is enforced through explicit tenantId filtering in repositories
    // and through TenantContext in application code

    // Event listeners for logging
    this.$on('query' as never, (e: unknown) => {
      const event = e as { query: string; params: string; duration: number };
      this.logger.debug(
        `Query: ${event.query} - Params: ${event.params} - Duration: ${event.duration}ms`,
      );
    });

    this.$on('error' as never, (e: unknown) => {
      const event = e as { message: string };
      this.logger.error(`Error: ${event.message}`);
    });

    this.$on('info' as never, (e: unknown) => {
      const event = e as { message: string };
      this.logger.log(`Info: ${event.message}`);
    });

    this.$on('warn' as never, (e: unknown) => {
      const event = e as { message: string };
      this.logger.warn(`Warning: ${event.message}`);
    });

    await this.$connect();
    this.logger.log('Database connected successfully');
  }

  async onModuleDestroy() {
    this.logger.log('Disconnecting from database...');
    await this.$disconnect();
    this.logger.log('Database disconnected');
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clean database in production');
    }

    // Para testing - eliminar todos los datos
    const models = Reflect.ownKeys(this).filter((key) => {
      if (typeof key === 'string') {
        return key[0] !== '_' && key !== '$connect' && key !== '$disconnect';
      }
      return false;
    });

    return Promise.all(
      models.map((modelKey) => {
        const model = this[modelKey as keyof this];
        if (model && typeof model === 'object' && 'deleteMany' in model) {
          return (model as { deleteMany: () => Promise<unknown> }).deleteMany();
        }
        return Promise.resolve();
      }),
    );
  }
}
