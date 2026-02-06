import fuels from "../data/fuels.json";
import type { Fuel } from "../types/index";

export const FUEL_TYPES = fuels as Record<string, Fuel>;
