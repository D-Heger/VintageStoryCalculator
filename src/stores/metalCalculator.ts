import { derived, writable } from "svelte/store";
import metalDefinitionsRaw from "../data/metals.json";
import {
  NUGGETS_PER_INGOT,
  UNITS_PER_INGOT,
  formatTemperature,
  getMetalColor
} from "../lib/constants";
import { computeIngotStackPlan } from "../lib/stack-plan";
import { formatFuelList, getCompatibleFuels } from "../lib/fuels";
import { calculatePureMetalAllocation } from "../lib/smelting";
import type { CalculationMode, Metal } from "../types/index";

const DEFAULT_NEED_VALUE = 10;
const DEFAULT_HAVE_VALUE = 100;

export type MetalCalculatorState = {
  selectedMetal: string;
  mode: CalculationMode;
  inputValue: number;
};

const METAL_DEFINITIONS = metalDefinitionsRaw as Record<string, Metal>;

const getMetalDefinition = (key: string) => METAL_DEFINITIONS[key];

const initializeState = (): MetalCalculatorState => {
  const metalKeys = Object.keys(METAL_DEFINITIONS);
  return {
    selectedMetal: metalKeys[0] ?? "",
    mode: "need",
    inputValue: DEFAULT_NEED_VALUE
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

export const setMode = (mode: CalculationMode) => {
  metalCalculator.update((state) => {
    if (state.mode === mode) return state;
    return {
      ...state,
      mode,
      inputValue: mode === "need" ? DEFAULT_NEED_VALUE : DEFAULT_HAVE_VALUE
    };
  });
};

export const setInputValue = (value: number | null) => {
  const safe = Math.max(0, Number(value) || 0);
  metalCalculator.update((state) => ({
    ...state,
    inputValue: safe
  }));
};

export const applyState = (partial: Partial<MetalCalculatorState>) => {
  metalCalculator.update((state) => {
    const next = { ...state };

    if (partial.selectedMetal !== undefined) {
      const def = getMetalDefinition(partial.selectedMetal);
      if (def) {
        next.selectedMetal = partial.selectedMetal;
      }
    }

    if (partial.mode !== undefined) {
      next.mode = partial.mode;
    }

    if (partial.inputValue !== undefined) {
      next.inputValue = Math.max(0, Number(partial.inputValue) || 0);
    }

    return next;
  });
};

export const metalCalculation = derived(metalCalculator, (state) => {
  const definition = getMetalDefinition(state.selectedMetal);
  const emptyResult = {
    mode: state.mode,
    metalName: "",
    metalColor: "#ccc",
    smeltTemp: formatTemperature(undefined),
    compatibleFuels: formatFuelList(undefined),
    oreSources: "-",
    nuggetsNeeded: 0,
    producedIngots: 0,
    remainderNuggets: 0,
    hasStackInputs: false,
    stackPlan: computeIngotStackPlan([])
  };

  if (!definition) return emptyResult;

  const metalColor = definition.color || getMetalColor(state.selectedMetal || definition.name);
  const compatibleFuels = formatFuelList(getCompatibleFuels(definition.smeltTemp));

  if (state.mode === "have") {
    const available = Math.max(0, Math.floor(state.inputValue));
    const producedIngots = Math.floor(available / NUGGETS_PER_INGOT);
    const remainderNuggets = available % NUGGETS_PER_INGOT;
    const stackInputs = available > 0
      ? [{ metal: definition.name, color: metalColor, nuggets: available }]
      : [];

    return {
      mode: state.mode,
      metalName: definition.name,
      metalColor,
      smeltTemp: formatTemperature(definition.smeltTemp),
      compatibleFuels,
      oreSources: definition.ores.join(", "),
      nuggetsNeeded: 0,
      producedIngots,
      remainderNuggets,
      hasStackInputs: stackInputs.length > 0,
      stackPlan: computeIngotStackPlan(stackInputs)
    };
  }

  const requiredUnits = Math.max(0, state.inputValue) * UNITS_PER_INGOT;
  const casting = calculatePureMetalAllocation(requiredUnits, definition.name, metalColor);
  const nuggetsNeeded = casting.requiredNuggets;
  const stackInputs = nuggetsNeeded
    ? casting.metals.map((entry) => ({
      metal: entry.metal,
      color: entry.color,
      nuggets: entry.nuggets
    }))
    : [];

  return {
    mode: state.mode,
    metalName: definition.name,
    metalColor,
    smeltTemp: formatTemperature(definition.smeltTemp),
    compatibleFuels,
    oreSources: definition.ores.join(", "),
    nuggetsNeeded,
    producedIngots: 0,
    remainderNuggets: 0,
    hasStackInputs: stackInputs.length > 0,
    stackPlan: computeIngotStackPlan(stackInputs)
  };
});
