<script lang="ts">
  import { onMount } from "svelte";
  import type { SvelteComponent } from "svelte";
  import Home from "./routes/Home.svelte";
  import AlloyingCalculator from "./routes/AlloyingCalculator.svelte";
  import CastingCalculator from "./routes/CastingCalculator.svelte";
  import SettingsModal from "./components/settings-modal.svelte";
  import IssueIntakeModal from "./components/issue-intake-modal.svelte";
  import { getProjectVersion } from "./lib/version";
  import { initTheme, setTheme } from "./stores/theme";
  import { initSettings, settings } from "./stores/settings";

  const NAV_ITEMS = [
    { id: "home", label: "Home", hash: "#home" },
    { id: "alloying", label: "Alloying Calculator", hash: "#alloying" },
    { id: "casting", label: "Casting Calculator", hash: "#casting" }
  ] as const;

  type RouteId = (typeof NAV_ITEMS)[number]["id"];
  type RouteHash = (typeof NAV_ITEMS)[number]["hash"];
  type RouteComponent = new (...args: any[]) => SvelteComponent;
  type IntakeMode = "feature" | "feedback" | "bug";

  const ROUTES: Record<RouteId, RouteComponent> = {
    home: Home,
    alloying: AlloyingCalculator,
    casting: CastingCalculator
  };

  let currentRoute: RouteId = "home";
  let version = "Loading...";
  let showSettings = false;
  let showIssueIntake = false;
  let issueIntakeMode: IntakeMode = "feedback";
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

  const openIssueIntake = (mode: IntakeMode = "feedback") => {
    issueIntakeMode = mode;
    showIssueIntake = true;
  };

  const closeIssueIntake = () => {
    showIssueIntake = false;
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
  <a class="subtle-link" href="#home" aria-label="Home" on:click={() => navigate("home")}>
    <h1>Vintage Story Calculator</h1>
    <p>Your companion for game calculations</p>
  </a>
  <div class="header-actions">
    <button
      class="settings-button"
      type="button"
      on:click={() => openIssueIntake("feedback")}
      aria-label="Open support panel"
      title="Feedback, feature requests, and bug reports"
    >
      <span class="settings-icon" aria-hidden="true">💬</span>
    </button>
    <button
      class="settings-button"
      type="button"
      on:click={toggleSettings}
      aria-label="Open settings"
      title="Settings"
    >
      <span class="settings-icon" aria-hidden="true">⚙️</span>
    </button>
  </div>
</header>

<SettingsModal isOpen={showSettings} onClose={closeSettings} />
<IssueIntakeModal isOpen={showIssueIntake} mode={issueIntakeMode} onClose={closeIssueIntake} />

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
    2026 | Vintage Story Calculator | Version:
    <span id="version"><a href="https://github.com/D-Heger/VintageStoryCalculator/releases">{version}</a> | <a href="https://github.com/D-Heger/VintageStoryCalculator/blob/release/CHANGELOG.md">Changelog</a></span>
  </p>
  <p>&copy; Developed by David Heger | Licensed under MIT</p>
  <p>
    Source code available on
    <a href="https://github.com/D-Heger/VintageStoryCalculator">GitHub</a>
  </p>
</footer>
