import { NUGGETS_PER_INGOT, UNITS_PER_NUGGET } from "../constants";
import type {
  AlloyAllocationResult,
  AlloyPartConstraint,
  PureAllocationResult
} from "./types";

type NuggetBounds = {
  minNuggets: number;
  maxNuggets: number;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const normalizeTargetPercents = (parts: AlloyPartConstraint[]) => {
  const rawTargets = parts.map((part) => {
    const midpoint = (part.min + part.max) / 2;
    const preferred = Number.isFinite(part.pct) ? part.pct ?? midpoint : midpoint;
    return clamp(preferred, part.min, part.max);
  });

  const total = rawTargets.reduce((sum, value) => sum + value, 0);
  if (total <= 0) {
    return rawTargets.map(() => 100 / Math.max(parts.length, 1));
  }

  return rawTargets.map((value) => (value / total) * 100);
};

const buildBounds = (totalNuggets: number, parts: AlloyPartConstraint[]): NuggetBounds[] =>
  parts.map((part) => ({
    minNuggets: Math.ceil((totalNuggets * part.min) / 100),
    maxNuggets: Math.floor((totalNuggets * part.max) / 100)
  }));

const isFeasibleTotal = (totalNuggets: number, bounds: NuggetBounds[]) => {
  const minSum = bounds.reduce((sum, bound) => sum + bound.minNuggets, 0);
  const maxSum = bounds.reduce((sum, bound) => sum + bound.maxNuggets, 0);
  return minSum <= totalNuggets && totalNuggets <= maxSum;
};

const findFeasibleTotalNuggets = (
  requiredNuggets: number,
  parts: AlloyPartConstraint[],
  step = 1
) => {
  const maxAttempts = 5000;
  const safeStep = Math.max(1, Math.floor(step));
  let totalNuggets = Math.max(0, requiredNuggets);
  if (safeStep > 1) {
    totalNuggets = Math.ceil(totalNuggets / safeStep) * safeStep;
  }

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const bounds = buildBounds(totalNuggets, parts);
    if (isFeasibleTotal(totalNuggets, bounds)) {
      return totalNuggets;
    }
    totalNuggets += safeStep;
  }

  throw new Error("Unable to find feasible alloy nugget total within search range.");
};

const allocateWithinBounds = (
  totalNuggets: number,
  bounds: NuggetBounds[],
  targetPercents: number[]
) => {
  const allocation = bounds.map((bound) => bound.minNuggets);
  let remaining = totalNuggets - allocation.reduce((sum, value) => sum + value, 0);

  while (remaining > 0) {
    let bestIdx = -1;
    let bestImprovement = Number.NEGATIVE_INFINITY;
    let bestGap = Number.NEGATIVE_INFINITY;

    for (let idx = 0; idx < allocation.length; idx += 1) {
      const current = allocation[idx];
      const bound = bounds[idx];
      const targetPct = targetPercents[idx];
      if (!bound || targetPct === undefined || current === undefined) continue;
      if (current >= bound.maxNuggets) continue;

      const ideal = (totalNuggets * targetPct) / 100;
      const currentError = Math.abs(current - ideal);
      const nextError = Math.abs(current + 1 - ideal);
      const improvement = currentError - nextError;
      const gap = ideal - current;

      if (
        improvement > bestImprovement ||
        (improvement === bestImprovement && gap > bestGap) ||
        (improvement === bestImprovement && gap === bestGap && idx < bestIdx)
      ) {
        bestIdx = idx;
        bestImprovement = improvement;
        bestGap = gap;
      }
    }

    if (bestIdx === -1) break;
    allocation[bestIdx] = (allocation[bestIdx] ?? 0) + 1;
    remaining -= 1;
  }

  if (remaining > 0) {
    for (let idx = 0; idx < allocation.length && remaining > 0; idx += 1) {
      const current = allocation[idx];
      const bound = bounds[idx];
      if (!bound || current === undefined) continue;
      const room = bound.maxNuggets - current;
      if (room <= 0) continue;
      const add = Math.min(room, remaining);
      allocation[idx] = current + add;
      remaining -= add;
    }
  }

  return allocation;
};

export const calculatePureMetalAllocation = (
  requiredUnits: number,
  metal: string,
  color?: string
): PureAllocationResult => {
  const safeUnits = Math.max(0, Number.isFinite(requiredUnits) ? requiredUnits : 0);
  const requiredNuggets = Math.ceil(safeUnits / UNITS_PER_NUGGET);
  const producedUnits = requiredNuggets * UNITS_PER_NUGGET;

  return {
    requiredUnits: safeUnits,
    requiredNuggets,
    producedUnits,
    overageUnits: producedUnits - safeUnits,
    metals: [
      {
        metal,
        color,
        nuggets: requiredNuggets,
        units: producedUnits
      }
    ]
  };
};

export const calculateAlloyAllocation = (
  requiredUnits: number,
  parts: AlloyPartConstraint[]
): AlloyAllocationResult => {
  const safeUnits = Math.max(0, Number.isFinite(requiredUnits) ? requiredUnits : 0);
  if (!parts.length) {
    return {
      requiredUnits: safeUnits,
      totalNuggets: 0,
      producedUnits: 0,
      overageUnits: -safeUnits,
      parts: []
    };
  }

  const requiredNuggets = Math.ceil(safeUnits / UNITS_PER_NUGGET);
  if (requiredNuggets === 0) {
    return {
      requiredUnits: safeUnits,
      totalNuggets: 0,
      producedUnits: 0,
      overageUnits: -safeUnits,
      parts: parts.map((part) => ({
        metal: part.metal,
        color: part.color,
        nuggets: 0,
        units: 0,
        min: part.min,
        max: part.max,
        pctTarget: Number.isFinite(part.pct) ? part.pct ?? 0 : 0,
        pctActual: 0
      }))
    };
  }

  const totalNuggets = findFeasibleTotalNuggets(
    requiredNuggets,
    parts,
    NUGGETS_PER_INGOT
  );
  const bounds = buildBounds(totalNuggets, parts);
  const targetPercents = normalizeTargetPercents(parts);
  const allocation = allocateWithinBounds(totalNuggets, bounds, targetPercents);
  const producedUnits = totalNuggets * UNITS_PER_NUGGET;

  return {
    requiredUnits: safeUnits,
    totalNuggets,
    producedUnits,
    overageUnits: producedUnits - safeUnits,
    parts: parts.map((part, idx) => {
      const nuggets = allocation[idx] ?? 0;
      const targetPct = targetPercents[idx] ?? 0;
      return {
        metal: part.metal,
        color: part.color,
        nuggets,
        units: nuggets * UNITS_PER_NUGGET,
        min: part.min,
        max: part.max,
        pctTarget: targetPct,
        pctActual: totalNuggets > 0 ? (nuggets / totalNuggets) * 100 : 0
      };
    })
  };
};
