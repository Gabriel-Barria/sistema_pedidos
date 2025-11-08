import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { CacheService } from './cache.service';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: (configService: ConfigService) => {
        const redis = new Redis({
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
          password: configService.get('REDIS_PASSWORD'),
          db: configService.get('REDIS_DB', 0),
          retryStrategy: (times) => {
            const delay = Math.min(times * 50, 2000);
            return delay;
          },
        });

        redis.on('connect', () => {
          console.log('Redis connected successfully');
        });

        redis.on('error', (err) => {
          console.error('Redis connection error:', err);
        });

        return redis;
      },
      inject: [ConfigService],
    },
    CacheService,
  ],
  exports: ['REDIS_CLIENT', CacheService],
})
export class CacheModule {}
