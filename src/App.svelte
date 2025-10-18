<script>
  import { onMount } from "svelte";
  import Home from "./routes/Home.svelte";
  import AlloyingCalculator from "./routes/AlloyingCalculator.svelte";
  import { getProjectVersion } from "./lib/version.js";

  const ROUTES = {
    home: Home,
    alloying: AlloyingCalculator
  };

  const NAV_ITEMS = [
    { id: "home", label: "Home", hash: "#home" },
    { id: "alloying", label: "Alloying Calculator", hash: "#alloying" }
  ];

  const THEMES = {
    "nature-light": "Nature Light",
    "nature-dark": "Nature Dark",
    "ocean-light": "Ocean Light",
    "ocean-dark": "Ocean Dark",
    "bauxite-light": "Bauxite Light",
    "bauxite-dark": "Bauxite Dark",
    "lavender-light": "Lavender Light",
    "lavender-dark": "Lavender Dark"
  };

  const THEME_STORAGE_KEY = "vsc-theme";

  let currentRoute = "home";
  let theme = "nature-light";
  let version = "Loading...";
  let showThemeSelector = false;

  const applyTheme = (value) => {
    if (typeof document === "undefined") return;
    document.documentElement.dataset.theme = value;
  };

  const setTheme = (value, persist = false) => {
    theme = value;
    applyTheme(value);
    if (persist && typeof window !== "undefined") {
      window.localStorage.setItem(THEME_STORAGE_KEY, value);
    }
    showThemeSelector = false;
  };

  const getRouteFromHash = (hash) => {
    if (hash === "#alloying") return "alloying";
    return "home";
  };

  const navigate = (routeId) => {
    if (typeof window === "undefined") {
      currentRoute = routeId;
      return;
    }
    const targetHash = NAV_ITEMS.find((item) => item.id === routeId)?.hash;
    if (!targetHash) return;
    if (window.location.hash !== targetHash) {
      window.location.hash = targetHash;
    } else {
      currentRoute = routeId;
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
      const hasStoredTheme = Object.keys(THEMES).includes(storedTheme);

      const resolvedTheme = hasStoredTheme
        ? storedTheme
        : mediaQuery.matches
          ? "nature-dark"
          : "nature-light";

      setTheme(resolvedTheme);

      const handleMediaPreference = (event) => {
        if (window.localStorage.getItem(THEME_STORAGE_KEY)) return;
        setTheme(event.matches ? "nature-dark" : "nature-light");
      };

      mediaQuery.addEventListener("change", handleMediaPreference);

      const applyHashRoute = () => {
        currentRoute = getRouteFromHash(window.location.hash || "#home");
      };

      applyHashRoute();

      if (!window.location.hash) {
        window.location.hash = "#home";
      }

      const handleHashChange = () => {
        currentRoute = getRouteFromHash(window.location.hash || "#home");
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
        {#each Object.entries(THEMES) as [themeKey, themeName]}
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
    <span id="version">{version}</span>
  </p>
  <p>&copy; Developed by David Heger | Licensed under MIT</p>
  <p>
    Source code available on
    <a href="https://github.com/D-Heger/VintageStoryCalculator">GitHub</a>
  </p>
</footer>
