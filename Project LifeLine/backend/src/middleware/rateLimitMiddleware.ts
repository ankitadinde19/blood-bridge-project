import rateLimit from 'express-rate-limit';

const isDevelopment = process.env.NODE_ENV !== 'production';

/**
 * ============================================
 * GLOBAL API RATE LIMITER
 * ============================================
 */
export const globalRateLimiter = rateLimit({

  // 15 minutes
  windowMs: 15 * 60 * 1000,

  // Much higher for dashboard apps
  max: isDevelopment ? 5000 : 1000,

  standardHeaders: true,
  legacyHeaders: false,

  // Prevent proxy issues
  validate: {
    trustProxy: false,
  },

  // Ignore successful requests in development
  skipSuccessfulRequests: isDevelopment,

  // Do not block OPTIONS/preflight
  skip: (req) => req.method === 'OPTIONS',

  handler: (req, res) => {

    res.status(429).json({
      success: false,
      message: 'Too many API requests. Please slow down.',
      data: null,
      errors: ['Global rate limit exceeded'],
    });

  },

});


/**
 * ============================================
 * AUTH RATE LIMITER
 * ============================================
 */
export const authRateLimiter = rateLimit({

  // 15 minutes
  windowMs: 15 * 60 * 1000,

  // Auth should remain stricter
  max: isDevelopment ? 200 : 20,

  standardHeaders: true,
  legacyHeaders: false,

  validate: {
    trustProxy: false,
  },

  // Skip successful logins
  skipSuccessfulRequests: true,

  // Skip OPTIONS
  skip: (req) => req.method === 'OPTIONS',

  handler: (req, res) => {

    res.status(429).json({
      success: false,
      message: 'Too many authentication attempts.',
      data: null,
      errors: ['Authentication rate limit exceeded'],
    });

  },

});