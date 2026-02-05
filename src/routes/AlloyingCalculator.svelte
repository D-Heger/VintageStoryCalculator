<script>
  import { onMount } from "svelte";
  import AlloyCalculator from "../../scripts/alloy_calculator.js";
  import alloys from "../data/alloys.json";

  let alloySelectEl;
  let ingotsInputEl;
  let calculatorContainer;
  let calculator;
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
    many nuggets of each metal to use.
  </p>
</div>

<div class="controls">
  <div class="control">
    <label for="alloySelect">Choose alloy</label>
    <select id="alloySelect" bind:this={alloySelectEl}>
      {#each alloyKeys as key (key)}
        <option value={key}>{alloys[key].name}</option>
      {/each}
    </select>
  </div>

  <div class="control">
    <label for="targetIngots">Target ingots</label>
    <input id="targetIngots" bind:this={ingotsInputEl} type="number" value="10" min="0" step="1" />
  </div>
</div>

<div id="calculator" bind:this={calculatorContainer}></div>
