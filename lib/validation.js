import validator from 'validator';
import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtml(dirty) {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: []
  });
}

/**
 * Sanitize plain text (remove all HTML)
 */
export function sanitizePlainText(input) {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
}

/**
 * Validate and sanitize email
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required' };
  }

  const trimmed = email.trim().toLowerCase();
  
  if (!validator.isEmail(trimmed)) {
    return { valid: false, error: 'Invalid email format' };
  }

  // Check for common disposable email domains
  const disposableDomains = [
    'tempmail.com', 'guerrillamail.com', 'throwaway.email', 
    'mailinator.com', '10minutemail.com', 'trashmail.com'
  ];
  
  const domain = trimmed.split('@')[1];
  if (disposableDomains.includes(domain)) {
    return { valid: false, error: 'Disposable email addresses are not allowed' };
  }

  return { valid: true, sanitized: trimmed };
}

/**
 * Validate phone number (UK format)
 */
export function validatePhoneUK(phone) {
  if (!phone || typeof phone !== 'string') {
    return { valid: false, error: 'Phone number is required' };
  }

  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // UK mobile: 07xxx xxxxxx (11 digits)
  // UK landline: 01xx xxxx xxxx or 02x xxxx xxxx (10-11 digits)
  if (digits.length < 10 || digits.length > 11) {
    return { valid: false, error: 'Invalid UK phone number length' };
  }

  // Check if it starts with valid UK prefix
  if (!digits.startsWith('0')) {
    return { valid: false, error: 'UK phone numbers must start with 0' };
  }

  // Format: 07xxx xxxxxx
  let formatted = digits;
  if (digits.startsWith('07') && digits.length === 11) {
    formatted = `${digits.slice(0, 5)} ${digits.slice(5)}`;
  } else if (digits.length === 11) {
    formatted = `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  } else if (digits.length === 10) {
    formatted = `${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7)}`;
  }

  return { valid: true, sanitized: formatted };
}

/**
 * Validate postcode (UK format)
 */
export function validatePostcodeUK(postcode) {
  if (!postcode || typeof postcode !== 'string') {
    return { valid: false, error: 'Postcode is required' };
  }

  const trimmed = postcode.trim().toUpperCase().replace(/\s+/g, ' ');
  
  // UK postcode regex
  const postcodeRegex = /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/;
  
  if (!postcodeRegex.test(trimmed)) {
    return { valid: false, error: 'Invalid UK postcode format' };
  }

  return { valid: true, sanitized: trimmed };
}

/**
 * Validate and sanitize name
 */
export function validateName(name, fieldName = 'Name') {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: `${fieldName} is required` };
  }

  const sanitized = sanitizePlainText(name.trim());
  
  if (sanitized.length < 2) {
    return { valid: false, error: `${fieldName} must be at least 2 characters` };
  }

  if (sanitized.length > 100) {
    return { valid: false, error: `${fieldName} must not exceed 100 characters` };
  }

  // Only allow letters, spaces, hyphens, apostrophes
  if (!/^[a-zA-Z\s'-]+$/.test(sanitized)) {
    return { valid: false, error: `${fieldName} contains invalid characters` };
  }

  return { valid: true, sanitized };
}

/**
 * Validate password strength
 */
export function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Password is required' };
  }

  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters' };
  }

  if (password.length > 128) {
    return { valid: false, error: 'Password must not exceed 128 characters' };
  }

  let strength = 0;

  // Check for lowercase
  if (/[a-z]/.test(password)) strength++;
  
  // Check for uppercase
  if (/[A-Z]/.test(password)) strength++;
  
  // Check for numbers
  if (/\d/.test(password)) strength++;
  
  // Check for special characters
  if (/[^a-zA-Z\d]/.test(password)) strength++;

  if (strength < 3) {
    return { 
      valid: false, 
      error: 'Password must contain at least 3 of: lowercase, uppercase, numbers, special characters',
      strength: 'weak'
    };
  }

  const strengthLabel = strength === 4 ? 'strong' : 'medium';
  return { valid: true, strength: strengthLabel };
}

/**
 * Validate currency amount (in pence/cents)
 */
export function validateAmount(amount) {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return { valid: false, error: 'Amount must be a valid number' };
  }

  if (amount < 0) {
    return { valid: false, error: 'Amount cannot be negative' };
  }

  if (amount > 100000000) { // £1,000,000 in pence
    return { valid: false, error: 'Amount exceeds maximum allowed' };
  }

  // Check if it's an integer (no decimal places in pence)
  if (!Number.isInteger(amount)) {
    return { valid: false, error: 'Amount must be in whole pence' };
  }

  return { valid: true };
}

/**
 * Validate coordinates
 */
export function validateCoordinates(lat, lng) {
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return { valid: false, error: 'Coordinates must be numbers' };
  }

  if (isNaN(lat) || isNaN(lng)) {
    return { valid: false, error: 'Invalid coordinates' };
  }

  if (lat < -90 || lat > 90) {
    return { valid: false, error: 'Latitude must be between -90 and 90' };
  }

  if (lng < -180 || lng > 180) {
    return { valid: false, error: 'Longitude must be between -180 and 180' };
  }

  return { valid: true };
}

/**
 * Validate date is in the future
 */
export function validateFutureDate(date) {
  const inputDate = new Date(date);
  
  if (isNaN(inputDate.getTime())) {
    return { valid: false, error: 'Invalid date format' };
  }

  const now = new Date();
  
  if (inputDate <= now) {
    return { valid: false, error: 'Date must be in the future' };
  }

  return { valid: true };
}

/**
 * Validate resident initials
 */
export function validateResidentInitials(initials) {
  if (!initials || typeof initials !== 'string') {
    return { valid: false, error: 'Resident initials are required' };
  }

  const sanitized = sanitizePlainText(initials.trim().toUpperCase());
  
  // Allow 2-4 letters only
  if (!/^[A-Z]{2,4}$/.test(sanitized)) {
    return { valid: false, error: 'Initials must be 2-4 letters only' };
  }

  return { valid: true, sanitized };
}

/**
 * Validate file upload
 */
export function validateFileUpload(file, allowedTypes, maxSizeBytes) {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  // Check file size
  if (file.size > maxSizeBytes) {
    const maxSizeMB = maxSizeBytes / (1024 * 1024);
    return { valid: false, error: `File size must not exceed ${maxSizeMB}MB` };
  }

  // Check file type
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  if (!fileExtension || !allowedTypes.includes(fileExtension)) {
    return { valid: false, error: `File type must be one of: ${allowedTypes.join(', ')}` };
  }

  return { valid: true };
}

/**
 * Sanitize and validate text area content
 */
export function validateTextArea(content, minLength = 10, maxLength = 1000) {
  if (!content || typeof content !== 'string') {
    return { valid: false, error: 'Content is required' };
  }

  const sanitized = sanitizePlainText(content.trim());
  
  if (sanitized.length < minLength) {
    return { valid: false, error: `Content must be at least ${minLength} characters` };
  }

  if (sanitized.length > maxLength) {
    return { valid: false, error: `Content must not exceed ${maxLength} characters` };
  }

  return { valid: true, sanitized };
}

/**
 * Comprehensive validation error formatter
 */
export function formatValidationErrors(errors) {
  return Object.entries(errors)
    .map(([field, error]) => `${field}: ${error}`)
    .join(', ');
}


/**
 * Sanitize booking form data
 * Returns sanitized data or throws validation error
 */
export function sanitizeBookingData(data) {
  const sanitized = { ...data };

  // Sanitize text fields with length limits
  if (data.additionalNeeds) {
    const result = validateTextArea(data.additionalNeeds, 0, 500);
    sanitized.additionalNeeds = result.valid ? result.sanitized : null;
  }

  if (data.specificMusic) {
    sanitized.specificMusic = sanitizePlainText(data.specificMusic || '').substring(0, 200) || null;
  }

  if (data.medicalConditions) {
    const result = validateTextArea(data.medicalConditions, 0, 500);
    sanitized.medicalConditions = result.valid ? result.sanitized : null;
  }

  if (data.preferredLanguage) {
    sanitized.preferredLanguage = sanitizePlainText(data.preferredLanguage || '').substring(0, 50) || null;
  }

  // Sanitize location strings
  if (data.pickupLocation) {
    sanitized.pickupLocation = sanitizePlainText(data.pickupLocation).substring(0, 200);
  }

  if (data.dropoffLocation) {
    sanitized.dropoffLocation = sanitizePlainText(data.dropoffLocation).substring(0, 200);
  }

  // Validate coordinates if provided
  if (data.dropoffLat !== undefined && data.dropoffLng !== undefined) {
    const lat = parseFloat(data.dropoffLat);
    const lng = parseFloat(data.dropoffLng);
    const coordCheck = validateCoordinates(lat, lng);
    
    if (!coordCheck.valid) {
      throw new Error(coordCheck.error);
    }
    sanitized.dropoffLat = lat;
    sanitized.dropoffLng = lng;
  }

  if (data.pickupLat !== undefined && data.pickupLng !== undefined) {
    const lat = parseFloat(data.pickupLat);
    const lng = parseFloat(data.pickupLng);
    const coordCheck = validateCoordinates(lat, lng);
    
    if (!coordCheck.valid) {
      throw new Error(coordCheck.error);
    }
    sanitized.pickupLat = lat;
    sanitized.pickupLng = lng;
  }

  // Validate passenger count
  if (data.passengerCount !== undefined) {
    const count = parseInt(data.passengerCount);
    if (isNaN(count) || count < 1 || count > 8) {
      throw new Error('Passenger count must be between 1 and 8');
    }
    sanitized.passengerCount = count;
  }

  // Validate wheelchair users count
  if (data.wheelchairUsers !== undefined) {
    const count = parseInt(data.wheelchairUsers);
    if (isNaN(count) || count < 0 || count > 4) {
      throw new Error('Wheelchair users count must be between 0 and 4');
    }
    sanitized.wheelchairUsers = count;
  }

  // Ensure booleans are actually booleans
  const booleanFields = [
    'wheelchairAccess', 'doubleWheelchairAccess', 'highRoof', 
    'seatTransferHelp', 'mobilityAidStorage', 'electricScooterStorage',
    'quietEnvironment', 'noConversation', 'noScents', 'visualSchedule',
    'signLanguageRequired', 'textOnlyCommunication', 'translationSupport',
    'assistanceRequired', 'assistanceAnimal', 'familiarDriverOnly',
    'femaleDriverOnly', 'nonWAVvehicle', 'medicationOnBoard',
    'firstAidTrained', 'conditionAwareness', 'carerPresent', 'escortRequired'
  ];

  booleanFields.forEach(field => {
    if (data[field] !== undefined) {
      sanitized[field] = Boolean(data[field]);
    }
  });

  return sanitized;
}

/**
 * Validate array of resident IDs
 */
export function validateResidentIds(ids) {
  if (!Array.isArray(ids) || ids.length === 0) {
    return { valid: false, error: 'At least one resident must be selected' };
  }

  if (ids.length > 20) {
    return { valid: false, error: 'Maximum 20 residents per booking' };
  }

  // Ensure all IDs are strings
  const validIds = ids.every(id => typeof id === 'string' && id.length > 0);
  if (!validIds) {
    return { valid: false, error: 'Invalid resident ID format' };
  }

  return { valid: true, ids };
}