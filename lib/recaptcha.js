/**
 * reCAPTCHA v2 Integration
 * Server-side verification for form submissions
 */

/**
 * Verify reCAPTCHA token
 */
export async function verifyRecaptcha(token, remoteIp) {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  if (!secretKey) {
    console.error('RECAPTCHA_SECRET_KEY not configured');
    // In production, you might want to fail closed (return false)
    // For development, we'll allow it
    if (process.env.NODE_ENV === 'production') {
      return { success: false, error: 'reCAPTCHA not configured' };
    }
    return { success: true }; // Allow in development
  }

  if (!token) {
    return { success: false, error: 'No reCAPTCHA token provided' };
  }

  try {
    const params = new URLSearchParams({
      secret: secretKey,
      response: token,
    });

    if (remoteIp) {
      params.append('remoteip', remoteIp);
    }

    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      return { success: false, error: 'reCAPTCHA verification failed' };
    }

    const data = await response.json();

    if (!data.success) {
      const errorCodes = data['error-codes'] || [];
      console.error('reCAPTCHA verification failed:', errorCodes);
      
      // Handle specific error codes
      if (errorCodes.includes('timeout-or-duplicate')) {
        return { success: false, error: 'reCAPTCHA token expired or already used' };
      }
      
      if (errorCodes.includes('invalid-input-response')) {
        return { success: false, error: 'Invalid reCAPTCHA token' };
      }

      return { success: false, error: 'reCAPTCHA verification failed' };
    }

    // For reCAPTCHA v3, check score
    if (data.score !== undefined) {
      // Scores range from 0.0 to 1.0
      // 1.0 is very likely a good interaction, 0.0 is very likely a bot
      if (data.score < 0.5) {
        return { 
          success: false, 
          error: 'Suspicious activity detected',
          score: data.score
        };
      }
      return { success: true, score: data.score };
    }

    return { success: true };

  } catch (error) {
    console.error('Error verifying reCAPTCHA:', error);
    return { success: false, error: 'reCAPTCHA verification error' };
  }
}

/**
 * Middleware to verify reCAPTCHA for API routes
 */
export async function requireRecaptcha(token, remoteIp) {
  // Skip in development if reCAPTCHA is not configured
  if (process.env.NODE_ENV !== 'production' && !process.env.RECAPTCHA_SECRET_KEY) {
    return { valid: true };
  }

  if (!token) {
    return { valid: false, error: 'reCAPTCHA verification required' };
  }

  const result = await verifyRecaptcha(token, remoteIp);
  
  if (!result.success) {
    return { valid: false, error: result.error || 'reCAPTCHA verification failed' };
  }

  return { valid: true };
}

/**
 * Get reCAPTCHA site key for client-side
 */
export function getRecaptchaSiteKey() {
  return process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
}

/**
 * Check if reCAPTCHA is enabled
 */
export function isRecaptchaEnabled() {
  return !!(
    process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && 
    process.env.RECAPTCHA_SECRET_KEY
  );
}