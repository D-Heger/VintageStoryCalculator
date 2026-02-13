import { derived, writable } from "svelte/store";
import metalDefinitionsRaw from "../data/metals.json";
import {
  UNITS_PER_INGOT,
  formatTemperature,
  getMetalColor
} from "../lib/constants";
import { computeIngotStackPlan } from "../lib/stack-plan";
import { formatFuelList, getCompatibleFuels } from "../lib/fuels";
import { calculatePureMetalAllocation } from "../lib/smelting";
import type { Metal } from "../types/index";

export type MetalCalculatorState = {
  selectedMetal: string;
  targetIngots: number;
};

const METAL_DEFINITIONS = metalDefinitionsRaw as Record<string, Metal>;

const getMetalDefinition = (key: string) => METAL_DEFINITIONS[key];

const initializeState = (): MetalCalculatorState => {
  const metalKeys = Object.keys(METAL_DEFINITIONS);
  return {
    selectedMetal: metalKeys[0] ?? "",
    targetIngots: 10
  };
};

export const metalCalculator = writable<MetalCalculatorState>(initializeState());

export const setSelectedMetal = (metalKey: string) => {
  const definition = getMetalDefinition(metalKey);
  if (!definition) return;
  metalCalculator.update((state) => ({
    ...state,
    selectedMetal: metalKey
  }));
};

export const setTargetIngots = (value: number | null) => {
  const target = Math.max(0, Number(value) || 0);
  metalCalculator.update((state) => ({
    ...state,
    targetIngots: target
  }));
};

export const metalCalculation = derived(metalCalculator, (state) => {
  const definition = getMetalDefinition(state.selectedMetal);
  if (!definition) {
    return {
      metalName: "",
      metalColor: "#ccc",
      smeltTemp: formatTemperature(undefined),
      compatibleFuels: formatFuelList(undefined),
      oreSources: "-",
      nuggetsNeeded: 0,
      hasStackInputs: false,
      stackPlan: computeIngotStackPlan([])
    };
  }

  const metalColor = definition.color || getMetalColor(state.selectedMetal || definition.name);
  const requiredUnits = Math.max(0, state.targetIngots) * UNITS_PER_INGOT;
  const casting = calculatePureMetalAllocation(requiredUnits, definition.name, metalColor);
  const nuggetsNeeded = casting.requiredNuggets;
  const compatibleFuels = formatFuelList(getCompatibleFuels(definition.smeltTemp));
  const stackInputs = nuggetsNeeded
    ? casting.metals.map((entry) => ({
      metal: entry.metal,
      color: entry.color,
      nuggets: entry.nuggets
    }))
    : [];

  return {
    metalName: definition.name,
    metalColor,
    smeltTemp: formatTemperature(definition.smeltTemp),
    compatibleFuels,
    oreSources: definition.ores.join(", "),
    nuggetsNeeded,
    hasStackInputs: stackInputs.length > 0,
    stackPlan: computeIngotStackPlan(stackInputs)
  };
});
