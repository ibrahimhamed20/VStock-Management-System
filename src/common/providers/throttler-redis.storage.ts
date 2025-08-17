import { ThrottlerStorage } from '@nestjs/throttler';
import { ThrottlerStorageRecord } from '@nestjs/throttler/dist/throttler-storage-record.interface';
import Redis, { RedisOptions } from 'ioredis';

export class ThrottlerRedisStorage implements ThrottlerStorage {
  private redis: Redis;

  constructor(options: RedisOptions) {
    this.redis = new Redis(options);
  }

  async getRecord(key: string): Promise<number[]> {
    const result = await this.redis.lrange(key, 0, -1);
    return result.map(Number);
  }

  async addRecord(key: string, ttl: number): Promise<void> {
    const now = Date.now();
    await this.redis.rpush(key, now);
    await this.redis.expire(key, ttl);
  }

  increment(key: string, ttl: number, limit: number, blockDuration: number, throttlerName: string): Promise<ThrottlerStorageRecord> {
  // INSERT_YOUR_CODE
    return (async (): Promise<ThrottlerStorageRecord> => {
      const now = Date.now();
      // Get all timestamps
      let records = await this.redis.lrange(key, 0, -1);
      let timestamps = records.map(Number).filter(ts => !isNaN(ts));
      // Remove expired timestamps
      timestamps = timestamps.filter(ts => now - ts < ttl * 1000);

      let isBlocked = false;
      let blockedUntil = 0;
      let timeToBlockExpire = 0;

      if (timestamps.length >= limit) {
        const firstTs = timestamps[0];
        if (now - firstTs < blockDuration * 1000) {
          isBlocked = true;
          blockedUntil = firstTs + blockDuration * 1000;
          timeToBlockExpire = Math.max(0, Math.ceil((blockedUntil - now) / 1000));
        }
      }

      if (!isBlocked) {
        // Add new timestamp
        timestamps.push(now);
        // Keep only the last 'limit' timestamps
        if (timestamps.length > limit) {
          timestamps = timestamps.slice(timestamps.length - limit);
        }
        // Update Redis
        await this.redis.multi()
          .del(key)
          .rpush(key, ...timestamps)
          .expire(key, ttl)
          .exec();
      }

      const firstHit = timestamps[0] || now;
      const lastHit = timestamps[timestamps.length - 1] || now;
      const totalHits = timestamps.length;
      const timeToExpire = Math.max(0, Math.ceil((firstHit + ttl * 1000 - now) / 1000));

      return {
        totalHits,
        // firstHit,
        // lastHit,
        isBlocked,
        // blockedUntil,
        timeToExpire,
        timeToBlockExpire,
      };
    })();
  }
} 