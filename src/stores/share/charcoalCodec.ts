import { get } from "svelte/store";
import { registerShareCodec } from "../../lib/url-state";
import {
  applyState,
  charcoalCalculator,
  type CharcoalCalculatorState
} from "../charcoalCalculator";

export function registerCharcoalShareCodec(): void {
  registerShareCodec("charcoal", {
    encode() {
      const state = get(charcoalCalculator);
      const params = new URLSearchParams();
      if (state.mode === "have") {
        params.set("d", "h");
        params.set("w", String(state.width));
        params.set("dp", String(state.depth));
        params.set("h", String(state.height));
      } else {
        params.set("c", String(state.targetCharcoal));
      }
      return params;
    },
    apply(params) {
      const partial: Partial<CharcoalCalculatorState> = {};

      const direction = params.get("d");
      if (direction === "h") {
        partial.mode = "have";
        const w = params.get("w");
        if (w !== null) {
          const value = Number(w);
          if (Number.isFinite(value) && value >= 1) {
            partial.width = value;
          }
        }
        const dp = params.get("dp");
        if (dp !== null) {
          const value = Number(dp);
          if (Number.isFinite(value) && value >= 1) {
            partial.depth = value;
          }
        }
        const h = params.get("h");
        if (h !== null) {
          const value = Number(h);
          if (Number.isFinite(value) && value >= 1) {
            partial.height = value;
          }
        }
      } else {
        partial.mode = "need";
        const c = params.get("c");
        if (c !== null) {
          const value = Number(c);
          if (Number.isFinite(value) && value >= 1) {
            partial.targetCharcoal = Math.floor(value);
          }
        }
      }

      applyState(partial);
    }
  });
}
