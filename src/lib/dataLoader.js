/**
 * Data loader module for fetching game data from JSON files
 */

const DATA_BASE_PATH = '/data';

/**
 * Cache for loaded data to avoid multiple fetches
 */
const dataCache = new Map();

/**
 * Generic function to load JSON data
 * @param {string} filename - Name of the JSON file (e.g., 'metals.json')
 * @returns {Promise<Object>} Parsed JSON data
 */
async function loadData(filename) {
  // Check cache first
  if (dataCache.has(filename)) {
    return dataCache.get(filename);
  }

  try {
    const response = await fetch(`${DATA_BASE_PATH}/${filename}`);
    if (!response.ok) {
      throw new Error(`Failed to load ${filename}: ${response.statusText}`);
    }
    const data = await response.json();
    dataCache.set(filename, data);
    return data;
  } catch (error) {
    console.error(`Error loading ${filename}:`, error);
    throw error;
  }
}

/**
 * Load metal definitions
 * @returns {Promise<Object>} Metal definitions
 */
export async function loadMetals() {
  return loadData('metals.json');
}

/**
 * Load alloy definitions
 * @returns {Promise<Object>} Alloy definitions
 */
export async function loadAlloys() {
  return loadData('alloys.json');
}

/**
 * Load fuel definitions
 * @returns {Promise<Object>} Fuel definitions
 */
export async function loadFuels() {
  return loadData('fuels.json');
}

/**
 * Load theme definitions
 * @returns {Promise<Object>} Theme definitions
 */
export async function loadThemes() {
  return loadData('themes.json');
}

/**
 * Load all game data at once
 * @returns {Promise<Object>} Object containing all game data
 */
export async function loadAllData() {
  const [metals, alloys, fuels, themes] = await Promise.all([
    loadMetals(),
    loadAlloys(),
    loadFuels(),
    loadThemes()
  ]);

  return { metals, alloys, fuels, themes };
}

/**
 * Clear the data cache (useful for testing or hot-reloading)
 */
export function clearCache() {
  dataCache.clear();
}
