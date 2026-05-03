<script lang="ts">
  import { onMount } from "svelte";
  import type { SvelteComponent } from "svelte";
  import Home from "./routes/Home.svelte";
  import AlloyingCalculator from "./routes/AlloyingCalculator.svelte";
  import CastingCalculator from "./routes/CastingCalculator.svelte";
  import CharcoalCalculator from "./routes/CharcoalCalculator.svelte";
  import UsageFinder from "./routes/UsageFinder.svelte";
  import Feedback from "./routes/Feedback.svelte";
  import Privacy from "./routes/Privacy.svelte";
  import SettingsModal from "./components/settings-modal.svelte";
  import { getProjectVersion } from "./lib/version";
  import { initTheme, setTheme } from "./stores/theme";
  import { initSettings, settings } from "./stores/settings";
  import {
    getRouteFromHash as parseRouteFromHash,
    applyUrlState,
    applyUrlStateFromSearch,
    getCanonicalPathForRoute,
    getRouteFromPath,
    getRouteFromSearch,
    hasShareParams,
    hasShareParamsInSearch
  } from "./lib/url-state";
  import { setupShareCodecs } from "./stores/share";

  const NAV_ITEMS = [
    { id: "home", label: "Home", path: "/" },
    { id: "alloying", label: "Alloying Calculator", path: "/alloying/" },
    { id: "casting", label: "Casting Calculator", path: "/casting/" },
    { id: "charcoal", label: "Charcoal Calculator", path: "/charcoal/" },
    { id: "usage", label: "Usage Finder", path: "/usage-finder/" },
    { id: "feedback", label: "Feedback", path: "/feedback/" },
    { id: "privacy", label: "Privacy", path: "/privacy/" }
  ] as const;

  const CALCULATOR_NAV_ITEMS = NAV_ITEMS.filter(
    (item) => item.id === "alloying" || item.id === "casting" || item.id === "charcoal" || item.id === "usage"
  );

  type RouteId = (typeof NAV_ITEMS)[number]["id"];
  type RouteComponent = new (...args: any[]) => SvelteComponent;

  const ROUTES: Record<RouteId, RouteComponent> = {
    home: Home,
    alloying: AlloyingCalculator,
    casting: CastingCalculator,
    charcoal: CharcoalCalculator,
    usage: UsageFinder,
    feedback: Feedback,
    privacy: Privacy
  };

  let currentRoute: RouteId = "home";
  let version = "Loading...";
  let showSettings = false;
  let lastAppliedTheme: string | null = null;

  const normalizeRouteId = (route: string | null | undefined): RouteId | null => {
    if (route === "alloying") return "alloying";
    if (route === "casting") return "casting";
    if (route === "charcoal") return "charcoal";
    if (route === "usage") return "usage";
    if (route === "feedback") return "feedback";
    if (route === "privacy") return "privacy";
    if (route === "home") return "home";
    return null;
  };

  const getRouteFromHash = (hash: string): RouteId | null => {
    return normalizeRouteId(parseRouteFromHash(hash));
  };

  const navigate = (routeId: RouteId) => {
    if (typeof window === "undefined") {
      currentRoute = routeId;
      return;
    }
    const targetPath = getCanonicalPathForRoute(routeId);
    const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (currentPath !== targetPath) {
      window.history.pushState({ routeId }, "", targetPath);
    }
    currentRoute = routeId;
    updateMetaForRoute(routeId);
  };

  const updateMetaForRoute = (routeId: RouteId) => {
    if (typeof document === "undefined") return;
    const baseTitle = "Vintage Story Calculator";
    const titles = {
      home: `${baseTitle} — Home`,
      alloying: `${baseTitle} — Alloying Calculator`,
      casting: `${baseTitle} — Casting Calculator`,
      charcoal: `${baseTitle} — Charcoal Calculator`,
      usage: `${baseTitle} — Usage Finder`,
      feedback: `${baseTitle} — Feedback`,
      privacy: `${baseTitle} — Privacy`
    };
    const descriptions = {
      home:
        "Svelte-powered calculators for Vintage Story. Plan alloys, resources, and smelting with precise, game-accurate math.",
      alloying:
        "Calculate exact metal ratios and nuggets for Vintage Story alloys like Tin Bronze, Bismuth Bronze, Electrum, and more.",
      casting:
        "Calculate ore nuggets needed to cast metal ingots in Vintage Story. Supports all castable metals including Copper, Gold, Silver, and more.",
      charcoal:
        "Plan charcoal pit dimensions, calculate firewood and logs needed, and estimate charcoal yield for Vintage Story.",
      usage:
        "Enter the metals you have and discover every alloy and casting option available to you in Vintage Story.",
      feedback:
        "Send feedback for Vintage Story Calculator without creating an account. Report bugs, request features, and share ideas.",
      privacy:
        "Privacy notice for Vintage Story Calculator feedback processing, retention policy, and user data rights."
    };

    const title = titles[routeId] || baseTitle;
    const description = descriptions[routeId] || descriptions.home;
    const canonicalUrl = `https://vintagecalc.eu${getCanonicalPathForRoute(routeId)}`;
    const hasSharedState =
      typeof window !== "undefined" &&
      (hasShareParams(window.location.hash) || hasShareParamsInSearch(window.location.search));
    const robots = hasSharedState ? "noindex, follow" : "index, follow";

    document.title = title;

    const setMeta = (selector: string, content: string) => {
      const node = document.querySelector(selector);
      if (node) {
        node.setAttribute("content", content);
      }
    };

    const setLink = (selector: string, href: string) => {
      const node = document.querySelector(selector);
      if (node) {
        node.setAttribute("href", href);
      }
    };

    setMeta('meta[name="description"]', description);
    setMeta('meta[name="robots"]', robots);
    setMeta('meta[name="googlebot"]', `${robots}, max-image-preview:large`);
    setMeta('meta[property="og:title"]', title);
    setMeta('meta[property="og:description"]', description);
    setMeta('meta[property="og:url"]', canonicalUrl);
    setMeta('meta[name="twitter:title"]', title);
    setMeta('meta[name="twitter:description"]', description);
    setLink('link[rel="canonical"]', canonicalUrl);
  };

  const toggleSettings = () => {
    showSettings = !showSettings;
  };

  const closeSettings = () => {
    showSettings = false;
  };

  const syncRouteFromLocation = () => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    const routeFromHash = hash ? getRouteFromHash(hash) : null;
    const routeFromSearch = normalizeRouteId(getRouteFromSearch(window.location.search));
    const routeFromPath = normalizeRouteId(getRouteFromPath(window.location.pathname));

    currentRoute = routeFromHash ?? routeFromSearch ?? routeFromPath ?? "home";
    updateMetaForRoute(currentRoute);

    if (routeFromHash === currentRoute && hash && hasShareParams(hash)) {
      applyUrlState(hash);
    } else if (routeFromSearch === currentRoute && hasShareParamsInSearch(window.location.search)) {
      applyUrlStateFromSearch(window.location.search);
    }
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
    setupShareCodecs();

    getProjectVersion().then((value) => {
      if (isActive) version = value;
    });

    if (typeof window !== "undefined") {
      syncRouteFromLocation();

      window.addEventListener("hashchange", syncRouteFromLocation);
      window.addEventListener("popstate", syncRouteFromLocation);

      return () => {
        isActive = false;
        window.removeEventListener("hashchange", syncRouteFromLocation);
        window.removeEventListener("popstate", syncRouteFromLocation);
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
  <a class="brand-link" href="/" aria-label="Go to home" on:click|preventDefault={() => navigate("home")}>
    <h1 class="brand-name">Vintage Story Calculator</h1>
    <span class="brand-tagline">Tools for players</span>
  </a>

  <nav aria-label="Main navigation">
    <ul>
      {#each NAV_ITEMS as item}
        <li>
          <a
            href={item.path}
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
          <li><a href={item.path} on:click|preventDefault={() => navigate(item.id)}>{item.label}</a></li>
        {/each}
      </ul>
    </div>
    <div class="footer-section">
      <span class="footer-heading">Project</span>
      <ul>
        <li><a href="https://github.com/D-Heger/VintageStoryCalculator">GitHub</a></li>
        <li><a href="https://github.com/D-Heger/VintageStoryCalculator/releases">Version {version}</a></li>
        <li><a href="https://github.com/D-Heger/VintageStoryCalculator/blob/release/CHANGELOG.md">Changelog</a></li>
        <li><a href="/privacy/" on:click|preventDefault={() => navigate("privacy")}>Privacy</a></li>
      </ul>
    </div>
  </div>
</footer>
