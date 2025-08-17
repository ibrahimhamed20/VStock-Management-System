import { Cache } from 'cache-manager';

// Helper to generate a cache key based on method name and args
function defaultCacheKey(args: any[], methodName: string) {
  return `${methodName}:${JSON.stringify(args)}`;
}

export function Cacheable(ttl = 60, cacheKeyFn = defaultCacheKey) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      // 'this' refers to the service instance
      const cacheManager: Cache = this.cacheManager;
      if (!cacheManager) {
        throw new Error('CacheManager not found on class instance');
      }
      const key = cacheKeyFn(args, propertyKey);
      const cached = await cacheManager.get(key);
      if (cached) return cached;
      const result = await originalMethod.apply(this, args);
      await cacheManager.set(key, result, ttl);
      return result;
    };

    return descriptor;
  };
} 