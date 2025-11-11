// lib/phoneValidation.js

/**
 * Validate and format UK phone numbers
 * Accepts: 07123456789, +447123456789, 07123 456789, etc.
 * Returns: Formatted number or false if invalid
 */

export function validateUKPhone(phone) {
  if (!phone) {
    return { isValid: false, error: "Phone number is required" };
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
  
  const isValid = ukPhoneRegex.test(cleaned);
  
  if (!isValid) {
    return {
      isValid: false,
      error: 'Please enter a valid UK phone number (e.g., 07123456789 or 0161 123 4567)'
    };
  }
  
  // Format as: 07123 456789
  const formatted = cleaned.slice(0, 5) + ' ' + cleaned.slice(5);
  
  return {
    isValid: true,
    formatted: formatted,
    error: null
  };
}

export function formatUKPhone(phone) {
  if (!phone) return '';
  
  // Clean the number first
  let cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  // Remove +44 prefix if present
  if (cleaned.startsWith('+44')) {
    cleaned = '0' + cleaned.slice(3);
  } else if (cleaned.startsWith('44')) {
    cleaned = '0' + cleaned.slice(2);
  }
  
  // Validate
  if (!validateUKPhone(cleaned)) {
    return phone; // Return original if invalid
  }
   
  
  // Format as: 07123 456789
  return cleaned.slice(0, 5) + ' ' + cleaned.slice(5);
}

export function getPhoneValidationMessage() {
  return 'Please enter a valid UK phone number (e.g., 07123456789 or 0161 123 4567)';
}

// Client-side validation for forms
export function validatePhoneInput(value) {
  if (!value) return { valid: true, message: '' }; // Optional field
  
  const isValid = validateUKPhone(value);
  
  return {
    valid: isValid,
    message: isValid ? '' : getPhoneValidationMessage()
  };
}