import { writable, derived } from "svelte/store";
import type { ThemeKey } from "./theme";

/**
 * Available font family presets for the application.
 * Each preset maps to CSS variables defined in base.css
 */
export const FONT_FAMILIES = {
  default: "Default (Source Sans 3 / Outfit)",
  system: "System UI",
  monospace: "Monospace"
} as const;

export type FontFamilyKey = keyof typeof FONT_FAMILIES;

/**
 * UI scale presets for accessibility and user preference.
 * Applied as a multiplier to spacing and font-size tokens.
 */
export const UI_SCALES = {
  compact: { label: "Compact", scale: 0.9 },
  default: { label: "Default", scale: 1.0 },
  large: { label: "Large", scale: 1.1 },
  xlarge: { label: "Extra Large", scale: 1.2 }
} as const;

export type UIScaleKey = keyof typeof UI_SCALES;

/**
 * Application settings state.
 * All settings should have sensible defaults.
 */
export interface Settings {
  // Appearance
  theme: ThemeKey;
  fontFamily: FontFamilyKey;
  uiScale: UIScaleKey;
  
  // Accessibility
  showHelpText: boolean;
  
  // Future: feedback preferences, etc.
}

/**
 * Default settings applied on first load or reset.
 */
const DEFAULT_SETTINGS: Settings = {
  theme: "nature-dark",
  fontFamily: "default",
  uiScale: "default",
  showHelpText: true
};

const SETTINGS_STORAGE_KEY = "vsc-settings";
const LEGACY_THEME_STORAGE_KEY = "vsc-theme"; // For migration

/**
 * Load settings from localStorage, falling back to defaults.
 * Migrates legacy theme preference if present.
 */
const loadSettings = (): Settings => {
  if (typeof window === "undefined") return { ...DEFAULT_SETTINGS };
  
  try {
    const stored = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    
    // Migrate legacy theme setting if no unified settings exist
    if (!stored) {
      const legacyTheme = window.localStorage.getItem(LEGACY_THEME_STORAGE_KEY);
      if (legacyTheme && legacyTheme in { "nature-light": 1, "nature-dark": 1, "ocean-light": 1, "ocean-dark": 1, "bauxite-light": 1, "bauxite-dark": 1, "lavender-light": 1, "lavender-dark": 1 }) {
        // Migrate and clean up
        const migrated = { ...DEFAULT_SETTINGS, theme: legacyTheme as ThemeKey };
        window.localStorage.removeItem(LEGACY_THEME_STORAGE_KEY);
        return migrated;
      }
      return { ...DEFAULT_SETTINGS };
    }
    
    const parsed = JSON.parse(stored) as Partial<Settings>;
    
    // Validate and merge with defaults to handle schema evolution
    return {
      theme: parsed.theme && parsed.theme in { "nature-light": 1, "nature-dark": 1, "ocean-light": 1, "ocean-dark": 1, "bauxite-light": 1, "bauxite-dark": 1, "lavender-light": 1, "lavender-dark": 1 } 
        ? parsed.theme 
        : DEFAULT_SETTINGS.theme,
      fontFamily: parsed.fontFamily && parsed.fontFamily in FONT_FAMILIES 
        ? parsed.fontFamily 
        : DEFAULT_SETTINGS.fontFamily,
      uiScale: parsed.uiScale && parsed.uiScale in UI_SCALES 
        ? parsed.uiScale 
        : DEFAULT_SETTINGS.uiScale,
      showHelpText: typeof parsed.showHelpText === "boolean" 
        ? parsed.showHelpText 
        : DEFAULT_SETTINGS.showHelpText
    };
  } catch (error) {
    console.warn("Failed to load settings from localStorage:", error);
    return { ...DEFAULT_SETTINGS };
  }
};

/**
 * Persist settings to localStorage.
 */
const saveSettings = (settings: Settings): void => {
  if (typeof window === "undefined") return;
  
  try {
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Failed to save settings to localStorage:", error);
  }
};

/**
 * Main settings store with automatic persistence.
 */
export const settings = writable<Settings>(loadSettings());

// Subscribe to persist changes automatically
let hasInitializedPersistence = false;
settings.subscribe((value) => {
  if (!hasInitializedPersistence) {
    hasInitializedPersistence = true;
    return;
  }
  saveSettings(value);
});

/**
 * Derived stores for convenient access to individual settings.
 */
export const showHelpText = derived(settings, ($settings) => $settings.showHelpText);
export const currentFontFamily = derived(settings, ($settings) => $settings.fontFamily);
export const currentUIScale = derived(settings, ($settings) => $settings.uiScale);

/**
 * Update a single setting without replacing the entire state.
 */
export const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]): void => {
  settings.update((current) => ({
    ...current,
    [key]: value
  }));
};

/**
 * Reset all settings to defaults.
 */
export const resetSettings = (): void => {
  settings.set({ ...DEFAULT_SETTINGS });
};

/**
 * Initialize settings (apply to DOM, etc.).
 * Returns cleanup function.
 */
export const initSettings = (): (() => void) => {
  if (typeof document === "undefined") return () => undefined;
  
  const applySettings = (value: Settings) => {
    // Apply font family
    const fontFamilyMap: Record<FontFamilyKey, string> = {
      default: `"Source Sans 3", "Segoe UI", Tahoma, sans-serif`,
      system: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`,
      monospace: `"Consolas", "Monaco", "Courier New", monospace`
    };
    document.documentElement.style.setProperty("--font-body", fontFamilyMap[value.fontFamily]);
    
    // Apply UI scale
    const scale = UI_SCALES[value.uiScale].scale;
    document.documentElement.style.setProperty("--ui-scale", scale.toString());
    
    // Theme is handled by theme.ts, but we keep it in settings for unified management
    // Help text is reactive via component props, no DOM manipulation needed
  };
  
  const unsubscribe = settings.subscribe(applySettings);
  
  return () => {
    unsubscribe();
  };
};

/**
 * Export types and constants for use in components.
 */
export const fontFamilyEntries = Object.entries(FONT_FAMILIES) as Array<[FontFamilyKey, string]>;
export const uiScaleEntries = Object.entries(UI_SCALES) as Array<[UIScaleKey, typeof UI_SCALES[UIScaleKey]]>;
