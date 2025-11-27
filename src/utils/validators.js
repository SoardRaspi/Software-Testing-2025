/**
 * Validators Utility Module
 * Contains validation functions with complex control flow for mutation testing
 */

/**
 * Validates email format
 * @param {string} email - Email address to validate
 * @returns {boolean} true if valid email format
 */
export function validateEmail(email) {
  // Multiple nested validations for edge cases
  if (!email || typeof email !== 'string') {
    return false;
  }

  // Trim whitespace
  email = email.trim();

  // Check minimum length
  if (email.length < 5) {
    return false;
  }

  // Must contain @ symbol
  if (!email.includes('@')) {
    return false;
  }

  // Split by @ and validate parts
  const parts = email.split('@');
  
  if (parts.length !== 2) {
    return false; // Multiple @ symbols or none
  }

  const [localPart, domainPart] = parts;

  // Validate local part
  if (localPart.length === 0 || localPart.length > 64) {
    return false;
  }

  // Validate domain part
  if (domainPart.length === 0 || domainPart.length > 255) {
    return false;
  }

  // Domain must have at least one dot
  if (!domainPart.includes('.')) {
    return false;
  }

  // Check domain extension
  const domainParts = domainPart.split('.');
  const extension = domainParts[domainParts.length - 1];
  
  if (extension.length < 2) {
    return false;
  }

  return true;
}

/**
 * Validates ISBN (International Standard Book Number)
 * Supports both ISBN-10 and ISBN-13 formats
 * @param {string} isbn - ISBN to validate
 * @returns {boolean} true if valid ISBN
 */
export function validateISBN(isbn) {
  if (!isbn || typeof isbn !== 'string') {
    return false;
  }

  // Remove hyphens and spaces
  isbn = isbn.replace(/[-\s]/g, '');

  // Check if contains only digits
  if (!/^\d+$/.test(isbn)) {
    return false;
  }

  // Validate based on length
  if (isbn.length === 10) {
    return validateISBN10(isbn);
  } else if (isbn.length === 13) {
    return validateISBN13(isbn);
  } else {
    return false;
  }
}

/**
 * Validates ISBN-10 using checksum algorithm
 * @param {string} isbn - 10-digit ISBN
 * @returns {boolean} true if valid
 */
function validateISBN10(isbn) {
  let sum = 0;
  
  for (let i = 0; i < 10; i++) {
    const digit = parseInt(isbn[i]);
    sum += digit * (10 - i);
  }

  return sum % 11 === 0;
}

/**
 * Validates ISBN-13 using checksum algorithm
 * @param {string} isbn - 13-digit ISBN
 * @returns {boolean} true if valid
 */
function validateISBN13(isbn) {
  let sum = 0;
  
  for (let i = 0; i < 13; i++) {
    const digit = parseInt(isbn[i]);
    const multiplier = (i % 2 === 0) ? 1 : 3;
    sum += digit * multiplier;
  }

  return sum % 10 === 0;
}

/**
 * Validates price value
 * @param {number} price - Price to validate
 * @param {object} options - Validation options {min, max, allowZero}
 * @returns {object} Validation result {valid: boolean, error: string}
 */
export function validatePrice(price, options = {}) {
  const { min = 0, max = 10000, allowZero = false } = options;

  // Type checking with nested conditions
  if (typeof price !== 'number') {
    return { valid: false, error: 'Price must be a number' };
  }

  if (isNaN(price)) {
    return { valid: false, error: 'Price is not a valid number' };
  }

  if (!isFinite(price)) {
    return { valid: false, error: 'Price must be finite' };
  }

  // Check if zero is allowed
  if (price === 0) {
    if (allowZero) {
      return { valid: true, error: null };
    } else {
      return { valid: false, error: 'Price cannot be zero' };
    }
  }

  // Check negative values
  if (price < 0) {
    return { valid: false, error: 'Price cannot be negative' };
  }

  // Check minimum
  if (price < min) {
    return { valid: false, error: `Price must be at least ${min}` };
  }

  // Check maximum
  if (price > max) {
    return { valid: false, error: `Price cannot exceed ${max}` };
  }

  return { valid: true, error: null };
}

/**
 * Validates quantity value
 * @param {number} quantity - Quantity to validate
 * @param {object} options - Validation options {min, max, mustBeInteger}
 * @returns {object} Validation result
 */
export function validateQuantity(quantity, options = {}) {
  const { min = 1, max = 1000, mustBeInteger = true } = options;

  if (typeof quantity !== 'number') {
    return { valid: false, error: 'Quantity must be a number' };
  }

  if (isNaN(quantity) || !isFinite(quantity)) {
    return { valid: false, error: 'Quantity is invalid' };
  }

  // Check if must be integer
  if (mustBeInteger && !Number.isInteger(quantity)) {
    return { valid: false, error: 'Quantity must be a whole number' };
  }

  // Range validation with nested conditions
  if (quantity < min) {
    return { valid: false, error: `Quantity must be at least ${min}` };
  }

  if (quantity > max) {
    return { valid: false, error: `Quantity cannot exceed ${max}` };
  }

  return { valid: true, error: null };
}

/**
 * Validates product category
 * @param {string} category - Category to validate
 * @returns {boolean} true if valid category
 */
export function validateCategory(category) {
  if (!category || typeof category !== 'string') {
    return false;
  }

  const validCategories = [
    'fiction',
    'non-fiction',
    'science',
    'technology',
    'history',
    'biography',
    'children',
    'self-help',
    'business',
    'cooking',
    'art',
    'travel',
    'religion',
    'education'
  ];

  const normalizedCategory = category.toLowerCase().trim();

  return validCategories.includes(normalizedCategory);
}

/**
 * Validates shipping address
 * @param {object} address - Address object to validate
 * @returns {object} Validation result with specific field errors
 */
export function validateAddress(address) {
  const errors = [];

  // Check if address object exists
  if (!address || typeof address !== 'object') {
    return { valid: false, errors: ['Address is required'] };
  }

  // Validate street
  if (!address.street || typeof address.street !== 'string' || address.street.trim() === '') {
    errors.push('street');
  } else if (address.street.trim().length < 5) {
    errors.push('street');
  } else if (address.street.length > 200) {
    errors.push('street');
  }

  // Validate city
  if (!address.city || typeof address.city !== 'string' || address.city.trim() === '') {
    errors.push('city');
  } else if (address.city.trim().length < 2) {
    errors.push('city');
  } else if (address.city.length > 100) {
    errors.push('city');
  }

  // Validate ZIP code
  if (!address.zip || typeof address.zip !== 'string' || address.zip.trim() === '') {
    errors.push('zip');
  } else {
    const zip = address.zip.trim();
    
    if (zip.length < 5) {
      errors.push('zip');
    } else if (zip.length > 10) {
      errors.push('zip');
    } else if (!/^[\d\-\s]+$/.test(zip)) {
      errors.push('zip');
    }
  }

  // Validate country
  if (!address.country || typeof address.country !== 'string' || address.country.trim() === '') {
    errors.push('country');
  } else if (address.country.trim().length < 2) {
    errors.push('country');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validates search query
 * @param {string} query - Search query string
 * @param {object} options - Options {minLength, maxLength, allowSpecialChars}
 * @returns {object} Validation result
 */
export function validateSearchQuery(query, options = {}) {
  const { minLength = 0, maxLength = 100, allowSpecialChars = false } = options;

  // if (!query || typeof query !== 'string') {
  if (typeof query !== 'string') {
    return { valid: false, error: 'Search query is required' };
  }

  const trimmedQuery = query.trim();

  // Length validation with nested conditions
  if (trimmedQuery.length < minLength) {
    return { valid: false, error: `Query must be at least ${minLength} characters` };
  }

  if (trimmedQuery.length > maxLength) {
    return { valid: false, error: `Query cannot exceed ${maxLength} characters` };
  }

  // Check for special characters if not allowed
  if (!allowSpecialChars) {
    // Allow only alphanumeric, spaces, and basic punctuation
    if (!/^[a-zA-Z0-9\s\-,.'"]+$/.test(trimmedQuery)) {
      return { valid: false, error: 'Query contains invalid characters' };
    }
  }

  return { valid: true, error: null };
}

/**
 * Validates discount code format
 * @param {string} code - Discount code to validate
 * @returns {object} Validation result
 */
export function validateDiscountCode(code) {
  if (!code || typeof code !== 'string') {
    return { valid: false, error: 'Discount code is required' };
  }

  const trimmedCode = code.trim().toUpperCase();

  // Length validation
  if (trimmedCode.length < 4) {
    return { valid: false, error: 'Discount code is too short' };
  }

  if (trimmedCode.length > 20) {
    return { valid: false, error: 'Discount code is too long' };
  }

  // Format validation (alphanumeric and hyphens only)
  if (!/^[A-Z0-9\-]+$/.test(trimmedCode)) {
    return { valid: false, error: 'Discount code contains invalid characters' };
  }

  return { valid: true, error: null, code: trimmedCode };
}

/**
 * Validates payment method
 * @param {string} method - Payment method type
 * @returns {boolean} true if valid payment method
 */
export function validatePaymentMethod(method) {
  if (!method || typeof method !== 'string') {
    return false;
  }

  const validMethods = [
    'credit_card',
    'debit_card',
    'paypal',
    'cash_on_delivery',
    'bank_transfer'
  ];

  return validMethods.includes(method.toLowerCase());
}
