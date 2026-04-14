import { get } from "svelte/store";
import alloyDefinitionsRaw from "../../data/alloys.json";
import { registerShareCodec } from "../../lib/url-state";
import {
  ALLOY_PERCENT_PRECISION,
  alloyCalculator,
  applyState,
  type AlloyCalculatorState
} from "../alloyCalculator";
import type { Alloy } from "../../types";

const ALLOY_DEFINITIONS = alloyDefinitionsRaw as Record<string, Alloy>;

const getAlloyDefinition = (key: string) => ALLOY_DEFINITIONS[key];

const NUGGET_PARAM_PREFIX = "h_";

export function registerAlloyShareCodec(): void {
  registerShareCodec("alloying", {
    encode() {
      const state = get(alloyCalculator);
      const params = new URLSearchParams();
      params.set("a", state.selectedAlloy);

      if (state.mode === "have") {
        params.set("d", "h");
      } else {
        params.set("n", String(state.targetIngots));
      }

      const definition = getAlloyDefinition(state.selectedAlloy);
      if (definition) {
        for (const part of definition.parts) {
          const pct = state.metalPercentages[part.metal];
          if (pct !== undefined) {
            params.set(part.metal, pct.toFixed(ALLOY_PERCENT_PRECISION));
          }
          if (state.mode === "have") {
            const nuggets = state.metalNuggets[part.metal];
            if (nuggets !== undefined) {
              params.set(`${NUGGET_PARAM_PREFIX}${part.metal}`, String(nuggets));
            }
          }
        }
      }

      return params;
    },
    apply(params) {
      const partial: Partial<AlloyCalculatorState> = {};

      const alloyKey = params.get("a");
      if (alloyKey && getAlloyDefinition(alloyKey)) {
        partial.selectedAlloy = alloyKey;
      }

      const direction = params.get("d");
      if (direction === "h") {
        partial.mode = "have";
      } else {
        partial.mode = "need";
        const ingots = params.get("n");
        if (ingots !== null) {
          const n = Number(ingots);
          if (Number.isFinite(n) && n >= 0) {
            partial.targetIngots = n;
          }
        }
      }

      const targetAlloy = partial.selectedAlloy ?? get(alloyCalculator).selectedAlloy;
      const definition = getAlloyDefinition(targetAlloy);
      if (definition) {
        const percentages: Record<string, number> = {};
        const nuggets: Record<string, number> = {};
        let hasPercentages = false;
        let hasNuggets = false;

        for (const part of definition.parts) {
          const val = params.get(part.metal);
          if (val !== null) {
            const pct = Number(val);
            if (Number.isFinite(pct)) {
              percentages[part.metal] = pct;
              hasPercentages = true;
            }
          }

          const nuggetVal = params.get(`${NUGGET_PARAM_PREFIX}${part.metal}`);
          if (nuggetVal !== null) {
            const n = Number(nuggetVal);
            if (Number.isFinite(n) && n >= 0) {
              nuggets[part.metal] = n;
              hasNuggets = true;
            }
          }
        }

        if (hasPercentages) {
          partial.metalPercentages = percentages;
        }
        if (hasNuggets) {
          partial.metalNuggets = nuggets;
        }
      }

      applyState(partial);
    }
  });
}
