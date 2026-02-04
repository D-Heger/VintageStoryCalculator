/**
 * Shared utility functions for calculations
 */

/**
 * Game constants - centralized for easy modification
 */
export const GAME_CONSTANTS = {
  UNITS_PER_INGOT: 100,
  UNITS_PER_PIECE: 5,
  UNITS_PER_NUGGET: 5,
  NUGGETS_PER_INGOT: 20, // 100 / 5
  STACK_SIZE: 128,
  MAX_STACKS_PER_PROCESS: 4
};

/**
 * Clamp value between min and max
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Parse temperature from string format
 * @param {string} temp - Temperature string like "1084°C"
 * @returns {number} Numeric temperature value
 */
export function parseTemperature(temp) {
  if (typeof temp === 'number') return temp;
  const match = String(temp).match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Format number for display
 */
export function formatNumber(value, options = {}) {
  const {
    maximumFractionDigits = 0,
    minimumFractionDigits = 0,
    useGrouping = false
  } = options;
  
  const formatter = new Intl.NumberFormat('en-US', {
    maximumFractionDigits,
    minimumFractionDigits,
    useGrouping
  });
  
  return formatter.format(Number.isFinite(value) ? value : 0);
}

/**
 * Debounce function to limit function calls
 * Improves performance for rapid input changes
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function to limit function call frequency
 * Better for scroll/resize events
 */
export function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Safe array access with default
 */
export function safeGet(array, index, defaultValue = null) {
  return array && array[index] !== undefined ? array[index] : defaultValue;
}

/**
 * Deep clone object (simple implementation for our use case)
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(item => deepClone(item));
  
  const cloned = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
}

/**
 * Compare two objects for shallow equality
 */
export function shallowEqual(obj1, obj2) {
  if (obj1 === obj2) return true;
  if (!obj1 || !obj2) return false;
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  return keys1.every(key => obj1[key] === obj2[key]);
}

/**
 * Generate unique ID for cache keys
 */
let idCounter = 0;
export function generateId(prefix = 'id') {
  return `${prefix}_${++idCounter}_${Date.now()}`;
}

/**
 * Validate percentage value
 */
export function validatePercentage(value, min = 0, max = 100) {
  const num = parseFloat(value);
  if (!Number.isFinite(num) || Number.isNaN(num)) {
    return min;
  }
  return clamp(num, min, max);
}

/**
 * Round to specified precision
 */
export function roundTo(value, precision = 1) {
  const multiplier = Math.pow(10, precision);
  return Math.round(value * multiplier) / multiplier;
}
