// Legacy export for backward compatibility
// Data is now loaded from /data/fuels.json
export const FUEL_TYPES = null; // Will be loaded dynamically

/**
 * Get compatible fuels for a given smelting temperature
 * @param {string|number} smeltTemp - Smelting temperature in Celsius (e.g., "1084°C" or 1084)
 * @param {Object} fuelTypes - Fuel definitions object
 * @returns {Array} Array of compatible fuel objects
 */
export function getCompatibleFuels(smeltTemp, fuelTypes = {}) {
  const tempValue = parseInt(smeltTemp);
  return Object.values(fuelTypes)
    .filter(fuel => fuel.temp >= tempValue)
    .sort((a, b) => a.temp - b.temp); // Sort by temperature, lowest first
}

/**
 * Format fuel list as a readable string
 * @param {Array} fuels - Array of fuel objects
 * @returns {string} Formatted fuel names
 */
export function formatFuelList(fuels) {
  if (!fuels || fuels.length === 0) return "None (requires bloomery)";
  return fuels.map(f => f.name).join(", ");
}