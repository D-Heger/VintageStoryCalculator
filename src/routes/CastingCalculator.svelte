<script lang="ts">
  import CalculatorCard from "../components/calculator-card.svelte";
  import NumberInput from "../components/number-input.svelte";
  import SelectInput from "../components/select-input.svelte";
  import metalDefinitionsRaw from "../data/metals.json";
  import { NUGGETS_PER_INGOT, UNITS_PER_INGOT } from "../lib/constants";
  import {
    getProcessLine,
    getProcessStepLabel,
    getStackNote
  } from "../lib/stack-display";
  import {
    metalCalculation,
    metalCalculator,
    setSelectedMetal,
    setTargetIngots
  } from "../stores/metalCalculator";
  import type { Metal } from "../types/index";
  import type { SelectOption } from "../types/components";

  const metalDefinitions = metalDefinitionsRaw as Record<string, Metal>;

  const metalEntries = Object.entries(metalDefinitions) as Array<[string, Metal]>;
  const metalOptions: Array<SelectOption<string>> = metalEntries.map(([key, metal]) => ({
    value: key,
    label: metal.name
  }));

  const integerFormatter = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
    useGrouping: false
  });

  const formatQuantity = (value: number) =>
    integerFormatter.format(Number.isFinite(value) ? value : 0);

  const handleMetalChange = (event: CustomEvent<{ value: string }>) => {
    setSelectedMetal(event.detail.value);
  };

  const handleIngotsInput = (event: CustomEvent<{ value: number | null }>) => {
    setTargetIngots(event.detail.value);
  };
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
    value={$metalCalculator.selectedMetal}
    helpText="Pick the metal you want to cast."
    on:change={handleMetalChange}
  />

  <NumberInput
    id="targetIngots"
    label="Target ingots"
    value={$metalCalculator.targetIngots}
    min={0}
    step={1}
    helpText="Total ingots to cast."
    on:input={handleIngotsInput}
  />
</div>

<div id="calculator">
  <p>
    Nuggets needed: <strong>{formatQuantity($metalCalculation.nuggetsNeeded)}</strong>
  </p>

  <div class="metal-info" id="metalInfo">
    <div class="info-row">
      <span class="info-label">Metal:</span>
      <span class="info-value">{$metalCalculation.metalName || "-"}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Smelting Temperature:</span>
      <span class="info-value">{$metalCalculation.smeltTemp}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Compatible Fuels:</span>
      <span class="info-value">{$metalCalculation.compatibleFuels}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Ore Sources:</span>
      <span class="info-value">{$metalCalculation.oreSources}</span>
    </div>
  </div>

  <div class="bar" aria-label="Metal color preview">
    <div
      class="segment"
      style={`flex:1;background:${$metalCalculation.metalColor};`}
    >
      {$metalCalculation.metalName || "-"}
    </div>
  </div>

  <div class="stack-summary">
    <div class="stack-header">
      <p class="stack-headline">
        Stacks needed: {formatQuantity($metalCalculation.stackPlan.totalStacks ?? 0)}
      </p>
      <p class="stack-note">
        {getStackNote($metalCalculation.hasStackInputs, $metalCalculation.stackPlan)}
      </p>
    </div>
    <div class="process-list">
      {#each $metalCalculation.stackPlan.processes ?? [] as process, idx}
        <div class="process-card" aria-label={`Process ${idx + 1} stack layout`}>
          <div class="process-header">
            <span class="process-title">Process {idx + 1}</span>
            <span class="process-line">{getProcessLine(process, formatQuantity)}</span>
            <span
              class="process-step"
              class:process-valid={process.isIngotStepValid !== false}
              class:process-invalid={process.isIngotStepValid === false}
              title={process.isIngotStepValid === false
                ? "Batch size should be a multiple of 100 units (20 nuggets)."
                : "Batch size matches the 100-unit (20 nugget) step."}
            >
              {getProcessStepLabel(process)}
            </span>
          </div>
          <div class="stack-row pairs">
            {#if process.stacks.length}
              {#each process.stacks as stack}
                <div class="stack-pair" aria-label={`${stack.metal} stack`}>
                  <span class="stack-chip">{formatQuantity(stack.amount)}</span>
                  <span
                    class="stack-label"
                    style={`--stack-color:${stack.color || "var(--primary-color)"}`}
                  >
                    {stack.metal}
                  </span>
                </div>
              {/each}
            {:else}
              -
            {/if}
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>