import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  username: 'default',
  password: process.env.REDIS_PASSWORD,
  // tls: {}, // Uncomment if using TLS
});

redis.on('connect', () => console.log('✅ Redis connected'));
redis.on('error', err => console.error('❌ Redis connection error:', err));

export default redis;
