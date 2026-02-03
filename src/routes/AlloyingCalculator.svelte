<script>
  import { onMount } from "svelte";
  import AlloyCalculator from "../../scripts/alloy_calculator.js";

  let alloySelectEl;
  let ingotsInputEl;
  let calculatorContainer;
  let calculator;

  onMount(() => {
    calculator = new AlloyCalculator({
      container: calculatorContainer,
      alloySelect: alloySelectEl,
      ingotsInput: ingotsInputEl
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
      <option value="brass">Brass</option>
      <option value="tin_bronze">Tin Bronze</option>
      <option value="bismuth_bronze">Bismuth Bronze</option>
      <option value="black_bronze">Black Bronze</option>
      <option value="lead_solder">Lead Solder</option>
      <option value="molybdochalkos">Molybdochalkos</option>
      <option value="silver_solder">Silver Solder</option>
      <option value="electrum">Electrum</option>
      <option value="cupronickel">Cupronickel</option>
    </select>
  </div>

  <div class="control">
    <label for="targetIngots">Target ingots</label>
    <input id="targetIngots" bind:this={ingotsInputEl} type="number" value="10" min="0" step="1" />
  </div>
</div>

<div id="calculator" bind:this={calculatorContainer}></div>
