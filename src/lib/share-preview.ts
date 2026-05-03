import { get } from "svelte/store";
import { alloyCalculation, alloyCalculator } from "../stores/alloyCalculator";
import { charcoalCalculation, charcoalCalculator } from "../stores/charcoalCalculator";
import { metalCalculation, metalCalculator } from "../stores/metalCalculator";
import { usageFinder, usageFinderResults } from "../stores/usageFinder";

export type SharePreview = {
  title: string;
  text: string;
};

const formatWhole = (value: number): string => Math.max(0, Math.floor(value)).toString();

const buildCastingPreview = (): SharePreview => {
  const state = get(metalCalculator);
  const result = get(metalCalculation);

  if (state.mode === "have") {
    return {
      title: `Vintage Story: ${result.metalName} casting result`,
      text: `From ${formatWhole(state.inputValue)} ${result.metalName} nuggets: ${formatWhole(result.producedIngots)} ingots + ${formatWhole(result.remainderNuggets)} nuggets leftover.`
    };
  }

  return {
    title: `Vintage Story: ${result.metalName} casting plan`,
    text: `Need ${formatWhole(state.inputValue)} ${result.metalName} ingots? This plan requires ${formatWhole(result.nuggetsNeeded)} nuggets.`
  };
};

const buildAlloyingPreview = (): SharePreview => {
  const state = get(alloyCalculator);
  const result = get(alloyCalculation);

  const recipe = result.parts
    .map((part) => `${part.metal} ${part.pct.toFixed(1)}%`)
    .join(", ");

  if (state.mode === "have") {
    return {
      title: `Vintage Story: ${result.alloyName} alloy yield`,
      text: `Using current nuggets for ${result.alloyName}: ${formatWhole(result.producedIngots)} ingots produced. Mix: ${recipe}.`
    };
  }

  return {
    title: `Vintage Story: ${result.alloyName} alloy plan`,
    text: `Plan ${formatWhole(state.targetIngots)} ${result.alloyName} ingots with recipe ${recipe}.`
  };
};

const buildCharcoalPreview = (): SharePreview => {
  const state = get(charcoalCalculator);
  const result = get(charcoalCalculation);

  if (state.mode === "have") {
    return {
      title: "Vintage Story: Charcoal pit result",
      text: `Pit ${result.pitWidth}x${result.pitDepth}x${result.pitHeight} yields ~${Math.round(result.charcoalAvg)} charcoal on average.`
    };
  }

  return {
    title: "Vintage Story: Charcoal pit plan",
    text: `Target ${formatWhole(state.targetCharcoal)} charcoal suggests pit ${result.pitWidth}x${result.pitDepth}x${result.pitHeight}.`
  };
};

const buildUsagePreview = (): SharePreview => {
  const state = get(usageFinder);
  const results = get(usageFinderResults);

  const totalNuggets = state.inventory.reduce((sum, entry) => sum + Math.max(0, entry.nuggets), 0);
  const bestResult = results[0];

  if (!bestResult) {
    return {
      title: "Vintage Story: Usage Finder snapshot",
      text: `Inventory has ${formatWhole(totalNuggets)} nuggets across ${formatWhole(state.inventory.length)} metals.`
    };
  }

  return {
    title: "Vintage Story: Usage Finder best result",
    text: `Inventory: ${formatWhole(totalNuggets)} nuggets. Best current output: ${bestResult.name} (${formatWhole(bestResult.ingots)} ingots).`
  };
};

export function buildSharePreview(route: string): SharePreview {
  if (route === "casting") return buildCastingPreview();
  if (route === "alloying") return buildAlloyingPreview();
  if (route === "charcoal") return buildCharcoalPreview();
  if (route === "usage") return buildUsagePreview();

  return {
    title: "Vintage Story Calculator",
    text: "Plan alloys, casting, charcoal, and metal usage with game-accurate calculators."
  };
}
