import { derived, writable } from "svelte/store";
import metalDefinitionsRaw from "../data/metals.json";
import {
  NUGGETS_PER_INGOT,
  formatTemperature,
  getMetalColor
} from "../lib/constants";
import { calculateNuggets } from "../lib/calculations";
import { computeStackPlan } from "../lib/stack-plan";
import { formatFuelList, getCompatibleFuels } from "../lib/fuels";
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
      stackPlan: computeStackPlan([])
    };
  }

  const metalColor = definition.color || getMetalColor(state.selectedMetal || definition.name);
  const nuggetsNeeded = calculateNuggets(state.targetIngots, NUGGETS_PER_INGOT);
  const compatibleFuels = formatFuelList(getCompatibleFuels(definition.smeltTemp));
  const stackInputs = nuggetsNeeded
    ? [{ metal: definition.name, color: metalColor, nuggets: nuggetsNeeded }]
    : [];

  return {
    metalName: definition.name,
    metalColor,
    smeltTemp: formatTemperature(definition.smeltTemp),
    compatibleFuels,
    oreSources: definition.ores.join(", "),
    nuggetsNeeded,
    hasStackInputs: stackInputs.length > 0,
    stackPlan: computeStackPlan(stackInputs)
  };
});
