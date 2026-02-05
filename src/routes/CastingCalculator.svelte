<script>
  import { onMount } from "svelte";
  import MetalCalculator from "../../scripts/metal_calculator.js";
  import metalDefinitions from "../data/metals.json";
  import { NUGGETS_PER_INGOT, UNITS_PER_INGOT } from "../lib/constants.ts";

  let metalSelectEl;
  let ingotsInputEl;
  let calculatorContainer;
  let calculator;
  const metalEntries = Object.entries(metalDefinitions);

  onMount(() => {
    calculator = new MetalCalculator({
      container: calculatorContainer,
      metalSelect: metalSelectEl,
      ingotsInput: ingotsInputEl,
      metals: metalDefinitions
    });

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
    Each metal ingot requires {NUGGETS_PER_INGOT} nuggets ({UNITS_PER_INGOT} units) to create in a crucible. Select your metal
    and target number of ingots to see the nuggets required and smelting information.
  </p>
</div>

<div class="controls">
  <div class="control">
    <label for="metalSelect">Choose metal</label>
    <select id="metalSelect" bind:this={metalSelectEl}>
      {#each metalEntries as [key, metal]}
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