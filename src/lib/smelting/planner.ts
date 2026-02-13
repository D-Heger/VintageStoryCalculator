import {
  MAX_STACKS_PER_PROCESS,
  NUGGETS_PER_INGOT,
  STACK_SIZE,
  UNITS_PER_NUGGET
} from "../constants";
import type { Calculation } from "../../types/index";
import type { AlloyPartConstraint, MetalNuggetInput, SmeltingPlannerOptions } from "./types";

type RemainingEntry = {
  metal: string;
  color?: string;
  nuggets: number;
};

type ProcessAllocation = {
  metal: string;
  color?: string;
  nuggets: number;
};

type ConstrainedBound = {
  metal: string;
  minNuggets: number;
  maxNuggets: number;
  targetPct: number;
};

const getRemainingTotal = (entries: RemainingEntry[]) =>
  entries.reduce((sum, entry) => sum + entry.nuggets, 0);

const getTotalStackDemand = (entries: RemainingEntry[]) =>
  entries.reduce((sum, entry) => sum + Math.ceil(entry.nuggets / STACK_SIZE), 0);

const splitIntoStacks = (amount: number) => {
  const stacks: number[] = [];
  const fullStacks = Math.floor(amount / STACK_SIZE);
  for (let i = 0; i < fullStacks; i += 1) {
    stacks.push(STACK_SIZE);
  }
  const remainder = amount % STACK_SIZE;
  if (remainder > 0) {
    stacks.push(remainder);
  }
  return stacks;
};

const isIngotStepValid = (
  nuggets: number,
  minProcessNuggets: number,
  processMultiple: number
) => {
  if (nuggets <= 0) return true;
  if (nuggets < minProcessNuggets) return false;
  if (processMultiple > 1 && nuggets % processMultiple !== 0) return false;
  return true;
};

const buildProcess = (
  stacks: Array<{ metal: string; amount: number; color?: string }>,
  minProcessNuggets: number,
  processMultiple: number
) => {
  const nuggetsTotal = stacks.reduce((sum, stack) => sum + stack.amount, 0);
  return {
    nuggetsTotal,
    unitsTotal: nuggetsTotal * UNITS_PER_NUGGET,
    ingotsTotal: nuggetsTotal / NUGGETS_PER_INGOT,
    isIngotStepValid: isIngotStepValid(
      nuggetsTotal,
      minProcessNuggets,
      processMultiple
    ),
    stacks
  };
};

const getStackCount = (allocations: ProcessAllocation[]) =>
  allocations.reduce((sum, allocation) => {
    if (allocation.nuggets <= 0) return sum;
    return sum + Math.ceil(allocation.nuggets / STACK_SIZE);
  }, 0);

const normalizeTargetPercents = (parts: AlloyPartConstraint[]) => {
  const raw = parts.map((part) => {
    const midpoint = (part.min + part.max) / 2;
    const target = Number.isFinite(part.pct) ? part.pct ?? midpoint : midpoint;
    return Math.min(Math.max(target, part.min), part.max);
  });

  const total = raw.reduce((sum, value) => sum + value, 0);
  if (total <= 0) {
    return raw.map(() => 100 / Math.max(parts.length, 1));
  }

  return raw.map((value) => (value / total) * 100);
};

const allocateByRemainingRatio = (size: number, remaining: RemainingEntry[]) => {
  const total = getRemainingTotal(remaining);
  if (total <= 0 || size <= 0) {
    return remaining.map((entry) => ({ metal: entry.metal, color: entry.color, nuggets: 0 }));
  }

  const exactShares = remaining.map((entry) => (entry.nuggets * size) / total);
  const base = exactShares.map((share, idx) => Math.min(remaining[idx]?.nuggets ?? 0, Math.floor(share)));
  let leftover = size - base.reduce((sum, value) => sum + value, 0);

  const byRemainder = exactShares
    .map((share, idx) => ({ idx, remainder: share - Math.floor(share) }))
    .sort((a, b) => {
      if (b.remainder === a.remainder) return a.idx - b.idx;
      return b.remainder - a.remainder;
    });

  while (leftover > 0) {
    let placed = false;
    for (const entry of byRemainder) {
      const idx = entry.idx;
      if ((base[idx] ?? 0) >= (remaining[idx]?.nuggets ?? 0)) continue;
      base[idx] = (base[idx] ?? 0) + 1;
      leftover -= 1;
      placed = true;
      if (leftover <= 0) break;
    }
    if (!placed) break;
  }

  return remaining.map((entry, idx) => ({
    metal: entry.metal,
    color: entry.color,
    nuggets: base[idx] ?? 0
  }));
};

const buildConstrainedBounds = (
  processNuggets: number,
  remaining: RemainingEntry[],
  alloyParts: AlloyPartConstraint[]
): ConstrainedBound[] => {
  const targetPercents = normalizeTargetPercents(alloyParts);
  return alloyParts.map((part, idx) => {
    const remainingForMetal = remaining.find((entry) => entry.metal === part.metal)?.nuggets ?? 0;
    const minNuggets = Math.ceil((processNuggets * part.min) / 100);
    const maxBound = Math.floor((processNuggets * part.max) / 100);
    return {
      metal: part.metal,
      minNuggets,
      maxNuggets: Math.min(maxBound, remainingForMetal),
      targetPct: targetPercents[idx] ?? 0
    };
  });
};

const allocateConstrainedProcess = (
  processNuggets: number,
  remaining: RemainingEntry[],
  alloyParts: AlloyPartConstraint[]
) => {
  const bounds = buildConstrainedBounds(processNuggets, remaining, alloyParts);
  const minSum = bounds.reduce((sum, bound) => sum + bound.minNuggets, 0);
  const maxSum = bounds.reduce((sum, bound) => sum + bound.maxNuggets, 0);

  if (!(minSum <= processNuggets && processNuggets <= maxSum)) {
    return null;
  }

  const allocation = new Map<string, number>();
  bounds.forEach((bound) => {
    allocation.set(bound.metal, bound.minNuggets);
  });

  let remainingToAssign = processNuggets - minSum;
  while (remainingToAssign > 0) {
    let bestMetal: string | null = null;
    let bestImprovement = Number.NEGATIVE_INFINITY;
    let bestGap = Number.NEGATIVE_INFINITY;

    for (const bound of bounds) {
      const current = allocation.get(bound.metal) ?? 0;
      if (current >= bound.maxNuggets) continue;

      const ideal = (processNuggets * bound.targetPct) / 100;
      const currentError = Math.abs(current - ideal);
      const nextError = Math.abs(current + 1 - ideal);
      const improvement = currentError - nextError;
      const gap = ideal - current;

      if (
        improvement > bestImprovement ||
        (improvement === bestImprovement && gap > bestGap)
      ) {
        bestMetal = bound.metal;
        bestImprovement = improvement;
        bestGap = gap;
      }
    }

    if (!bestMetal) break;
    allocation.set(bestMetal, (allocation.get(bestMetal) ?? 0) + 1);
    remainingToAssign -= 1;
  }

  if (remainingToAssign > 0) {
    for (const bound of bounds) {
      if (remainingToAssign <= 0) break;
      const current = allocation.get(bound.metal) ?? 0;
      const room = bound.maxNuggets - current;
      if (room <= 0) continue;
      const add = Math.min(room, remainingToAssign);
      allocation.set(bound.metal, current + add);
      remainingToAssign -= add;
    }
  }

  if (remainingToAssign > 0) {
    return null;
  }

  const allocations = remaining
    .map((entry) => ({
      metal: entry.metal,
      color: entry.color,
      nuggets: allocation.get(entry.metal) ?? 0
    }))
    .filter((entry) => entry.nuggets > 0);

  if (allocations.reduce((sum, entry) => sum + entry.nuggets, 0) !== processNuggets) {
    return null;
  }

  return allocations;
};

const chooseProcessAllocation = (
  remaining: RemainingEntry[],
  options: SmeltingPlannerOptions
): ProcessAllocation[] | null => {
  const totalRemaining = getRemainingTotal(remaining);
  if (totalRemaining <= 0) return null;

  const minProcess = Math.max(1, options.enforceMinProcessNuggets ?? 1);
  const processMultiple = Math.max(1, options.enforceProcessMultipleNuggets ?? 1);
  let startSize = Math.min(totalRemaining, STACK_SIZE * MAX_STACKS_PER_PROCESS);

  if (totalRemaining > startSize) {
    const leftover = totalRemaining - startSize;
    if (leftover > 0 && leftover < minProcess) {
      startSize = Math.max(minProcess, startSize - (minProcess - leftover));
    }
  }

  for (let size = startSize; size > 0; size -= 1) {
    if (processMultiple > 1 && size % processMultiple !== 0) continue;
    const leftover = totalRemaining - size;
    if (leftover > 0 && leftover < minProcess) continue;
    if (
      processMultiple > 1 &&
      leftover > 0 &&
      leftover % processMultiple !== 0
    ) {
      continue;
    }

    const allocation = options.alloyParts?.length
      ? allocateConstrainedProcess(size, remaining, options.alloyParts)
      : allocateByRemainingRatio(size, remaining).filter((entry) => entry.nuggets > 0);

    if (!allocation || !allocation.some((entry) => entry.nuggets > 0)) {
      continue;
    }

    if (getStackCount(allocation) <= MAX_STACKS_PER_PROCESS) {
      return allocation;
    }
  }

  return null;
};

const buildBalancedSizes = (
  totalNuggets: number,
  processCount: number,
  processMultiple: number
) => {
  if (processCount <= 0 || totalNuggets <= 0) return null;

  if (processMultiple > 1) {
    if (totalNuggets % processMultiple !== 0) return null;
    const totalSteps = totalNuggets / processMultiple;
    if (totalSteps < processCount) return null;
    const baseSteps = Math.floor(totalSteps / processCount);
    const remainderSteps = totalSteps % processCount;
    return Array.from({ length: processCount }, (_, idx) =>
      (baseSteps + (idx < remainderSteps ? 1 : 0)) * processMultiple
    );
  }

  const base = Math.floor(totalNuggets / processCount);
  const remainder = totalNuggets % processCount;
  if (base === 0) return null;
  return Array.from({ length: processCount }, (_, idx) =>
    base + (idx < remainder ? 1 : 0)
  );
};

const allocateExactProcessSize = (
  processNuggets: number,
  remaining: RemainingEntry[],
  options: SmeltingPlannerOptions
) => {
  if (processNuggets <= 0) return null;

  const allocation = options.alloyParts?.length
    ? allocateConstrainedProcess(processNuggets, remaining, options.alloyParts)
    : allocateByRemainingRatio(processNuggets, remaining).filter((entry) => entry.nuggets > 0);

  if (!allocation) return null;
  if (allocation.reduce((sum, entry) => sum + entry.nuggets, 0) !== processNuggets) return null;
  if (getStackCount(allocation) > MAX_STACKS_PER_PROCESS) return null;
  return allocation;
};

const subtractAllocation = (remaining: RemainingEntry[], allocation: ProcessAllocation[]) => {
  allocation.forEach((entry) => {
    const remainingEntry = remaining.find((item) => item.metal === entry.metal);
    if (remainingEntry) {
      remainingEntry.nuggets = Math.max(0, remainingEntry.nuggets - entry.nuggets);
    }
  });
};

const tryBalancedPlan = (
  baseRemaining: RemainingEntry[],
  options: SmeltingPlannerOptions
): Array<ProcessAllocation[]> | null => {
  const totalNuggets = getRemainingTotal(baseRemaining);
  if (totalNuggets <= 0) return [];

  const minProcessNuggets = Math.max(1, options.enforceMinProcessNuggets ?? 1);
  const processMultiple = Math.max(1, options.enforceProcessMultipleNuggets ?? 1);
  const maxProcessCount = Math.max(1, Math.floor(totalNuggets / minProcessNuggets));

  const minByCapacity = Math.ceil(totalNuggets / (STACK_SIZE * MAX_STACKS_PER_PROCESS));
  const minByStacks = Math.ceil(getTotalStackDemand(baseRemaining) / MAX_STACKS_PER_PROCESS);
  const startProcessCount = Math.max(1, minByCapacity, minByStacks);

  for (
    let processCount = startProcessCount;
    processCount <= maxProcessCount;
    processCount += 1
  ) {
    const sizes = buildBalancedSizes(totalNuggets, processCount, processMultiple);
    if (!sizes) continue;
    if (sizes.some((size) => size > STACK_SIZE * MAX_STACKS_PER_PROCESS)) continue;
    if (sizes.some((size) => size < minProcessNuggets)) continue;

    const remaining = baseRemaining.map((entry) => ({ ...entry }));
    const allocations: Array<ProcessAllocation[]> = [];
    let failed = false;

    for (const size of sizes) {
      const allocation = allocateExactProcessSize(size, remaining, options);
      if (!allocation) {
        failed = true;
        break;
      }
      allocations.push(allocation);
      subtractAllocation(remaining, allocation);
    }

    if (!failed && getRemainingTotal(remaining) === 0) {
      return allocations;
    }
  }

  return null;
};

export const buildSmeltingProcessPlan = (
  metalInputs: MetalNuggetInput[],
  options: SmeltingPlannerOptions = {}
): Calculation => {
  const remaining: RemainingEntry[] = metalInputs
    .map((entry) => ({
      metal: entry.metal,
      color: entry.color,
      nuggets: Math.max(0, Math.floor(entry.nuggets))
    }))
    .filter((entry) => entry.nuggets > 0);

  const minProcessNuggets = Math.max(1, options.enforceMinProcessNuggets ?? 1);
  const processMultiple = Math.max(1, options.enforceProcessMultipleNuggets ?? 1);
  const processes: NonNullable<Calculation["processes"]> = [];
  let totalStacks = 0;

  const shouldBalance = options.balanceProcesses ?? true;
  if (shouldBalance) {
    const balancedAllocations = tryBalancedPlan(remaining, options);
    if (balancedAllocations) {
      balancedAllocations.forEach((allocation) => {
        const stacks: Array<{ metal: string; amount: number; color?: string }> = [];
        allocation.forEach((entry) => {
          splitIntoStacks(entry.nuggets).forEach((stackAmount) => {
            stacks.push({
              metal: entry.metal,
              amount: stackAmount,
              color: entry.color
            });
          });
        });
        totalStacks += stacks.length;
        processes.push(buildProcess(stacks, minProcessNuggets, processMultiple));
      });

      return {
        totalStacks,
        processes,
        requiresMultipleProcesses: processes.length > 1
      };
    }
  }

  while (getRemainingTotal(remaining) > 0) {
    const allocation = chooseProcessAllocation(remaining, options);
    if (!allocation) break;

    const stacks: Array<{ metal: string; amount: number; color?: string }> = [];
    allocation.forEach((entry) => {
      splitIntoStacks(entry.nuggets).forEach((stackAmount) => {
        stacks.push({
          metal: entry.metal,
          amount: stackAmount,
          color: entry.color
        });
      });

      const remainingEntry = remaining.find((item) => item.metal === entry.metal);
      if (remainingEntry) {
        remainingEntry.nuggets = Math.max(0, remainingEntry.nuggets - entry.nuggets);
      }
    });

    totalStacks += stacks.length;
    processes.push(buildProcess(stacks, minProcessNuggets, processMultiple));
  }

  return {
    totalStacks,
    processes,
    requiresMultipleProcesses: processes.length > 1
  };
};
