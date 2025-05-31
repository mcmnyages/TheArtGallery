/**
 * Validates email format
 * @param {string} email - The email to validate
 * @returns {boolean} - True if email is valid
 */
export const validateEmail = (email) => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

/**
 * Validates password strength and returns array of error messages
 * @param {string} password - The password to validate
 * @returns {string[]} - Array of error messages, empty if password is valid
 */
export const validatePassword = (password) => {
  const errors = [];
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }
  if (!hasUpperCase) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!hasLowerCase) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!hasNumbers) {
    errors.push('Password must contain at least one number');
  }
  if (!hasSpecialChar) {
    errors.push('Password must contain at least one special character');
  }

  return errors;
};

/**
 * Validates name format (first name, last name)
 * @param {string} name - The name to validate
 * @returns {{ isValid: boolean, error?: string }} - Validation result
 */
export const validateName = (name) => {
  if (!name || typeof name !== 'string') {
    return { isValid: false, error: 'Name is required' };
  }

  const trimmedName = name.trim();
  
  if (trimmedName.length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters long' };
  }

  if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(trimmedName)) {
    return { isValid: false, error: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
  }

  return { isValid: true };
};

/**
 * Validates a name (first name, last name)
 * @param {string} name - The name to validate
 * @returns {boolean} - True if name is valid
 */

/**
 * Get password strength assessment
 * @param {string} password - The password to check
 * @returns {Object} - Score and descriptive message
 */
export const getPasswordStrength = (password) => {
  if (!password) {
    return { score: 0, message: 'No password' };
  }
  
  let score = 0;
  
  // Basic length check
  if (password.length >= 8) {
    score += 1;
  }
  
  // Check for numbers
  if (/[0-9]/.test(password)) {
    score += 1;
  }
  
  // Check for special characters
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score += 1;
  }
  
  // Check for mixed case
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
    score += 1;
  }
  
  // Return assessment
  switch (score) {
    case 0:
      return { score, message: 'Very weak' };
    case 1:
      return { score, message: 'Weak' };
    case 2:
      return { score, message: 'Medium' };
    case 3:
      return { score, message: 'Strong' };
    case 4:
      return { score, message: 'Very strong' };
    default:
      return { score: 0, message: 'Invalid' };
  }
};