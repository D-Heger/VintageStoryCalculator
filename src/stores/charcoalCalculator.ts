import { derived, writable } from "svelte/store";
import {
  calculateFromDimensions,
  suggestPitDimensions,
  maxPitDimension,
  minPitDimension
} from "../lib/charcoal";
import type { CalculationMode } from "../types/index";

const DEFAULT_DIMENSION = 3;
const DEFAULT_TARGET_CHARCOAL = 100;

export type CharcoalCalculatorState = {
  mode: CalculationMode;
  width: number;
  depth: number;
  height: number;
  targetCharcoal: number;
};

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, Math.floor(value)));

const initializeState = (): CharcoalCalculatorState => ({
  mode: "have",
  width: DEFAULT_DIMENSION,
  depth: DEFAULT_DIMENSION,
  height: DEFAULT_DIMENSION,
  targetCharcoal: DEFAULT_TARGET_CHARCOAL
});

export const charcoalCalculator = writable<CharcoalCalculatorState>(
  initializeState()
);

export const setMode = (mode: CalculationMode) => {
  charcoalCalculator.update((state) => {
    if (state.mode === mode) return state;
    return { ...state, mode };
  });
};

export const setWidth = (value: number | null) => {
  const safe = clamp(Number(value) || minPitDimension, minPitDimension, maxPitDimension);
  charcoalCalculator.update((state) => ({ ...state, width: safe }));
};

export const setDepth = (value: number | null) => {
  const safe = clamp(Number(value) || minPitDimension, minPitDimension, maxPitDimension);
  charcoalCalculator.update((state) => ({ ...state, depth: safe }));
};

export const setHeight = (value: number | null) => {
  const safe = clamp(Number(value) || minPitDimension, minPitDimension, maxPitDimension);
  charcoalCalculator.update((state) => ({ ...state, height: safe }));
};

export const setTargetCharcoal = (value: number | null) => {
  const safe = Math.max(1, Math.floor(Number(value) || 1));
  charcoalCalculator.update((state) => ({ ...state, targetCharcoal: safe }));
};

export const applyState = (partial: Partial<CharcoalCalculatorState>) => {
  charcoalCalculator.update((state) => {
    const next = { ...state };

    if (partial.mode !== undefined) {
      next.mode = partial.mode === "need" ? "need" : "have";
    }
    if (partial.width !== undefined) {
      next.width = clamp(Number(partial.width) || minPitDimension, minPitDimension, maxPitDimension);
    }
    if (partial.depth !== undefined) {
      next.depth = clamp(Number(partial.depth) || minPitDimension, minPitDimension, maxPitDimension);
    }
    if (partial.height !== undefined) {
      next.height = clamp(Number(partial.height) || minPitDimension, minPitDimension, maxPitDimension);
    }
    if (partial.targetCharcoal !== undefined) {
      next.targetCharcoal = Math.max(1, Math.floor(Number(partial.targetCharcoal) || 1));
    }

    return next;
  });
};

export const charcoalCalculation = derived(charcoalCalculator, (state) => {
  if (state.mode === "need") {
    const suggested = suggestPitDimensions(state.targetCharcoal);
    const result = calculateFromDimensions(
      suggested.width,
      suggested.depth,
      suggested.height
    );
    return {
      mode: state.mode,
      pitWidth: suggested.width,
      pitDepth: suggested.depth,
      pitHeight: suggested.height,
      ...result
    };
  }

  const result = calculateFromDimensions(state.width, state.depth, state.height);
  return {
    mode: state.mode,
    pitWidth: state.width,
    pitDepth: state.depth,
    pitHeight: state.height,
    ...result
  };
});
