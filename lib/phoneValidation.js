// lib/phoneValidation.js

/**
 * Validate and format UK phone numbers
 * Accepts: 07123456789, +447123456789, 07123 456789, etc.
 * Returns: Formatted number or false if invalid
 */

export function validatePhoneUK(phone) {
  if (!phone || typeof phone !== 'string') {
    return { 
      valid: false, 
      formatted: '', 
      message: 'Phone number is required' 
    };
  }

  // Remove all spaces, dashes, parentheses
  let cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  // Remove +44 prefix if present
  if (cleaned.startsWith('+44')) {
    cleaned = '0' + cleaned.slice(3);
  } else if (cleaned.startsWith('44')) {
    cleaned = '0' + cleaned.slice(2);
  }
  
  // UK phone numbers should be 11 digits starting with 0
  const ukPhoneRegex = /^0[1-9]\d{9}$/;
  
  if (!ukPhoneRegex.test(cleaned)) {
    return {
      valid: false,
      formatted: '',
      message: 'Please enter a valid UK phone number (e.g., 07123456789 or 0161 123 4567)'
    };
  }
  
  // Format as: 07123 456789
  const formatted = cleaned.slice(0, 5) + ' ' + cleaned.slice(5);
  
  return {
    valid: true,
    formatted: formatted,
    message: ''
  };
}

/**
 * @deprecated Use validatePhoneUK instead
 * Kept for backwards compatibility only
 */
export function validateUKPhone(phone) {
  const result = validatePhoneUK(phone);
  return {
    isValid: result.valid,
    formatted: result.formatted,
    error: result.message
  };
}

/**
 * @deprecated Use validatePhoneUK instead
 * Kept for backwards compatibility only
 */
export function validatePhoneInput(value) {
  if (!value) return { valid: true, message: '' }; // Optional field
  
  const result = validatePhoneUK(value);
  return {
    valid: result.valid,
    message: result.message
  };
}

/**
 * Format a phone number for display
 */
export function formatUKPhone(phone) {
  if (!phone) return '';
  
  const result = validatePhoneUK(phone);
  return result.valid ? result.formatted : phone;
}

/**
 * Get validation message for forms
 */
export function getPhoneValidationMessage() {
  return 'Please enter a valid UK phone number (e.g., 07123456789 or 0161 123 4567)';
}
