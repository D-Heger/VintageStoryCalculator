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

  let currentRoute = "home";
  let version = "Loading...";

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

  onMount(() => {
    let isActive = true;

    getProjectVersion().then((value) => {
      if (isActive) version = value;
    });

    if (typeof window !== "undefined") {
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
