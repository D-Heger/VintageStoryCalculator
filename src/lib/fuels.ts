import fuels from "../data/fuels.json";
import type { Fuel } from "../types/index";

export const FUEL_TYPES = fuels as Record<string, Fuel>;

export const getCompatibleFuels = (smeltTemp: number | string) => {
	const tempValue = Number.parseInt(String(smeltTemp), 10);
	return Object.values(FUEL_TYPES)
		.filter((fuel) => fuel.temp >= tempValue)
		.sort((a, b) => a.temp - b.temp);
};

export const formatFuelList = (fuelsList: Fuel[] | undefined) => {
	if (!fuelsList || fuelsList.length === 0) return "None (requires bloomery)";
	return fuelsList.map((fuel) => fuel.name).join(", ");
};
