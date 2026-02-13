import { buildSmeltingProcessPlan } from "./smelting";
import type { Calculation } from "../types/index";

export type StackInput = {
  metal: string;
  color?: string;
  nuggets: number;
};

export type AlloyStackConstraint = {
  metal: string;
  min: number;
  max: number;
  pct?: number;
  color?: string;
};

export const computeStackPlan = (planInputs: StackInput[]): Calculation => {
  return buildSmeltingProcessPlan(planInputs, {
    balanceProcesses: true
  });
};

export const computeIngotStackPlan = (planInputs: StackInput[]): Calculation => {
  return buildSmeltingProcessPlan(planInputs, {
    enforceMinProcessNuggets: 20,
    enforceProcessMultipleNuggets: 20,
    balanceProcesses: true
  });
};

export const computeAlloyStackPlan = (
  planInputs: StackInput[],
  alloyParts: AlloyStackConstraint[]
): Calculation => {
  return buildSmeltingProcessPlan(planInputs, {
    alloyParts,
    enforceMinProcessNuggets: 20,
    enforceProcessMultipleNuggets: 20,
    balanceProcesses: true
  });
};
