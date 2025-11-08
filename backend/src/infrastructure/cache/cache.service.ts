import { Injectable, Inject, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      if (!value) {
        this.logger.debug(`Cache MISS: ${key}`);
        return null;
      }
      this.logger.debug(`Cache HIT: ${key}`);
      return JSON.parse(value) as T;
    } catch (error) {
      this.logger.error(`Error getting cache key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
    try {
      await this.redis.setex(key, ttlSeconds, JSON.stringify(value));
      this.logger.debug(`Cache SET: ${key} (TTL: ${ttlSeconds}s)`);
    } catch (error) {
      this.logger.error(`Error setting cache key ${key}:`, error);
    }
  }

  async invalidate(key: string): Promise<void> {
    try {
      await this.redis.del(key);
      this.logger.debug(`Cache INVALIDATED: ${key}`);
    } catch (error) {
      this.logger.error(`Error invalidating cache key ${key}:`, error);
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
        this.logger.debug(`Cache INVALIDATED PATTERN: ${pattern} (${keys.length} keys)`);
      }
    } catch (error) {
      this.logger.error(`Error invalidating cache pattern ${pattern}:`, error);
    }
  }

  async ping(): Promise<string> {
    return this.redis.ping();
  }
}
