/**
 * Utility functions for handling data operations
 */

/**
 * Safely parse JSON data from a string
 * @param {string} jsonString - JSON string to parse
 * @param {any} defaultValue - Default value to return if parsing fails
 * @returns {any} - Parsed JSON object or default value
 */
export const safeParseJSON = (jsonString, defaultValue = {}) => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return defaultValue;
  }
};

/**
 * Safely stringify JSON data
 * @param {any} data - Data to stringify
 * @param {number} indent - Number of spaces for indentation (pretty print)
 * @returns {string} - JSON string or empty string if stringification fails
 */
export const safeStringifyJSON = (data, indent = 0) => {
  try {
    return JSON.stringify(data, null, indent);
  } catch (error) {
    console.error('Error stringifying data:', error);
    return '';
  }
};

/**
 * Format price with currency symbol
 * @param {number} price - Price value
 * @param {string} symbol - Currency symbol
 * @returns {string} - Formatted price string
 */
export const formatPrice = (price, symbol = '$') => {
  if (price === null || price === undefined || isNaN(price)) {
    return 'N/A';
  }
  return `${symbol}${price.toFixed(2)}`;
};

/**
 * Format large numbers with commas
 * @param {number} num - Number to format
 * @returns {string} - Formatted number string
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined || isNaN(num)) {
    return 'N/A';
  }
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Truncate text to a specific length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} - Truncated text with ellipsis if needed
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Get a timestamp-based filename
 * @param {string} prefix - Prefix for the filename
 * @param {string} extension - File extension (without dot)
 * @returns {string} - Generated filename with timestamp
 */
export const getTimestampFilename = (prefix = 'file', extension = 'json') => {
  const timestamp = new Date().getTime();
  return `${prefix}_${timestamp}.${extension}`;
};
