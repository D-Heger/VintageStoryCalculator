import type { Calculation } from "../types";

export type ProcessView = NonNullable<Calculation["processes"]>[number];

export type StackPlanView = {
  processes?: ProcessView[];
  totalStacks?: number;
  requiresMultipleProcesses?: boolean;
};

export const getStackNote = (
  hasStackInputs: boolean,
  stackPlan: StackPlanView
): string => {
  if (!hasStackInputs) {
    return "Enter ingots to see stack layout.";
  }

  const processCount = stackPlan.processes?.length || (stackPlan.totalStacks ? 1 : 0);
  return stackPlan.requiresMultipleProcesses
    ? `${processCount} smelting batches needed (4-stack limit).`
    : "Fits in one smelting batch (4-stack limit).";
};

export const getProcessLine = (
  process: ProcessView,
  formatQuantity: (value: number) => string
): string => {
  const nuggets = process.nuggetsTotal ?? process.stacks.reduce((sum, stack) => sum + stack.amount, 0);
  const units = process.unitsTotal ?? nuggets * 5;
  const ingots = process.ingotsTotal ?? nuggets / 20;
  return `${formatQuantity(units)} units • ${ingots.toFixed(2).replace(/\.00$/, "")} ingots`;
};

export const getProcessStepLabel = (process: ProcessView): string =>
  process.isIngotStepValid === false ? "Off 100-unit step" : "100-unit step";
