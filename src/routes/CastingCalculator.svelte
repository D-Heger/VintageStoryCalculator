<script lang="ts">
  import { onMount } from "svelte";
  import CalculatorCard from "../components/calculator-card.svelte";
  import NumberInput from "../components/number-input.svelte";
  import SelectInput from "../components/select-input.svelte";
  import MetalCalculator, { METAL_DEFINITIONS } from "../../scripts/metal_calculator";
  import { NUGGETS_PER_INGOT, UNITS_PER_INGOT } from "../lib/constants";
  import type { Metal } from "../types/index";
  import type { SelectOption } from "../types/components";

  const metalDefinitions = METAL_DEFINITIONS as Record<string, Metal>;

  let metalSelectEl: HTMLSelectElement | null = null;
  let ingotsInputEl: HTMLInputElement | null = null;
  let calculatorContainer: HTMLDivElement | null = null;
  let calculator: MetalCalculator | undefined;
  const metalEntries = Object.entries(metalDefinitions) as Array<[string, Metal]>;
  const metalOptions: Array<SelectOption<string>> = metalEntries.map(([key, metal]) => ({
    value: key,
    label: metal.name
  }));

  onMount(() => {
    const calculatorOptions = {
      container: calculatorContainer,
      metalSelect: metalSelectEl,
      ingotsInput: ingotsInputEl,
      metals: metalDefinitions
    };

    calculator = new MetalCalculator(calculatorOptions);

    return () => {
      calculator?.destroy?.();
      calculator = undefined;
    };
  });

</script>

<CalculatorCard title="Casting Calculator">
  <p>
    Calculate the number of ore nuggets needed to cast your desired amount of metal ingots.
    Each metal ingot requires {NUGGETS_PER_INGOT} nuggets ({UNITS_PER_INGOT} units) to create in a crucible. Select your metal
    and target number of ingots to see the nuggets required and smelting information.
  </p>
</CalculatorCard>

<div class="controls">
  <SelectInput
    id="metalSelect"
    label="Choose metal"
    options={metalOptions}
    bind:selectEl={metalSelectEl}
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