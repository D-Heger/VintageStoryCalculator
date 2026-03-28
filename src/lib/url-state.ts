/**
 * URL State Sharing
 *
 * Generic, extensible system for encoding calculator state into shareable URLs.
 * Each calculator registers a codec that knows how to serialize/deserialize its own state.
 *
 * URL format: #route?key=value&key=value
 * Example:    #alloying?a=tin_bronze&n=10&Copper=90.0&Tin=10.0
 */

export interface ShareCodec {
  /** Serialize current calculator state into URL search params. */
  encode(): URLSearchParams;
  /** Deserialize URL search params and apply them to the calculator store. */
  apply(params: URLSearchParams): void;
}

const registry = new Map<string, ShareCodec>();

/** Register a share codec for a given route. Call at module scope in each calculator store. */
export function registerShareCodec(route: string, codec: ShareCodec): void {
  registry.set(route, codec);
}

/** Check whether a codec is registered for the given route. */
export function hasCodec(route: string): boolean {
  return registry.has(route);
}

/** Extract the route name and optional search params from a hash string. */
export function parseHash(hash: string): { route: string; params: URLSearchParams | null } {
  const raw = hash.startsWith("#") ? hash.slice(1) : hash;
  const qIndex = raw.indexOf("?");
  if (qIndex === -1) return { route: raw || "home", params: null };
  const route = raw.slice(0, qIndex) || "home";
  const paramStr = raw.slice(qIndex + 1);
  if (!paramStr) return { route, params: null };
  return { route, params: new URLSearchParams(paramStr) };
}

/** Parse just the route portion from a hash, ignoring any query params. */
export function getRouteFromHash(hash: string): string {
  return parseHash(hash).route;
}

/** Build a full shareable URL for the given route using its registered codec. */
export function buildShareUrl(route: string): string {
  const base = `${window.location.origin}${window.location.pathname}`;
  const codec = registry.get(route);
  if (!codec) return `${base}#${route}`;
  const params = codec.encode();
  const paramStr = params.toString();
  return paramStr ? `${base}#${route}?${paramStr}` : `${base}#${route}`;
}

/** Apply shared state from URL params to the appropriate calculator store. Returns true if state was applied. */
export function applyUrlState(hash: string): boolean {
  const { route, params } = parseHash(hash);
  if (!params) return false;
  const codec = registry.get(route);
  if (!codec) return false;
  codec.apply(params);
  return true;
}

/** Check whether the hash contains share parameters. */
export function hasShareParams(hash: string): boolean {
  const { params } = parseHash(hash);
  return params !== null && params.toString() !== "";
}
