<script lang="ts">
  import { onMount } from "svelte";
  import AlloyCalculator, { ALLOY_DEFINITIONS } from "../../scripts/alloy_calculator";
  import { NUGGETS_PER_INGOT } from "../lib/constants";
  import type { Alloy } from "../types/index";

  const alloys = ALLOY_DEFINITIONS as Record<string, Alloy>;

  let alloySelectEl: HTMLSelectElement | null = null;
  let ingotsInputEl: HTMLInputElement | null = null;
  let calculatorContainer: HTMLDivElement | null = null;
  let calculator: AlloyCalculator | undefined;
  let alloyKeys = Object.keys(alloys);

  onMount(() => {
    calculator = new AlloyCalculator({
      container: calculatorContainer,
      alloySelect: alloySelectEl,
      ingotsInput: ingotsInputEl,
      alloys: alloys
    });

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
    many nuggets of each metal to use. One ingot equals {NUGGETS_PER_INGOT} nuggets.
  </p>
</div>

<div class="controls">
  <div class="control">
    <label for="alloySelect">Choose alloy</label>
    <select id="alloySelect" bind:this={alloySelectEl}>
      {#each alloyKeys as key (key)}
        <option value={key}>{alloys[key]?.name ?? key}</option>
      {/each}
    </select>
  </div>

  <div class="control">
    <label for="targetIngots">Target ingots</label>
    <input id="targetIngots" bind:this={ingotsInputEl} type="number" value="10" min="0" step="1" />
  </div>
</div>

<div id="calculator" bind:this={calculatorContainer}></div>
