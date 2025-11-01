/**
 * Validators - Reusable validation functions
 * Centralized validation logic for forms and data
 */

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
}

/**
 * Email validation
 */
export function validateEmail(email: string): ValidationResult {
  if (!email) {
    return { valid: false, errors: ['Email is required'] };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, errors: ['Please enter a valid email address'] };
  }
  
  return { valid: true };
}

/**
 * Password validation
 * Requirements: 8+ chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
 */
export function validatePassword(password: string): ValidationResult {
  const errors: string[] = [];
  
  if (!password) {
    return { valid: false, errors: ['Password is required'] };
  }
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}

/**
 * Password strength calculator
 */
export function calculatePasswordStrength(password: string): {
  score: number; // 0-4
  label: 'weak' | 'fair' | 'good' | 'strong' | 'very strong';
} {
  let score = 0;
  
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  
  const labels: Array<'weak' | 'fair' | 'good' | 'strong' | 'very strong'> = [
    'weak',
    'fair',
    'good',
    'strong',
    'very strong',
  ];
  
  return {
    score: Math.min(score, 4),
    label: labels[Math.min(score, 4)],
  };
}

/**
 * URL validation
 */
export function validateUrl(url: string): ValidationResult {
  if (!url) {
    return { valid: false, errors: ['URL is required'] };
  }
  
  try {
    new URL(url);
    return { valid: true };
  } catch {
    return { valid: false, errors: ['Please enter a valid URL'] };
  }
}

/**
 * UUID validation
 */
export function validateUuid(id: string): ValidationResult {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
  if (!id) {
    return { valid: false, errors: ['ID is required'] };
  }
  
  if (!uuidRegex.test(id)) {
    return { valid: false, errors: ['Invalid ID format'] };
  }
  
  return { valid: true };
}

/**
 * Required field validation
 */
export function validateRequired(value: any, fieldName: string = 'Field'): ValidationResult {
  if (value === null || value === undefined || value === '') {
    return { valid: false, errors: [`${fieldName} is required`] };
  }
  
  return { valid: true };
}

/**
 * Min length validation
 */
export function validateMinLength(
  value: string,
  minLength: number,
  fieldName: string = 'Field'
): ValidationResult {
  if (!value || value.length < minLength) {
    return {
      valid: false,
      errors: [`${fieldName} must be at least ${minLength} characters`],
    };
  }
  
  return { valid: true };
}

/**
 * Max length validation
 */
export function validateMaxLength(
  value: string,
  maxLength: number,
  fieldName: string = 'Field'
): ValidationResult {
  if (value && value.length > maxLength) {
    return {
      valid: false,
      errors: [`${fieldName} must be no more than ${maxLength} characters`],
    };
  }
  
  return { valid: true };
}

/**
 * Number range validation
 */
export function validateRange(
  value: number,
  min: number,
  max: number,
  fieldName: string = 'Value'
): ValidationResult {
  if (value < min || value > max) {
    return {
      valid: false,
      errors: [`${fieldName} must be between ${min} and ${max}`],
    };
  }
  
  return { valid: true };
}

/**
 * Phone number validation (basic)
 */
export function validatePhone(phone: string): ValidationResult {
  if (!phone) {
    return { valid: false, errors: ['Phone number is required'] };
  }
  
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  if (digits.length < 10 || digits.length > 15) {
    return { valid: false, errors: ['Please enter a valid phone number'] };
  }
  
  return { valid: true };
}

/**
 * Credit card number validation (Luhn algorithm)
 */
export function validateCreditCard(cardNumber: string): ValidationResult {
  if (!cardNumber) {
    return { valid: false, errors: ['Card number is required'] };
  }
  
  const digits = cardNumber.replace(/\D/g, '');
  
  if (digits.length < 13 || digits.length > 19) {
    return { valid: false, errors: ['Invalid card number length'] };
  }
  
  // Luhn algorithm
  let sum = 0;
  let isEven = false;
  
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  if (sum % 10 !== 0) {
    return { valid: false, errors: ['Invalid card number'] };
  }
  
  return { valid: true };
}

/**
 * Date validation
 */
export function validateDate(dateString: string): ValidationResult {
  if (!dateString) {
    return { valid: false, errors: ['Date is required'] };
  }
  
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return { valid: false, errors: ['Invalid date format'] };
  }
  
  return { valid: true };
}

/**
 * Future date validation
 */
export function validateFutureDate(dateString: string): ValidationResult {
  const dateValidation = validateDate(dateString);
  if (!dateValidation.valid) {
    return dateValidation;
  }
  
  const date = new Date(dateString);
  const now = new Date();
  
  if (date <= now) {
    return { valid: false, errors: ['Date must be in the future'] };
  }
  
  return { valid: true };
}

/**
 * Match validation (e.g., password confirmation)
 */
export function validateMatch(
  value1: string,
  value2: string,
  fieldName: string = 'Values'
): ValidationResult {
  if (value1 !== value2) {
    return { valid: false, errors: [`${fieldName} do not match`] };
  }
  
  return { valid: true };
}

/**
 * Combine multiple validations
 */
export function validateAll(...validations: ValidationResult[]): ValidationResult {
  const allErrors: string[] = [];
  
  for (const validation of validations) {
    if (!validation.valid && validation.errors) {
      allErrors.push(...validation.errors);
    }
  }
  
  return allErrors.length === 0 ? { valid: true } : { valid: false, errors: allErrors };
}

/**
 * Form field validation helper
 */
export function validateField(
  value: any,
  rules: Array<(val: any) => ValidationResult>
): ValidationResult {
  for (const rule of rules) {
    const result = rule(value);
    if (!result.valid) {
      return result;
    }
  }
  
  return { valid: true };
}
