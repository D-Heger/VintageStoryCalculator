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

export function registerAlloyShareCodec(): void {
  registerShareCodec("alloying", {
    encode() {
      const state = get(alloyCalculator);
      const params = new URLSearchParams();
      params.set("a", state.selectedAlloy);
      params.set("n", String(state.targetIngots));

      const definition = getAlloyDefinition(state.selectedAlloy);
      if (definition) {
        for (const part of definition.parts) {
          const pct = state.metalPercentages[part.metal];
          if (pct !== undefined) {
            params.set(part.metal, pct.toFixed(ALLOY_PERCENT_PRECISION));
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

      const ingots = params.get("n");
      if (ingots !== null) {
        const n = Number(ingots);
        if (Number.isFinite(n) && n >= 0) {
          partial.targetIngots = n;
        }
      }

      const targetAlloy = partial.selectedAlloy ?? get(alloyCalculator).selectedAlloy;
      const definition = getAlloyDefinition(targetAlloy);
      if (definition) {
        const percentages: Record<string, number> = {};
        let hasAny = false;

        for (const part of definition.parts) {
          const val = params.get(part.metal);
          if (val !== null) {
            const pct = Number(val);
            if (Number.isFinite(pct)) {
              percentages[part.metal] = pct;
              hasAny = true;
            }
          }
        }

        if (hasAny) {
          partial.metalPercentages = percentages;
        }
      }

      applyState(partial);
    }
  });
}
