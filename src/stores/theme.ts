import { derived, writable } from "svelte/store";

export const THEMES = {
  "nature-light": "Nature Light",
  "nature-dark": "Nature Dark",
  "ocean-light": "Ocean Light",
  "ocean-dark": "Ocean Dark",
  "bauxite-light": "Bauxite Light",
  "bauxite-dark": "Bauxite Dark",
  "lavender-light": "Lavender Light",
  "lavender-dark": "Lavender Dark"
} as const;

export type ThemeKey = keyof typeof THEMES;

export const themeEntries = Object.entries(THEMES) as Array<[ThemeKey, string]>;

const THEME_STORAGE_KEY = "vsc-theme";

export const theme = writable<ThemeKey>("nature-light");

export const themeName = derived(theme, ($theme) => THEMES[$theme] || "Nature Light");

const applyTheme = (value: ThemeKey) => {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = value;
};

theme.subscribe((value) => applyTheme(value));

export const setTheme = (value: ThemeKey, persist = false) => {
  theme.set(value);
  if (persist && typeof window !== "undefined") {
    window.localStorage.setItem(THEME_STORAGE_KEY, value);
  }
};

export const initTheme = () => {
  if (typeof window === "undefined") return () => undefined;

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  const hasStoredTheme = storedTheme !== null && storedTheme in THEMES;

  const resolvedTheme: ThemeKey = hasStoredTheme
    ? (storedTheme as ThemeKey)
    : mediaQuery.matches
      ? "nature-dark"
      : "nature-light";

  setTheme(resolvedTheme);

  const handleMediaPreference = (event: MediaQueryListEvent) => {
    if (window.localStorage.getItem(THEME_STORAGE_KEY)) return;
    setTheme(event.matches ? "nature-dark" : "nature-light");
  };

  mediaQuery.addEventListener("change", handleMediaPreference);

  return () => {
    mediaQuery.removeEventListener("change", handleMediaPreference);
  };
};
