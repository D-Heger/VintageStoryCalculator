import { get } from "svelte/store";
import metalDefinitionsRaw from "../../data/metals.json";
import { registerShareCodec } from "../../lib/url-state";
import {
  applyState,
  metalCalculator,
  type MetalCalculatorState
} from "../metalCalculator";
import type { Metal } from "../../types";

const METAL_DEFINITIONS = metalDefinitionsRaw as Record<string, Metal>;

const getMetalDefinition = (key: string) => METAL_DEFINITIONS[key];

export function registerMetalShareCodec(): void {
  registerShareCodec("casting", {
    encode() {
      const state = get(metalCalculator);
      const params = new URLSearchParams();
      params.set("m", state.selectedMetal);
      params.set("n", String(state.targetIngots));
      return params;
    },
    apply(params) {
      const partial: Partial<MetalCalculatorState> = {};

      const metalKey = params.get("m");
      if (metalKey && getMetalDefinition(metalKey)) {
        partial.selectedMetal = metalKey;
      }

      const ingots = params.get("n");
      if (ingots !== null) {
        const n = Number(ingots);
        if (Number.isFinite(n) && n >= 0) {
          partial.targetIngots = n;
        }
      }

      applyState(partial);
    }
  });
}
