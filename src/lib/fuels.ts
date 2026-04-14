import fuels from "../data/fuels.json";
import metalDefinitionsRaw from "../data/metals.json";
import { formatTemperature } from "./constants";
import type { Fuel, Metal } from "../types/index";

export const FUEL_TYPES = fuels as Record<string, Fuel>;

const METAL_DEFINITIONS = metalDefinitionsRaw as Record<string, Metal>;

const metalByName = new Map<string, Metal>();
for (const def of Object.values(METAL_DEFINITIONS)) {
	metalByName.set(def.name, def);
}

export type IngredientFuelInfo = {
	metal: string;
	smeltTemp: number;
	formattedTemp: string;
	compatibleFuels: Fuel[];
	formattedFuels: string;
};

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

export const getIngredientFuelDetails = (metalNames: string[]): IngredientFuelInfo[] =>
	metalNames.map((name) => {
		const def = metalByName.get(name);
		const smeltTemp = def?.smeltTemp ?? 0;
		const compatible = getCompatibleFuels(smeltTemp);
		return {
			metal: name,
			smeltTemp,
			formattedTemp: formatTemperature(smeltTemp),
			compatibleFuels: compatible,
			formattedFuels: formatFuelList(compatible),
		};
	});

export const getBottleneckFuels = (metalNames: string[]): { temp: number; formattedTemp: string; fuels: string } => {
	const details = getIngredientFuelDetails(metalNames);
	const maxTemp = Math.max(0, ...details.map((d) => d.smeltTemp));
	const compatible = getCompatibleFuels(maxTemp);
	return {
		temp: maxTemp,
		formattedTemp: formatTemperature(maxTemp),
		fuels: formatFuelList(compatible),
	};
};
