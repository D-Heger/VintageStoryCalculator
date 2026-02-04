<script>
  import { onMount } from "svelte";
  import MetalCalculator from "../../scripts/metal_calculator.js";
  import { loadMetals, loadFuels } from "../lib/dataLoader.js";

  let metalSelectEl;
  let ingotsInputEl;
  let calculatorContainer;
  let calculator;
  let metals = {};
  let fuels = {};
  let loading = true;
  let error = null;

  onMount(async () => {
    try {
      // Load data
      [metals, fuels] = await Promise.all([loadMetals(), loadFuels()]);
      
      // Wait for next tick to ensure DOM is ready
      await new Promise(resolve => setTimeout(resolve, 0));
      
      calculator = new MetalCalculator({
        container: calculatorContainer,
        metalSelect: metalSelectEl,
        ingotsInput: ingotsInputEl,
        metals,
        fuels
      });
      
      loading = false;
    } catch (err) {
      console.error("Failed to load metal data:", err);
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
  <h2>Casting Calculator</h2>
  <p>
    Calculate the number of ore nuggets needed to cast your desired amount of metal ingots.
    Each metal ingot requires 20 nuggets (100 units) to create in a crucible. Select your metal
    and target number of ingots to see the nuggets required and smelting information.
  </p>
</div>

{#if loading}
  <div class="card">
    <p>Loading metal data...</p>
  </div>
{:else if error}
  <div class="card">
    <p class="error">{error}</p>
  </div>
{:else}
  <div class="controls">
    <div class="control">
      <label for="metalSelect">Choose metal</label>
      <select id="metalSelect" bind:this={metalSelectEl}>
        {#each Object.entries(metals) as [key, metal]}
          <option value={key}>{metal.name}</option>
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