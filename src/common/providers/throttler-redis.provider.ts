// import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { ThrottlerRedisStorage } from './throttler-redis.storage';

export const throttlerRedisProvider = {
  provide: 'THROTTLER_STORAGE',
  useFactory: async () => {
    return new ThrottlerRedisStorage({
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      db: 0,
    });
  },
}; 