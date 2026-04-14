import { registerAlloyShareCodec } from "./alloyCodec";
import { registerMetalShareCodec } from "./metalCodec";
import { registerUsageShareCodec } from "./usageCodec";

let initialized = false;

export function setupShareCodecs(): void {
  if (initialized) return;
  registerAlloyShareCodec();
  registerMetalShareCodec();
  registerUsageShareCodec();
  initialized = true;
}
