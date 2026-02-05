import { FUEL_TYPES } from "../src/lib/fuels.ts";

export { FUEL_TYPES };

/**
 * Get compatible fuels for a given smelting temperature
 * @param {number} smeltTemp - Smelting temperature in Celsius (e.g., 1084)
 * @returns {Array} Array of compatible fuel objects
 */
export function getCompatibleFuels(smeltTemp) {
  const tempValue = parseInt(smeltTemp);
  return Object.values(FUEL_TYPES)
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