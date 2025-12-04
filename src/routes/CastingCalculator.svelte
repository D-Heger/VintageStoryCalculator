<script>
  import { onMount } from "svelte";
  import MetalCalculator from "../../scripts/metal_calculator.js";

  let metalSelectEl;
  let ingotsInputEl;
  let calculatorContainer;
  let calculator;

  onMount(() => {
    calculator = new MetalCalculator({
      container: calculatorContainer,
      metalSelect: metalSelectEl,
      ingotsInput: ingotsInputEl
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
    Each metal ingot requires 20 nuggets (100 units) to create in a crucible. Select your metal
    and target number of ingots to see the nuggets required and smelting information.
  </p>
</div>

<div class="controls">
  <div class="control">
    <label for="metalSelect">Choose metal</label>
    <select id="metalSelect" bind:this={metalSelectEl}>
      <option value="copper">Copper</option>
      <option value="gold">Gold</option>
      <option value="silver">Silver</option>
      <option value="tin">Tin</option>
      <option value="zinc">Zinc</option>
      <option value="bismuth">Bismuth</option>
      <option value="lead">Lead</option>
      <option value="nickel">Nickel</option>
    </select>
  </div>

  <div class="control">
    <label for="targetIngots">Target ingots</label>
    <input id="targetIngots" bind:this={ingotsInputEl} type="number" value="10" min="0" step="1" />
  </div>
</div>

<div id="calculator" bind:this={calculatorContainer}></div>