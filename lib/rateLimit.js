import { NextResponse } from 'next/server';
import { rateLimitCache } from './redis.js';


export function getClientIp(request) {
  // Check for forwarded IP (from proxies/load balancers)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  // Check for real IP
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  
  // Fallback to unknown
  return 'unknown';
}

// Default rate limit configurations for different endpoints
export const RATE_LIMITS = {
  // Authentication endpoints - stricter limits
  auth: {
    maxRequests: 5,
    windowSeconds: 900, // 15 minutes
    limit: 5,           
    window: 900         
  },
  AUTH: {               
    maxRequests: 5,
    windowSeconds: 900,
    limit: 5,
    window: 900
  },
  
  // General API endpoints
  api: {
    maxRequests: 100,
    windowSeconds: 60 // 1 minute
  },
  
  // File uploads - more restrictive
  upload: {
    maxRequests: 10,
    windowSeconds: 300 // 5 minutes
  },
  
  // Data export - very restrictive
  export: {
    maxRequests: 3,
    windowSeconds: 3600 // 1 hour
  },
  
  // Bid creation
  bid: {
    maxRequests: 20,
    windowSeconds: 60 // 1 minute
  },
  
  // Ride creation
  ride: {
    maxRequests: 30,
    windowSeconds: 60 // 1 minute
  },
  
  // Email sending
  email: {
    maxRequests: 5,
    windowSeconds: 300 // 5 minutes
  }
};

/**
 * Get identifier for rate limiting (IP or user ID)
 */
function getIdentifier(req, customIdentifier) {
  if (customIdentifier) {
    return customIdentifier(req);
  }

  // Try to get user ID from session/token
  const userId = req.headers.get('x-user-id');
  if (userId) {
    return `user:${userId}`;
  }

  // Fall back to IP address
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 
             req.headers.get('x-real-ip') || 
             'unknown';
  
  return `ip:${ip}`;
}

/**
 * Rate limiting middleware
 */
export async function rateLimit(req, config) {
  try {
    const identifier = getIdentifier(req, config.identifier);
    const endpoint = new URL(req.url).pathname;
    const key = `${endpoint}:${identifier}`;

    const allowed = await rateLimitCache.check(
      key,
      config.maxRequests,
      config.windowSeconds
    );

    if (!allowed) {
      const remainingTTL = await rateLimitCache.getRemainingTTL(key);
      
      return NextResponse.json(
        {
          error: 'Too many requests',
          message: `Rate limit exceeded. Please try again in ${Math.ceil(remainingTTL / 60)} minutes.`,
          retryAfter: remainingTTL
        },
        {
          status: 429,
          headers: {
            'Retry-After': remainingTTL.toString(),
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Reset': (Date.now() + remainingTTL * 1000).toString()
          }
        }
      );
    }

    // Request allowed
    return null;
  } catch (error) {
    console.error('Rate limit check error:', error);
    // On Redis error, allow request but log the issue
    return null;
  }
}

/**
 * Simple rate limiter for server actions (doesn't need request object)
 * Use this in Server Actions and NextAuth authorize function
 */
export async function simpleRateLimit(key, maxRequests, windowSeconds) {
  try {
    const allowed = await rateLimitCache.check(
      key,
      maxRequests,
      windowSeconds
    );

    if (!allowed) {
      const remainingTTL = await rateLimitCache.getRemainingTTL(key);
      
      return {
        success: false,
        retryAfter: remainingTTL,
        message: `Too many requests. Please try again in ${Math.ceil(remainingTTL / 60)} minutes.`
      };
    }

    return { success: true };
  } catch (error) {
    console.error('❌ Rate limit check error:', error);
    // On Redis error, allow request but log the issue
    return { success: true }; // Fail open
  }
}

/**
 * Create a rate-limited API handler
 */
export function withRateLimit(handler, config) {
  return async (req) => {
    const rateLimitResponse = await rateLimit(req, config);
    
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    return handler(req);
  };
}

/**
 * Helper to add rate limit headers to response
 */
export async function addRateLimitHeaders(response, req, config) {
  try {
    const identifier = getIdentifier(req, config.identifier);
    const endpoint = new URL(req.url).pathname;
    const key = `${endpoint}:${identifier}`;

    const remainingTTL = await rateLimitCache.getRemainingTTL(key);
    const currentCount = await rateLimitCache.increment(key, config.windowSeconds) - 1;

    response.headers.set('X-RateLimit-Limit', config.maxRequests.toString());
    response.headers.set('X-RateLimit-Remaining', Math.max(0, config.maxRequests - currentCount).toString());
    response.headers.set('X-RateLimit-Reset', (Date.now() + remainingTTL * 1000).toString());

    return response;
  } catch (error) {
    console.error('Error adding rate limit headers:', error);
    return response;
  }
}

/**
 * IP-based rate limiter for public endpoints
 */
export async function ipRateLimit(req, maxRequests = 60, windowSeconds = 60) {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 
             req.headers.get('x-real-ip') || 
             'unknown';

  return rateLimit(req, {
    maxRequests,
    windowSeconds,
    identifier: () => `ip:${ip}`
  });
}

/**
 * User-based rate limiter
 */
export async function userRateLimit(req, userId, maxRequests, windowSeconds) {
  return rateLimit(req, {
    maxRequests,
    windowSeconds,
    identifier: () => `user:${userId}`
  });
}