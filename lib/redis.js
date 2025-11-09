import Redis from 'ioredis';

// Redis configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: false,
};

// Create Redis client
const redis = new Redis(redisConfig);

// Connection event handlers
redis.on('connect', () => {
  console.log('✅ Redis: Connected to Redis server');
});

redis.on('ready', () => {
  console.log('✅ Redis: Ready to accept commands');
});

redis.on('error', (err) => {
  console.error('❌ Redis Error:', err);
});

redis.on('close', () => {
  console.log('⚠️  Redis: Connection closed');
});

redis.on('reconnecting', () => {
  console.log('🔄 Redis: Reconnecting...');
});

/**
 * Cache data with optional TTL
 */
export async function cacheSet(key, value, ttlSeconds) {
  const serialized = JSON.stringify(value);
  if (ttlSeconds) {
    await redis.setex(key, ttlSeconds, serialized);
  } else {
    await redis.set(key, serialized);
  }
}

/**
 * Get cached data
 */
export async function cacheGet(key) {
  const data = await redis.get(key);
  if (!data) return null;
  return JSON.parse(data);
}

/**
 * Delete cached data
 */
export async function cacheDel(key) {
  await redis.del(key);
}

/**
 * Delete multiple keys by pattern
 */
export async function cacheDelPattern(pattern) {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}

/**
 * Check if key exists
 */
export async function cacheExists(key) {
  const result = await redis.exists(key);
  return result === 1;
}

/**
 * Increment a counter
 */
export async function cacheIncr(key) {
  try {
    return await redis.incr(key);
  } catch (error) {
    console.error('❌ Cache increment error:', error);
    throw error; // Re-throw so rateLimitCache can handle it
  }
}

/**
 * Set expiration on existing key
 */
export async function cacheExpire(key, seconds) {
  await redis.expire(key, seconds);
}

/**
 * Get remaining TTL
 */
export async function cacheTTL(key) {
  return await redis.ttl(key);
}

// Session management helpers
export const sessionCache = {
  async set(sessionId, data, ttl = 86400) {
    await cacheSet(`session:${sessionId}`, data, ttl);
  },

  async get(sessionId) {
    return await cacheGet(`session:${sessionId}`);
  },

  async delete(sessionId) {
    await cacheDel(`session:${sessionId}`);
  },

  async refresh(sessionId, ttl = 86400) {
    await cacheExpire(`session:${sessionId}`, ttl);
  }
};

// Rate limiting helpers
export const rateLimitCache = {
  async increment(identifier, windowSeconds) {
    try {
      const key = `ratelimit:${identifier}`;
      const count = await cacheIncr(key);
      
      // Set expiration on first increment
      if (count === 1) {
        await cacheExpire(key, windowSeconds);
      }
      
      return count;
    } catch (error) {
      console.error('❌ Rate limit increment error:', error);
      return 1; // Fail open - allow the request
    }
  },

  async check(identifier, maxRequests, windowSeconds) {
    try {
      const count = await this.increment(identifier, windowSeconds);
      const allowed = count <= maxRequests;
      console.log('🔍 Rate limit check:', { identifier, count, maxRequests, allowed });
      return allowed;
    } catch (error) {
      console.error('❌ Rate limit check error:', error);
      return true; // Fail open - allow the request on error
    }
  },

  async getRemainingTTL(identifier) {
    try {
      const ttl = await cacheTTL(`ratelimit:${identifier}`);
      return ttl > 0 ? ttl : 0;
    } catch (error) {
      console.error('❌ Rate limit TTL error:', error);
      return 0;
    }
  }
};

// Data caching helpers for frequently accessed data
export const dataCache = {
  async cacheRide(rideId, data, ttl = 300) {
    await cacheSet(`ride:${rideId}`, data, ttl);
  },

  async getRide(rideId) {
    return await cacheGet(`ride:${rideId}`);
  },

  async invalidateRide(rideId) {
    await cacheDel(`ride:${rideId}`);
  },

  async cacheDriver(driverId, data, ttl = 600) {
    await cacheSet(`driver:${driverId}`, data, ttl);
  },

  async getDriver(driverId) {
    return await cacheGet(`driver:${driverId}`);
  },

  async invalidateDriver(driverId) {
    await cacheDel(`driver:${driverId}`);
  },

  async cacheBusinessRides(businessId, data, ttl = 180) {
    await cacheSet(`business:${businessId}:rides`, data, ttl);
  },

  async getBusinessRides(businessId) {
    return await cacheGet(`business:${businessId}:rides`);
  },

  async invalidateBusinessRides(businessId) {
    await cacheDel(`business:${businessId}:rides`);
  }
};

export default redis;