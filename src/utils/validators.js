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
 * Validates password strength
 * @param {string} password - The password to validate
 * @returns {boolean} - True if password meets requirements
 */
export const validatePassword = (password) => {
  // At least 8 chars, 1 number, 1 special character
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  return password.length >= 8 && hasNumber && hasSpecial;
};

/**
 * Validates a name (first name, last name)
 * @param {string} name - The name to validate
 * @returns {boolean} - True if name is valid
 */
export const validateName = (name) => {
  return name.trim().length >= 2;
};

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