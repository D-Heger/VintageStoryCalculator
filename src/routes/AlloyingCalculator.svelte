<script>
  import { onMount, tick } from "svelte";
  import AlloyCalculator from "../../scripts/alloy_calculator.js";
  import { loadAlloys, loadFuels } from "../lib/dataLoader.js";

  let alloySelectEl;
  let ingotsInputEl;
  let calculatorContainer;
  let calculator;
  let alloys = {};
  let fuels = {};
  let loading = true;
  let error = null;

  // Initialize calculator after data loads and DOM updates
  $: if (!loading && alloySelectEl && ingotsInputEl && calculatorContainer && Object.keys(alloys).length > 0) {
    initCalculator();
  }

  async function initCalculator() {
    // Wait for DOM to be fully ready
    await tick();
    
    if (!calculator) {
      calculator = new AlloyCalculator({
        container: calculatorContainer,
        alloySelect: alloySelectEl,
        ingotsInput: ingotsInputEl,
        alloys,
        fuels
      });
    }
  }

  onMount(async () => {
    try {
      // Load data
      [alloys, fuels] = await Promise.all([loadAlloys(), loadFuels()]);
      loading = false;
    } catch (err) {
      console.error("Failed to load alloy data:", err);
      error = "Failed to load data. Please refresh the page.";
      loading = false;
    }

    return () => {
      calculator?.destroy?.();
      calculator = undefined;
    };
  });

</script>

<div class="card">
  <h2>Alloying Calculator</h2>
  <p>
    Calculate the exact amounts of metals needed to create your desired alloy. Adjust the
    percentages to match the valid recipe ranges, and the calculator will show you how
    many nuggets of each metal to use.
  </p>
</div>

{#if loading}
  <div class="card">
    <p>Loading alloy data...</p>
  </div>
{:else if error}
  <div class="card">
    <p class="error">{error}</p>
  </div>
{:else}
  <div class="controls">
    <div class="control">
      <label for="alloySelect">Choose alloy</label>
      <select id="alloySelect" bind:this={alloySelectEl}>
        {#each Object.entries(alloys) as [key, alloy]}
          <option value={key}>{alloy.name}</option>
        {/each}
      </select>
    </div>

    <div class="control">
      <label for="targetIngots">Target ingots</label>
      <input id="targetIngots" bind:this={ingotsInputEl} type="number" value="10" min="0" step="1" />
    </div>
  </div>

  <div id="calculator" bind:this={calculatorContainer}></div>
{/if}
