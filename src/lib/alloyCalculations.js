/**
 * Core calculation module for alloy recipes
 * Separated from DOM manipulation for better testability and performance
 */

import Decimal from 'decimal.js';

// Configure Decimal.js for precise calculations
Decimal.set({ precision: 10, rounding: Decimal.ROUND_HALF_UP });

/**
 * Calculate precise alloy composition with proper rounding
 * @param {Array} parts - Array of {metal, min, max, pct} objects
 * @param {number} targetIngots - Number of ingots to produce
 * @param {Object} constants - Game constants
 * @returns {Object} Calculation results
 */
export function calculateAlloyComposition(parts, targetIngots, constants) {
  const { UNITS_PER_INGOT, UNITS_PER_PIECE } = constants;
  
  const totalUnits = targetIngots * UNITS_PER_INGOT;
  const totalNuggets = Math.round(totalUnits / UNITS_PER_PIECE);
  
  if (totalNuggets === 0) {
    return {
      totalUnits,
      totalNuggets,
      parts: parts.map(p => ({ ...p, nuggets: 0, units: 0 }))
    };
  }
  
  // Use Decimal for precise percentage calculations
  const allocations = parts.map((part, idx) => {
    const exactNuggets = new Decimal(totalNuggets)
      .mul(part.pct)
      .div(100);
    
    return {
      idx,
      metal: part.metal,
      pct: part.pct,
      exactNuggets: exactNuggets.toNumber(),
      baseNuggets: exactNuggets.floor().toNumber(),
      remainder: exactNuggets.mod(1).toNumber()
    };
  });
  
  // Distribute remaining nuggets using largest remainder method
  const distributed = distributeLargestRemainder(allocations, totalNuggets);
  
  return {
    totalUnits,
    totalNuggets,
    parts: distributed.map(alloc => ({
      metal: alloc.metal,
      pct: alloc.pct,
      nuggets: alloc.nuggets,
      units: alloc.nuggets * UNITS_PER_PIECE
    }))
  };
}

/**
 * Distribute nuggets using largest remainder method
 * Ensures exact total and minimizes rounding errors
 */
function distributeLargestRemainder(allocations, targetTotal) {
  let assigned = allocations.reduce((sum, a) => sum + a.baseNuggets, 0);
  let remaining = targetTotal - assigned;
  
  // Sort by remainder descending, use index as tiebreaker
  const sorted = [...allocations]
    .map((a, idx) => ({ ...a, originalIdx: idx }))
    .sort((a, b) => {
      const diff = b.remainder - a.remainder;
      return diff !== 0 ? diff : a.originalIdx - b.originalIdx;
    });
  
  // Assign extra nuggets to highest remainders
  const result = allocations.map(a => ({ ...a, nuggets: a.baseNuggets }));
  
  for (let i = 0; i < sorted.length && remaining > 0; i++) {
    const idx = sorted[i].idx;
    result[idx].nuggets++;
    remaining--;
  }
  
  // Handle negative remaining (shouldn't happen with proper rounding)
  for (let i = sorted.length - 1; i >= 0 && remaining < 0; i--) {
    const idx = sorted[i].idx;
    if (result[idx].nuggets > 0) {
      result[idx].nuggets--;
      remaining++;
    }
  }
  
  return result;
}

/**
 * Normalize percentages to sum to exactly 100%
 * Uses Decimal for precision
 */
export function normalizePercentages(parts) {
  if (!parts.length) return parts;
  
  const total = parts.reduce((sum, p) => sum + p.pct, 0);
  
  if (total === 0) {
    // Equal distribution
    const share = new Decimal(100).div(parts.length);
    return parts.map(p => ({
      ...p,
      pct: Math.min(Math.max(share.toNumber(), p.min), p.max)
    }));
  }
  
  // Scale to 100%
  const scale = new Decimal(100).div(total);
  let normalized = parts.map(p => {
    const scaled = new Decimal(p.pct).mul(scale);
    return {
      ...p,
      pct: Math.min(Math.max(scaled.toNumber(), p.min), p.max)
    };
  });
  
  // Fine-tune to exactly 100% using smallest adjustment
  const finalTotal = normalized.reduce((sum, p) => sum + p.pct, 0);
  const diff = new Decimal(100).minus(finalTotal);
  
  if (Math.abs(diff.toNumber()) > 0.001) {
    // Find part with most adjustment room
    const adjustIdx = diff.greaterThan(0)
      ? normalized.findIndex(p => p.pct < p.max)
      : normalized.findIndex(p => p.pct > p.min);
    
    if (adjustIdx !== -1) {
      const adjusted = new Decimal(normalized[adjustIdx].pct).plus(diff);
      normalized[adjustIdx].pct = Math.min(
        Math.max(adjusted.toNumber(), normalized[adjustIdx].min),
        normalized[adjustIdx].max
      );
    }
  }
  
  return normalized;
}

/**
 * Rebalance percentages when one changes
 * Maintains valid ranges and sums to 100%
 */
export function rebalancePercentages(parts, changedIndex, newValue) {
  const result = [...parts];
  result[changedIndex] = {
    ...result[changedIndex],
    pct: Math.min(Math.max(newValue, result[changedIndex].min), result[changedIndex].max)
  };
  
  const currentTotal = result.reduce((sum, p) => sum + p.pct, 0);
  const diff = new Decimal(100).minus(currentTotal);
  
  if (Math.abs(diff.toNumber()) < 0.001) {
    return result;
  }
  
  // Distribute difference to other parts proportionally
  const others = result
    .map((p, idx) => ({ ...p, idx }))
    .filter(p => p.idx !== changedIndex);
  
  const othersTotal = others.reduce((sum, p) => sum + p.pct, 0);
  
  if (othersTotal === 0) return result;
  
  // Proportional adjustment
  others.forEach(other => {
    const proportion = new Decimal(other.pct).div(othersTotal);
    const adjustment = diff.mul(proportion);
    const newPct = new Decimal(result[other.idx].pct).plus(adjustment);
    
    result[other.idx].pct = Math.min(
      Math.max(newPct.toNumber(), result[other.idx].min),
      result[other.idx].max
    );
  });
  
  // Final normalization
  return normalizePercentages(result);
}

/**
 * Calculate stack distribution for smelting
 * Optimizes for fewest processes while respecting 4-stack limit
 */
export function calculateStackDistribution(nuggetsByMetal, constants) {
  const { STACK_SIZE, MAX_STACKS_PER_PROCESS } = constants;
  
  const processes = [];
  const remaining = nuggetsByMetal.map(m => ({ ...m }));
  
  while (remaining.some(m => m.nuggets > 0)) {
    const process = allocateSingleProcess(remaining, STACK_SIZE, MAX_STACKS_PER_PROCESS);
    
    if (process.stacks.length === 0) break;
    
    processes.push(process);
    
    // Update remaining
    process.stacks.forEach(stack => {
      const metalIdx = remaining.findIndex(m => m.metal === stack.metal);
      if (metalIdx !== -1) {
        remaining[metalIdx].nuggets -= stack.amount;
      }
    });
  }
  
  const totalStacks = processes.reduce((sum, p) => sum + p.stacks.length, 0);
  
  return {
    processes,
    totalStacks,
    requiresMultipleProcesses: processes.length > 1
  };
}

/**
 * Allocate nuggets for a single smelting process
 */
function allocateSingleProcess(remaining, stackSize, maxStacks) {
  const stacks = [];
  let stacksUsed = 0;
  
  for (const metal of remaining) {
    if (stacksUsed >= maxStacks || metal.nuggets <= 0) continue;
    
    let nuggets = metal.nuggets;
    
    while (nuggets > 0 && stacksUsed < maxStacks) {
      const amount = Math.min(nuggets, stackSize);
      stacks.push({
        metal: metal.metal,
        color: metal.color,
        amount
      });
      nuggets -= amount;
      stacksUsed++;
    }
    
    // If we can't fit all of this metal, stop here for this process
    if (nuggets > 0) break;
  }
  
  return { stacks };
}

/**
 * Memoization helper for expensive calculations
 */
export class CalculationCache {
  constructor(maxSize = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }
  
  get(key) {
    return this.cache.get(key);
  }
  
  set(key, value) {
    if (this.cache.size >= this.maxSize) {
      // Remove oldest entry
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }
  
  clear() {
    this.cache.clear();
  }
  
  static createKey(...args) {
    return JSON.stringify(args);
  }
}
