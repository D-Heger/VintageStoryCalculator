export const FUEL_TYPES = { //TODO expand by wooden items and other burnables
  firewood: {
    name: "Firewood",
    temp: 700,
    duration: 24,
  },
  peat: {
    name: "Peat",
    temp: 900,
    duration: 25,
  },
  brown_coal: {
    name: "Brown coal",
    temp: 1100,
    duration: 77,
  },
  black_coal: {
    name: "Black coal",
    temp: 1200,
    duration: 84,
  },
  anthracite: {
    name: "Anthracite",
    temp: 1200,
    duration: 196,
  },
  charcoal: {
    name: "Charcoal",
    temp: 1300,
    duration: 40,
  },
  coke: {
    name: "Coke",
    temp: 1340,
    duration: 40,
  },
};

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