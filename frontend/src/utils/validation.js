/**
 * MongoDB ObjectId validation utilities
 */

/**
 * Check if a string is a valid MongoDB ObjectId
 * @param {string} id - The ID to validate
 * @returns {boolean} - True if valid ObjectId, false otherwise
 */
export const isValidObjectId = (id) => {
  if (!id || typeof id !== 'string') {
    return false;
  }
  
  // MongoDB ObjectId is a 24-character hexadecimal string
  const objectIdRegex = /^[a-fA-F0-9]{24}$/;
  return objectIdRegex.test(id);
};

/**
 * Validate and throw error if invalid ObjectId
 * @param {string} id - The ID to validate
 * @param {string} fieldName - The field name for error message
 * @throws {Error} - If ID is invalid
 */
export const validateObjectId = (id, fieldName = 'ID') => {
  if (!isValidObjectId(id)) {
    throw new Error(`Invalid ${fieldName}: ${id}`);
  }
  return id;
};

/**
 * Extract valid ObjectId from various input formats
 * @param {string|object} value - The value to extract ID from
 * @returns {string|null} - The extracted ObjectId or null if invalid
 */
export const extractObjectId = (value) => {
  if (!value) {
    return null;
  }
  
  if (typeof value === 'string') {
    return isValidObjectId(value) ? value : null;
  }
  
  if (typeof value === 'object') {
    const id = value._id || value.id || value.userId;
    if (id && typeof id === 'string') {
      return isValidObjectId(id) ? id : null;
    }
  }
  
  return null;
};

/**
 * Clean and validate user ID for API calls
 * @param {string|object} user - User object or user ID
 * @returns {string} - Valid user ID
 * @throws {Error} - If user ID is invalid
 */
export const getUserId = (user) => {
  const id = extractObjectId(user);
  
  if (!id) {
    throw new Error('Invalid user ID');
  }
  
  return id;
};

export default {
  isValidObjectId,
  validateObjectId,
  extractObjectId,
  getUserId
};
