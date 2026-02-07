<script lang="ts">
  import { onMount } from "svelte";
  import CalculatorCard from "../components/calculator-card.svelte";
  import NumberInput from "../components/number-input.svelte";
  import SelectInput from "../components/select-input.svelte";
  import AlloyCalculator, { ALLOY_DEFINITIONS } from "../../scripts/alloy_calculator";
  import { NUGGETS_PER_INGOT } from "../lib/constants";
  import type { Alloy } from "../types/index";
  import type { SelectOption } from "../types/components";

  const alloys = ALLOY_DEFINITIONS as Record<string, Alloy>;

  let alloySelectEl: HTMLSelectElement | null = null;
  let ingotsInputEl: HTMLInputElement | null = null;
  let calculatorContainer: HTMLDivElement | null = null;
  let calculator: AlloyCalculator | undefined;
  let alloyKeys = Object.keys(alloys);
  const alloyOptions: Array<SelectOption<string>> = alloyKeys.map((key) => ({
    value: key,
    label: alloys[key]?.name ?? key
  }));

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

<CalculatorCard title="Alloying Calculator">
  <p>
    Calculate the exact amounts of metals needed to create your desired alloy. Adjust the
    percentages to match the valid recipe ranges, and the calculator will show you how
    many nuggets of each metal to use. One ingot equals {NUGGETS_PER_INGOT} nuggets.
  </p>
</CalculatorCard>

<div class="controls">
  <SelectInput
    id="alloySelect"
    label="Choose alloy"
    options={alloyOptions}
    bind:selectEl={alloySelectEl}
  />

  <NumberInput
    id="targetIngots"
    label="Target ingots"
    value="10"
    min={0}
    step={1}
    bind:inputEl={ingotsInputEl}
  />
</div>

<div id="calculator" bind:this={calculatorContainer}></div>
