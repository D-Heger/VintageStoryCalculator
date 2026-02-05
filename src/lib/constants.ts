import constants from "../data/constants.json";

export const UNITS_PER_INGOT = constants.unitsPerIngot;
export const UNITS_PER_NUGGET = constants.unitsPerNugget;
export const NUGGETS_PER_INGOT = constants.nuggetsPerIngot;
export const STACK_SIZE = constants.stackSize;
export const MAX_STACKS_PER_PROCESS = constants.maxStacksPerProcess;
export const METAL_COLOR_PALETTE = constants.metalColors;
export const TEMPERATURE_RENDERING = constants.renderingTemperatures;

export const normalizeMetalKey = (value: string) =>
  value ? value.toLowerCase().replace(/\s+/g, "_") : "";

export const getMetalColor = (value: string) =>
  METAL_COLOR_PALETTE[normalizeMetalKey(value) as keyof typeof METAL_COLOR_PALETTE] ?? "#ccc";

export const formatTemperature = (value: number | string | null | undefined) => {
  if (value === null || value === undefined || value === "") {
    return TEMPERATURE_RENDERING.fallback;
  }

  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return String(value);
  }

  return `${numeric}${TEMPERATURE_RENDERING.unit}`;
};
