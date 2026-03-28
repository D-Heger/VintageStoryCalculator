import { registerAlloyShareCodec } from "./alloyCodec";
import { registerMetalShareCodec } from "./metalCodec";

let initialized = false;

export function setupShareCodecs(): void {
  if (initialized) return;
  registerAlloyShareCodec();
  registerMetalShareCodec();
  initialized = true;
}
