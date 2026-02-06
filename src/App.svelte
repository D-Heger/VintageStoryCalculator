<script lang="ts">
  import { onMount } from "svelte";
  import type { SvelteComponent } from "svelte";
  import Home from "./routes/Home.svelte";
  import AlloyingCalculator from "./routes/AlloyingCalculator.svelte";
  import CastingCalculator from "./routes/CastingCalculator.svelte";
  import { getProjectVersion } from "./lib/version";

  const NAV_ITEMS = [
    { id: "home", label: "Home", hash: "#home" },
    { id: "alloying", label: "Alloying Calculator", hash: "#alloying" },
    { id: "casting", label: "Casting Calculator", hash: "#casting" }
  ] as const;

  type RouteId = (typeof NAV_ITEMS)[number]["id"];
  type RouteHash = (typeof NAV_ITEMS)[number]["hash"];
  type RouteComponent = new (...args: any[]) => SvelteComponent;

  const ROUTES: Record<RouteId, RouteComponent> = {
    home: Home,
    alloying: AlloyingCalculator,
    casting: CastingCalculator
  };

  const THEMES = {
    "nature-light": "Nature Light",
    "nature-dark": "Nature Dark",
    "ocean-light": "Ocean Light",
    "ocean-dark": "Ocean Dark",
    "bauxite-light": "Bauxite Light",
    "bauxite-dark": "Bauxite Dark",
    "lavender-light": "Lavender Light",
    "lavender-dark": "Lavender Dark"
  } as const;

  type ThemeKey = keyof typeof THEMES;
  const themeEntries = Object.entries(THEMES) as Array<[ThemeKey, string]>;

  const THEME_STORAGE_KEY = "vsc-theme";

  let currentRoute: RouteId = "home";
  let theme: ThemeKey = "nature-light";
  let version = "Loading...";
  let showThemeSelector = false;

  const applyTheme = (value: ThemeKey) => {
    if (typeof document === "undefined") return;
    document.documentElement.dataset.theme = value;
  };

  const setTheme = (value: ThemeKey, persist = false) => {
    theme = value;
    applyTheme(value);
    if (persist && typeof window !== "undefined") {
      window.localStorage.setItem(THEME_STORAGE_KEY, value);
    }
    showThemeSelector = false;
  };

  const getRouteFromHash = (hash: string): RouteId => {
    if (hash === "#alloying") return "alloying";
    if (hash === "#casting") return "casting";
    return "home";
  };

  const navigate = (routeId: RouteId) => {
    if (typeof window === "undefined") {
      currentRoute = routeId;
      return;
    }
    const targetHash = NAV_ITEMS.find((item) => item.id === routeId)?.hash as
      | RouteHash
      | undefined;
    if (!targetHash) return;
    if (window.location.hash !== targetHash) {
      window.location.hash = targetHash;
    } else {
      currentRoute = routeId;
    }
  };

  const updateMetaForRoute = (routeId: RouteId) => {
    if (typeof document === "undefined") return;
    const baseTitle = "Vintage Story Calculator";
    const titles = {
      home: `${baseTitle} — Home`,
      alloying: `${baseTitle} — Alloying Calculator`,
      casting: `${baseTitle} — Casting Calculator`
    };
    const descriptions = {
      home:
        "Svelte-powered calculators for Vintage Story. Plan alloys, resources, and smelting with precise, game-accurate math.",
      alloying:
        "Calculate exact metal ratios and nuggets for Vintage Story alloys like Tin Bronze, Bismuth Bronze, Electrum, and more.",
      casting:
        "Calculate ore nuggets needed to cast metal ingots in Vintage Story. Supports all castable metals including Copper, Gold, Silver, and more."
    };

    document.title = titles[routeId] || baseTitle;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute("content", descriptions[routeId] || descriptions.home);
    }
  };

  const toggleThemeSelector = () => {
    showThemeSelector = !showThemeSelector;
  };

  $: currentThemeName = THEMES[theme] || "Nature Light";

  onMount(() => {
    let isActive = true;

    getProjectVersion().then((value) => {
      if (isActive) version = value;
    });

    if (typeof window !== "undefined") {
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

      const applyHashRoute = () => {
        currentRoute = getRouteFromHash(window.location.hash || "#home");
        updateMetaForRoute(currentRoute);
      };

      applyHashRoute();

      if (!window.location.hash) {
        window.location.hash = "#home";
      }

      const handleHashChange = () => {
        currentRoute = getRouteFromHash(window.location.hash || "#home");
        updateMetaForRoute(currentRoute);
      };

      window.addEventListener("hashchange", handleHashChange);

      return () => {
        isActive = false;
        window.removeEventListener("hashchange", handleHashChange);
        mediaQuery.removeEventListener("change", handleMediaPreference);
      };
    }

    return () => {
      isActive = false;
    };
  });

  let ActiveComponent: RouteComponent = Home;
  $: ActiveComponent = ROUTES[currentRoute] ?? Home;
</script>

<header>
  <a class="subtle-link" href="#home" aria-label="Home" on:click={() => navigate("home")}>
    <h1>Vintage Story Calculator</h1>
    <p>Your companion for game calculations</p>
  </a>
  <div class="theme-selector">
    <button
      class="theme-toggle"
      type="button"
      on:click={toggleThemeSelector}
      aria-expanded={showThemeSelector}
      aria-label="Theme selector"
    >
      <span class="theme-toggle__icon" aria-hidden="true">🎨</span>
      <span class="theme-toggle__label">{currentThemeName}</span>
    </button>
    {#if showThemeSelector}
      <div class="theme-dropdown" role="menu">
        {#each themeEntries as [themeKey, themeName]}
          <button
            class="theme-option {theme === themeKey ? 'active' : ''}"
            type="button"
            role="menuitem"
            on:click={() => setTheme(themeKey, true)}
            data-theme={themeKey}
          >
            <span class="theme-preview"></span>
            {themeName}
          </button>
        {/each}
      </div>
    {/if}
  </div>
</header>

<main>
  <nav aria-label="Main navigation">
    <ul>
      {#each NAV_ITEMS as item}
        <li>
          <a
            href={item.hash}
            aria-current={currentRoute === item.id ? "page" : undefined}
            class:active={currentRoute === item.id}
            on:click|preventDefault={() => navigate(item.id)}
          >
            {item.label}
          </a>
        </li>
      {/each}
    </ul>
  </nav>

  <svelte:component this={ActiveComponent} />
</main>

<footer>
  <p>
    2025 | Vintage Story Calculator | Version:
    <span id="version"><a href="https://github.com/D-Heger/VintageStoryCalculator/releases">{version}</a> | <a href="https://github.com/D-Heger/VintageStoryCalculator/blob/release/CHANGELOG.md">Changelog</a></span>
  </p>
  <p>&copy; Developed by David Heger | Licensed under MIT</p>
  <p>
    Source code available on
    <a href="https://github.com/D-Heger/VintageStoryCalculator">GitHub</a>
  </p>
</footer>
