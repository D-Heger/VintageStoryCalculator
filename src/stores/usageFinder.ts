import { derived, writable } from "svelte/store";
import alloyDefinitionsRaw from "../data/alloys.json";
import metalDefinitionsRaw from "../data/metals.json";
import {
  NUGGETS_PER_INGOT,
  formatTemperature,
  getMetalColor
} from "../lib/constants";
import { calculateAlloySplitFromNuggets } from "../lib/smelting";
import { computeAlloyStackPlan, computeIngotStackPlan } from "../lib/stack-plan";
import { formatFuelList, getCompatibleFuels } from "../lib/fuels";
import type { Alloy, Calculation, Metal } from "../types/index";

const ALLOY_DEFINITIONS = alloyDefinitionsRaw as Record<string, Alloy>;
const METAL_DEFINITIONS = metalDefinitionsRaw as Record<string, Metal>;
const DEFAULT_NUGGETS = 100;

export type InventoryEntry = {
  metalKey: string;
  nuggets: number;
};

export type UsageFinderState = {
  inventory: InventoryEntry[];
  expandedResults: Set<string>;
};

export type UsageResult = {
  key: string;
  type: "pure" | "alloy";
  name: string;
  ingots: number;
  leftoverNuggets: number;
  smeltTemp: string;
  compatibleFuels: string;
  stackPlan: Calculation;
  hasStackInputs: boolean;
  details: UsageResultDetail[];
};

export type UsageResultDetail = {
  metal: string;
  available: number;
  used: number;
  leftover: number;
};

const initializeState = (): UsageFinderState => ({
  inventory: [],
  expandedResults: new Set()
});

export const usageFinder = writable<UsageFinderState>(initializeState());

/** All metal keys available for selection (both pure and alloy components). */
export const allMetalKeys = Object.keys(METAL_DEFINITIONS);

export const getMetalName = (key: string): string =>
  METAL_DEFINITIONS[key]?.name ?? key;

export const addMetal = (metalKey: string) => {
  usageFinder.update((state) => {
    if (state.inventory.some((e) => e.metalKey === metalKey)) return state;
    return {
      ...state,
      inventory: [...state.inventory, { metalKey, nuggets: DEFAULT_NUGGETS }]
    };
  });
};

export const removeMetal = (metalKey: string) => {
  usageFinder.update((state) => ({
    ...state,
    inventory: state.inventory.filter((e) => e.metalKey !== metalKey)
  }));
};

export const setNuggets = (metalKey: string, value: number) => {
  const safe = Math.max(0, Number(value) || 0);
  usageFinder.update((state) => ({
    ...state,
    inventory: state.inventory.map((e) =>
      e.metalKey === metalKey ? { ...e, nuggets: safe } : e
    )
  }));
};

export const toggleExpanded = (resultKey: string) => {
  usageFinder.update((state) => {
    const next = new Set(state.expandedResults);
    if (next.has(resultKey)) {
      next.delete(resultKey);
    } else {
      next.add(resultKey);
    }
    return { ...state, expandedResults: next };
  });
};

export const applyState = (partial: { inventory?: InventoryEntry[] }) => {
  usageFinder.update((state) => {
    const next = { ...state };
    if (partial.inventory) {
      next.inventory = partial.inventory;
    }
    return next;
  });
};

export const usageFinderResults = derived(usageFinder, (state): UsageResult[] => {
  if (!state.inventory.length) return [];

  const inventoryMap = new Map<string, number>();
  for (const entry of state.inventory) {
    inventoryMap.set(entry.metalKey, entry.nuggets);
  }

  // Map metal names (capitalized) → nuggets for alloy matching
  const nuggetsByName = new Map<string, number>();
  for (const entry of state.inventory) {
    const def = METAL_DEFINITIONS[entry.metalKey];
    if (def) {
      nuggetsByName.set(def.name, entry.nuggets);
    }
  }

  const results: UsageResult[] = [];

  // Pure cast options
  for (const entry of state.inventory) {
    if (entry.nuggets < NUGGETS_PER_INGOT) continue;
    const def = METAL_DEFINITIONS[entry.metalKey];
    if (!def) continue;

    const ingots = Math.floor(entry.nuggets / NUGGETS_PER_INGOT);
    const leftover = entry.nuggets % NUGGETS_PER_INGOT;
    const color = def.color || getMetalColor(entry.metalKey);
    const stackInputs = [{ metal: def.name, color, nuggets: entry.nuggets }];

    results.push({
      key: `pure_${entry.metalKey}`,
      type: "pure",
      name: `${def.name} (pure)`,
      ingots,
      leftoverNuggets: leftover,
      smeltTemp: formatTemperature(def.smeltTemp),
      compatibleFuels: formatFuelList(getCompatibleFuels(def.smeltTemp)),
      stackPlan: computeIngotStackPlan(stackInputs),
      hasStackInputs: true,
      details: [
        {
          metal: def.name,
          available: entry.nuggets,
          used: ingots * NUGGETS_PER_INGOT,
          leftover
        }
      ]
    });
  }

  // Alloy options
  for (const [alloyKey, alloy] of Object.entries(ALLOY_DEFINITIONS)) {
    // Check all required metals are in inventory
    const allPresent = alloy.parts.every((part) => nuggetsByName.has(part.metal));
    if (!allPresent) continue;

    const availableNuggets: Record<string, number> = {};
    for (const part of alloy.parts) {
      availableNuggets[part.metal] = nuggetsByName.get(part.metal) ?? 0;
    }

    // Calculate using midpoint percentages
    const constraints = alloy.parts.map((part) => ({
      metal: part.metal,
      color: part.color || getMetalColor(part.metal),
      min: part.min,
      max: part.max,
      pct: (part.min + part.max) / 2
    }));

    const split = calculateAlloySplitFromNuggets(availableNuggets, constraints);
    if (split.producedIngots <= 0) continue;

    const stackInputs = split.parts
      .filter((p) => p.nuggets > 0)
      .map((p) => ({
        metal: p.metal,
        color: p.color,
        nuggets: p.nuggets
      }));

    const totalLeftover = split.parts.reduce((sum, p) => sum + p.leftover, 0);

    results.push({
      key: `alloy_${alloyKey}`,
      type: "alloy",
      name: alloy.name,
      ingots: split.producedIngots,
      leftoverNuggets: totalLeftover,
      smeltTemp: formatTemperature(alloy.smeltTemp),
      compatibleFuels: alloy.smeltTemp !== undefined
        ? formatFuelList(getCompatibleFuels(alloy.smeltTemp))
        : formatFuelList(undefined),
      stackPlan: computeAlloyStackPlan(stackInputs, constraints),
      hasStackInputs: stackInputs.length > 0,
      details: split.parts.map((p) => ({
        metal: p.metal,
        available: p.available,
        used: p.nuggets,
        leftover: p.leftover
      }))
    });
  }

  // Sort: alloys first (by ingots desc), then pure (by ingots desc)
  results.sort((a, b) => {
    if (a.type !== b.type) return a.type === "alloy" ? -1 : 1;
    return b.ingots - a.ingots;
  });

  return results;
});
