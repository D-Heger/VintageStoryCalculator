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
      params.set("n", String(state.inputValue));
      if (state.mode === "have") {
        params.set("d", "h");
      }
      return params;
    },
    apply(params) {
      const partial: Partial<MetalCalculatorState> = {};

      const metalKey = params.get("m");
      if (metalKey && getMetalDefinition(metalKey)) {
        partial.selectedMetal = metalKey;
      }

      const direction = params.get("d");
      if (direction === "h") {
        partial.mode = "have";
      } else {
        partial.mode = "need";
      }

      const n = params.get("n");
      if (n !== null) {
        const value = Number(n);
        if (Number.isFinite(value) && value >= 0) {
          partial.inputValue = value;
        }
      }

      applyState(partial);
    }
  });
}
