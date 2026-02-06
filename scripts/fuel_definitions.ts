import { FUEL_TYPES } from "../src/lib/fuels";
import type { Fuel } from "../src/types/index";

export { FUEL_TYPES };

export function getCompatibleFuels(smeltTemp: number | string) {
  const tempValue = Number.parseInt(String(smeltTemp), 10);
  return Object.values(FUEL_TYPES as Record<string, Fuel>)
    .filter((fuel) => fuel.temp >= tempValue)
    .sort((a, b) => a.temp - b.temp);
}

export function formatFuelList(fuels: Fuel[] | undefined) {
  if (!fuels || fuels.length === 0) return "None (requires bloomery)";
  return fuels.map((fuel) => fuel.name).join(", ");
}
