declare module "*.svelte" {
  import type { SvelteComponent } from "svelte";
  export default class Component extends SvelteComponent {}
}

declare module "*.json" {
  const value: Record<string, unknown>;
  export default value;
}
