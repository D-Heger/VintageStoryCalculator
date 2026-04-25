<script lang="ts">
  import CalculatorCard from "../components/calculator-card.svelte";
  import ModeToggle from "../components/mode-toggle.svelte";
  import NumberInput from "../components/number-input.svelte";
  import SelectInput from "../components/select-input.svelte";
  import ShareButton from "../components/share-button.svelte";
  import StackPlanPanel from "../components/stack-plan-panel.svelte";
  import metalDefinitionsRaw from "../data/metals.json";
  import { NUGGETS_PER_INGOT, UNITS_PER_INGOT } from "../lib/constants";
  import { formatWholeNumber } from "../lib/numberFormatting";
  import { VERIFIED_TOOL_VERSIONS } from "../lib/toolVerification";
  import {
    metalCalculation,
    metalCalculator,
    setInputValue,
    setMode,
    setSelectedMetal
  } from "../stores/metalCalculator";
  import type { CalculationMode, Metal } from "../types/index";
  import type { SelectOption } from "../types/components";

  const metalDefinitions = metalDefinitionsRaw as Record<string, Metal>;

  const metalEntries = Object.entries(metalDefinitions) as Array<[string, Metal]>;
  const metalOptions: Array<SelectOption<string>> = metalEntries.map(([key, metal]) => ({
    value: key,
    label: metal.name
  }));

  const formatQuantity = formatWholeNumber;

  const handleMetalChange = (event: CustomEvent<{ value: string }>) => {
    setSelectedMetal(event.detail.value);
  };

  const handleModeChange = (event: CustomEvent<{ value: CalculationMode }>) => {
    setMode(event.detail.value);
  };

  const handleValueInput = (event: CustomEvent<{ value: number | null }>) => {
    setInputValue(event.detail.value);
  };
</script>

<section class="calculator-shell">
  <aside class="calculator-rail" aria-label="Casting calculator controls">
    <CalculatorCard
      title="Casting Calculator"
      subtitle="Ore to ingot planning"
      verifiedVersion={VERIFIED_TOOL_VERSIONS.casting}
    >
      <p>
        {#if $metalCalculator.mode === "have"}
          See how many ingots you can cast from your available nuggets. Each ingot uses
          {NUGGETS_PER_INGOT} nuggets ({UNITS_PER_INGOT} units).
        {:else}
          Calculate ore nuggets required for your target ingot count. Each ingot uses
          {NUGGETS_PER_INGOT} nuggets ({UNITS_PER_INGOT} units).
        {/if}
      </p>
    </CalculatorCard>

    <div class="controls">
      <ModeToggle mode={$metalCalculator.mode} on:change={handleModeChange} />

      <SelectInput
        id="metalSelect"
        label="Choose metal"
        options={metalOptions}
        value={$metalCalculator.selectedMetal}
        helpText="Pick the metal you want to cast."
        on:change={handleMetalChange}
      />

      {#if $metalCalculator.mode === "have"}
        <NumberInput
          id="availableNuggets"
          label="Available nuggets"
          value={$metalCalculator.inputValue}
          min={0}
          step={1}
          helpText="How many nuggets you have."
          on:input={handleValueInput}
        />
      {:else}
        <NumberInput
          id="targetIngots"
          label="Target ingots"
          value={$metalCalculator.inputValue}
          min={0}
          step={1}
          helpText="Total ingots to cast."
          on:input={handleValueInput}
        />
      {/if}
    </div>

    <CalculatorCard title="Quick Summary" headingTag="h3">
      <div class="calculator-meta-grid">
        {#if $metalCalculator.mode === "have"}
          <p class="calculator-meta-item">
            <span>Ingots produced</span>
            <strong>{formatQuantity($metalCalculation.producedIngots)}</strong>
          </p>
          <p class="calculator-meta-item">
            <span>Leftover nuggets</span>
            <strong>{formatQuantity($metalCalculation.remainderNuggets)}</strong>
          </p>
        {:else}
          <p class="calculator-meta-item">
            <span>Nuggets needed</span>
            <strong>{formatQuantity($metalCalculation.nuggetsNeeded)}</strong>
          </p>
        {/if}
        <p class="calculator-meta-item">
          <span>Smelting temp</span>
          <strong>{$metalCalculation.smeltTemp}</strong>
        </p>
        <p class="calculator-meta-item calculator-meta-item--full">
          <span>Compatible fuels</span>
          <strong>{$metalCalculation.compatibleFuels}</strong>
        </p>
        <p class="calculator-meta-item calculator-meta-item--full">
          <span>Ore sources</span>
          <strong>{$metalCalculation.oreSources}</strong>
        </p>
      </div>
    </CalculatorCard>

    <ShareButton route="casting" />
  </aside>

  <section class="calculator-workspace" aria-label="Casting calculator results">
    <div id="calculator" class="calculator-main">
      <div class="bar" aria-label="Metal color preview">
        <div
          class="segment"
          style={`flex:1;background:${$metalCalculation.metalColor};`}
        >
          {$metalCalculation.metalName || "-"}
        </div>
      </div>

      <StackPlanPanel
        stackPlan={$metalCalculation.stackPlan}
        hasStackInputs={$metalCalculation.hasStackInputs}
        {formatQuantity}
      />
    </div>
  </section>
</section>