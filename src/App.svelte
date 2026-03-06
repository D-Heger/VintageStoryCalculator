<script lang="ts">
  import { onMount } from "svelte";
  import type { SvelteComponent } from "svelte";
  import Home from "./routes/Home.svelte";
  import AlloyingCalculator from "./routes/AlloyingCalculator.svelte";
  import CastingCalculator from "./routes/CastingCalculator.svelte";
  import SettingsModal from "./components/settings-modal.svelte";
  import { getProjectVersion } from "./lib/version";
  import { initTheme, setTheme } from "./stores/theme";
  import { initSettings, settings } from "./stores/settings";

  const NAV_ITEMS = [
    { id: "home", label: "Home", hash: "#home" },
    { id: "alloying", label: "Alloying Calculator", hash: "#alloying" },
    { id: "casting", label: "Casting Calculator", hash: "#casting" }
  ] as const;

  const CALCULATOR_NAV_ITEMS = NAV_ITEMS.filter((item) => item.id !== "home");

  type RouteId = (typeof NAV_ITEMS)[number]["id"];
  type RouteHash = (typeof NAV_ITEMS)[number]["hash"];
  type RouteComponent = new (...args: any[]) => SvelteComponent;

  const ROUTES: Record<RouteId, RouteComponent> = {
    home: Home,
    alloying: AlloyingCalculator,
    casting: CastingCalculator
  };

  let currentRoute: RouteId = "home";
  let version = "Loading...";
  let showSettings = false;
  let lastAppliedTheme: string | null = null;

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

  const toggleSettings = () => {
    showSettings = !showSettings;
  };

  const closeSettings = () => {
    showSettings = false;
  };

  const syncRouteFromHash = () => {
    if (typeof window === "undefined") return;
    currentRoute = getRouteFromHash(window.location.hash || "#home");
    updateMetaForRoute(currentRoute);
  };

  // Sync theme setting with theme store only when the theme changes
  $: if ($settings.theme && $settings.theme !== lastAppliedTheme) {
    lastAppliedTheme = $settings.theme;
    setTheme($settings.theme, false); // Don't persist again, settings store handles it
  }

  onMount(() => {
    let isActive = true;
    const cleanupSettings = initSettings();
    const cleanupTheme = initTheme($settings.theme);

    getProjectVersion().then((value) => {
      if (isActive) version = value;
    });

    if (typeof window !== "undefined") {
      syncRouteFromHash();

      if (!window.location.hash) {
        window.location.hash = "#home";
      }

      window.addEventListener("hashchange", syncRouteFromHash);

      return () => {
        isActive = false;
        window.removeEventListener("hashchange", syncRouteFromHash);
        cleanupTheme();
        cleanupSettings();
      };
    }

    return () => {
      isActive = false;
      cleanupTheme();
      cleanupSettings();
    };
  });

  let ActiveComponent: RouteComponent = Home;
  $: ActiveComponent = ROUTES[currentRoute] ?? Home;
</script>

<header>
  <a class="brand-link" href="#home" aria-label="Go to home" on:click|preventDefault={() => navigate("home")}>
    <h1 class="brand-name">Vintage Story Calculator</h1>
    <span class="brand-tagline">Tools for players</span>
  </a>

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

  <button
    class="settings-button"
    type="button"
    on:click={toggleSettings}
    aria-label="Open settings"
    title="Settings"
  >
    <span class="settings-icon" aria-hidden="true">⚙️</span>
  </button>
</header>

<SettingsModal isOpen={showSettings} onClose={closeSettings} />

<main>
  <svelte:component this={ActiveComponent} />
</main>

<footer>
  <div class="footer-inner">
    <div class="footer-brand">
      <strong>Vintage Story Calculator</strong>
      <span>© 2026 David Heger — MIT License</span>
    </div>
    <div class="footer-section">
      <span class="footer-heading">Calculators</span>
      <ul>
        {#each CALCULATOR_NAV_ITEMS as item}
          <li><a href={item.hash} on:click|preventDefault={() => navigate(item.id)}>{item.label}</a></li>
        {/each}
      </ul>
    </div>
    <div class="footer-section">
      <span class="footer-heading">Project</span>
      <ul>
        <li><a href="https://github.com/D-Heger/VintageStoryCalculator">GitHub</a></li>
        <li><a href="https://github.com/D-Heger/VintageStoryCalculator/releases">Version {version}</a></li>
        <li><a href="https://github.com/D-Heger/VintageStoryCalculator/blob/release/CHANGELOG.md">Changelog</a></li>
      </ul>
    </div>
  </div>
</footer>
