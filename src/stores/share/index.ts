import { registerAlloyShareCodec } from "./alloyCodec";
import { registerCharcoalShareCodec } from "./charcoalCodec";
import { registerMetalShareCodec } from "./metalCodec";
import { registerUsageShareCodec } from "./usageCodec";

let initialized = false;

export function setupShareCodecs(): void {
  if (initialized) return;
  registerAlloyShareCodec();
  registerCharcoalShareCodec();
  registerMetalShareCodec();
  registerUsageShareCodec();
  initialized = true;
}
