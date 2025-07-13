const redis = require('../config/redisConfig');

/**
 * Acquires a Redis lock using NX (set if not exists) and EX (expire)
 * @param key The key to lock
 * @param ttl Time to live (expiration in seconds)
 * @returns true if lock acquired, false otherwise
 */

export const acquireLock = async (key: string, ttl: number = 10): Promise<boolean> => {
  const result = await redis.set(key, 'locked', 'NX', 'EX', ttl);
  return result === 'OK';
};

/**
 * Releases the Redis lock by deleting the key
 * @param key The lock key
 * @returns number of keys deleted (0 or 1)
 */

export const releaseLock = async (key: string): Promise<number> => {
  return await redis.del(key);
};
