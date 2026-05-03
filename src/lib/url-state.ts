/**
 * URL State Sharing
 *
 * Generic, extensible system for encoding calculator state into shareable URLs.
 * Each calculator registers a codec that knows how to serialize/deserialize its own state.
 *
 * URL format: /route/?shareRoute=route&key=value&key=value
 * Legacy hash URLs remain supported for existing shared links.
 * Example:    /alloying/?shareRoute=alloying&a=tin_bronze&n=10&Copper=90.0&Tin=10.0
 */

export interface ShareCodec {
  /** Serialize current calculator state into URL search params. */
  encode(): URLSearchParams;
  /** Deserialize URL search params and apply them to the calculator store. */
  apply(params: URLSearchParams): void;
}

const registry = new Map<string, ShareCodec>();
const SHARE_ROUTE_PARAM = "shareRoute";

export const ROUTE_PATHS: Record<string, string> = {
  home: "/",
  alloying: "/alloying/",
  casting: "/casting/",
  charcoal: "/charcoal/",
  usage: "/usage-finder/",
  feedback: "/feedback/",
  privacy: "/privacy/"
};

const PATH_ROUTES = new Map<string, string>([
  ["/", "home"],
  ["/alloying", "alloying"],
  ["/casting", "casting"],
  ["/charcoal", "charcoal"],
  ["/usage", "usage"],
  ["/usage-finder", "usage"],
  ["/feedback", "feedback"],
  ["/privacy", "privacy"]
]);

const normalizePath = (pathname: string): string => {
  const cleanPath = (pathname || "/").split(/[?#]/, 1)[0] || "/";
  if (cleanPath === "/") return cleanPath;
  return cleanPath.replace(/\/+$/, "");
};

/** Return the canonical public path for a route. */
export function getCanonicalPathForRoute(route: string): string {
  return ROUTE_PATHS[route] ?? `/#${encodeURIComponent(route)}`;
}

/** Parse a route from a crawlable path URL. */
export function getRouteFromPath(pathname: string): string | null {
  return PATH_ROUTES.get(normalizePath(pathname)) ?? null;
}

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

/** Extract a route and optional params from the URL search segment used in share links. */
export function parseSearch(search: string): { route: string | null; params: URLSearchParams | null } {
  const raw = search.startsWith("?") ? search.slice(1) : search;
  if (!raw) return { route: null, params: null };

  const allParams = new URLSearchParams(raw);
  const route = allParams.get(SHARE_ROUTE_PARAM);
  if (!route) return { route: null, params: null };

  allParams.delete(SHARE_ROUTE_PARAM);
  if (!allParams.toString()) {
    return { route, params: null };
  }
  return { route, params: allParams };
}

/** Parse route from the URL search segment used in share links. */
export function getRouteFromSearch(search: string): string | null {
  return parseSearch(search).route;
}

/** Build a full shareable URL for the given route using its registered codec. */
export function buildShareUrl(route: string): string {
  const url = new URL(getCanonicalPathForRoute(route), window.location.origin);
  const codec = registry.get(route);
  if (!codec) {
    return url.toString();
  }

  const params = codec.encode();
  if (params.toString()) {
    params.set(SHARE_ROUTE_PARAM, route);
    url.search = params.toString();
  }
  return url.toString();
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

/** Apply shared state from URL search params to the appropriate calculator store. Returns true if state was applied. */
export function applyUrlStateFromSearch(search: string): boolean {
  const { route, params } = parseSearch(search);
  if (!route || !params) return false;
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

/** Check whether URL search contains share parameters. */
export function hasShareParamsInSearch(search: string): boolean {
  const { route, params } = parseSearch(search);
  return route !== null && params !== null && params.toString() !== "";
}
