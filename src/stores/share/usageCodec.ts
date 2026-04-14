import { get } from "svelte/store";
import metalDefinitionsRaw from "../../data/metals.json";
import { registerShareCodec } from "../../lib/url-state";
import {
  applyState,
  usageFinder,
  type InventoryEntry
} from "../usageFinder";
import type { Metal } from "../../types";

const METAL_DEFINITIONS = metalDefinitionsRaw as Record<string, Metal>;

export function registerUsageShareCodec(): void {
  registerShareCodec("usage", {
    encode() {
      const state = get(usageFinder);
      const params = new URLSearchParams();
      for (const entry of state.inventory) {
        params.set(entry.metalKey, String(entry.nuggets));
      }
      return params;
    },
    apply(params) {
      const inventory: InventoryEntry[] = [];
      for (const [key, value] of params.entries()) {
        if (!METAL_DEFINITIONS[key]) continue;
        const nuggets = Number(value);
        if (!Number.isFinite(nuggets) || nuggets < 0) continue;
        inventory.push({ metalKey: key, nuggets });
      }
      if (inventory.length) {
        applyState({ inventory });
      }
    }
  });
}
