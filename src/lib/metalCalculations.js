/**
 * Core calculation module for metal casting
 * Separated from DOM manipulation for better testability and performance
 */

import Decimal from 'decimal.js';

// Configure Decimal.js for precise calculations
Decimal.set({ precision: 10, rounding: Decimal.ROUND_HALF_UP });

/**
 * Calculate nuggets needed for metal casting
 * @param {number} targetIngots - Number of ingots to produce
 * @param {Object} constants - Game constants
 * @returns {Object} Calculation results
 */
export function calculateMetalCasting(targetIngots, constants) {
  const { UNITS_PER_INGOT, UNITS_PER_NUGGET, NUGGETS_PER_INGOT } = constants;
  
  const totalUnits = new Decimal(targetIngots).mul(UNITS_PER_INGOT);
  const nuggetsNeeded = new Decimal(targetIngots).mul(NUGGETS_PER_INGOT);
  
  return {
    targetIngots,
    totalUnits: totalUnits.toNumber(),
    nuggetsNeeded: nuggetsNeeded.toNumber()
  };
}

/**
 * Calculate stack distribution for a single metal
 * @param {string} metal - Metal name
 * @param {string} color - Metal color
 * @param {number} nuggets - Total nuggets needed
 * @param {Object} constants - Game constants
 * @returns {Object} Stack distribution
 */
export function calculateMetalStacks(metal, color, nuggets, constants) {
  const { STACK_SIZE, MAX_STACKS_PER_PROCESS } = constants;
  
  if (nuggets <= 0) {
    return {
      totalStacks: 0,
      processes: [],
      requiresMultipleProcesses: false
    };
  }
  
  const processes = [];
  let remaining = nuggets;
  
  while (remaining > 0) {
    const stacks = [];
    const processNuggets = Math.min(remaining, STACK_SIZE * MAX_STACKS_PER_PROCESS);
    let allocated = 0;
    
    while (allocated < processNuggets && stacks.length < MAX_STACKS_PER_PROCESS) {
      const stackAmount = Math.min(processNuggets - allocated, STACK_SIZE);
      stacks.push({
        metal,
        color,
        amount: stackAmount
      });
      allocated += stackAmount;
    }
    
    processes.push({ stacks });
    remaining -= allocated;
  }
  
  const totalStacks = processes.reduce((sum, p) => sum + p.stacks.length, 0);
  
  return {
    totalStacks,
    processes,
    requiresMultipleProcesses: processes.length > 1
  };
}

/**
 * Validate and sanitize input values
 */
export function validateInput(value, min = 0, max = Number.MAX_SAFE_INTEGER) {
  const num = Number(value);
  
  if (!Number.isFinite(num) || Number.isNaN(num)) {
    return min;
  }
  
  return Math.max(min, Math.min(max, Math.floor(num)));
}
