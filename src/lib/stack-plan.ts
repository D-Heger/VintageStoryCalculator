import { MAX_STACKS_PER_PROCESS, STACK_SIZE } from "./constants";
import type { Calculation } from "../types/index";

export type StackInput = {
  metal: string;
  color?: string;
  nuggets: number;
};

type StackAllocation = {
  metal: string;
  color?: string;
  amount: number;
};

type StackProcess = {
  stacks: StackAllocation[];
};

const splitIntoStacks = (amount: number) => {
  const stacks: number[] = [];
  const fullStacks = Math.floor(amount / STACK_SIZE);
  for (let i = 0; i < fullStacks; i++) {
    stacks.push(STACK_SIZE);
  }
  const remainder = amount % STACK_SIZE;
  if (remainder > 0) stacks.push(remainder);
  return stacks;
};

const distributeByRatio = (size: number, remaining: StackInput[]) => {
  const total = remaining.reduce((sum, entry) => sum + (entry.nuggets || 0), 0);
  if (total === 0) return remaining.map(() => 0);

  const exactShares = remaining.map((entry) => ((entry.nuggets || 0) * size) / total);
  const base = exactShares.map((share, idx) => {
    const entry = remaining[idx];
    return entry ? Math.min(entry.nuggets, Math.floor(share)) : 0;
  });

  const allocated = base.reduce((sum, value) => sum + value, 0);
  let leftover = Math.min(size, total) - allocated;

  const order = exactShares
    .map((share, idx) => ({ idx, remainder: share - Math.floor(share) }))
    .sort((a, b) => {
      if (b.remainder === a.remainder) return a.idx - b.idx;
      return b.remainder - a.remainder;
    });

  while (leftover > 0) {
    let placed = false;
    for (const orderEntry of order) {
      const idx = orderEntry.idx;
      const entry = remaining[idx];
      if (!entry) continue;
      const baseValue = base[idx] ?? 0;
      if (baseValue >= entry.nuggets) continue;
      base[idx] = baseValue + 1;
      leftover -= 1;
      placed = true;
      if (leftover <= 0) break;
    }
    if (!placed) break;
  }

  if (leftover > 0) {
    for (let i = 0; i < remaining.length && leftover > 0; i++) {
      const entry = remaining[i];
      if (!entry) continue;
      const baseValue = base[i] ?? 0;
      const room = entry.nuggets - baseValue;
      if (room <= 0) continue;
      const add = Math.min(room, leftover);
      base[i] = baseValue + add;
      leftover -= add;
    }
  }

  return base;
};

const allocateProcess = (remaining: StackInput[], targetSize: number) => {
  const totalRemaining = remaining.reduce(
    (sum, entry) => sum + (entry.nuggets || 0),
    0
  );
  if (totalRemaining === 0) return remaining.map(() => 0);

  let size = Math.min(targetSize, totalRemaining);
  while (size > 0) {
    const allocation = distributeByRatio(size, remaining);
    const stackCount = allocation.reduce((sum, amount) => {
      if (amount <= 0) return sum;
      return sum + Math.ceil(amount / STACK_SIZE);
    }, 0);

    if (stackCount <= MAX_STACKS_PER_PROCESS && allocation.some((v) => v > 0)) {
      return allocation;
    }

    size -= 1;
  }

  const fallback = remaining.map(() => 0);
  let stacksLeft = MAX_STACKS_PER_PROCESS;
  for (let i = 0; i < remaining.length && stacksLeft > 0; i++) {
    const entry = remaining[i];
    if (!entry) continue;
    const cap = Math.min(entry.nuggets, STACK_SIZE);
    if (cap <= 0) continue;
    fallback[i] = cap;
    stacksLeft -= 1;
  }
  return fallback;
};

export const computeStackPlan = (planInputs: StackInput[]): Calculation => {
  const remaining = planInputs.map((entry) => ({ ...entry }));
  const processes: StackProcess[] = [];
  let totalStacks = 0;

  const remainingTotal = () =>
    remaining.reduce((sum, entry) => sum + (entry.nuggets || 0), 0);

  while (remainingTotal() > 0) {
    const targetSize = Math.min(
      remainingTotal(),
      STACK_SIZE * MAX_STACKS_PER_PROCESS
    );

    const processAllocations = allocateProcess(remaining, targetSize);
    if (!processAllocations.some((value) => value > 0)) {
      break;
    }

    const stacks: StackAllocation[] = [];
    processAllocations.forEach((amount, idx) => {
      if (amount <= 0) return;
      const entry = remaining[idx];
      if (!entry) return;
      splitIntoStacks(amount).forEach((chunk) => {
        stacks.push({
          metal: entry.metal,
          color: entry.color,
          amount: chunk
        });
      });
      entry.nuggets = Math.max(0, entry.nuggets - amount);
    });

    totalStacks += stacks.length;
    processes.push({ stacks });
  }

  return {
    totalStacks,
    processes,
    requiresMultipleProcesses: processes.length > 1
  };
};
