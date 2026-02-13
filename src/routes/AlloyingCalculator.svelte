<script lang="ts">
  import CalculatorCard from "../components/calculator-card.svelte";
  import NumberInput from "../components/number-input.svelte";
  import SelectInput from "../components/select-input.svelte";
  import alloyDefinitionsRaw from "../data/alloys.json";
  import { NUGGETS_PER_INGOT } from "../lib/constants";
  import {
    getProcessLine,
    getProcessStepLabel,
    getStackNote
  } from "../lib/stack-display";
  import {
    ALLOY_PERCENT_PRECISION,
    ALLOY_PERCENT_STEP,
    alloyCalculation,
    alloyCalculator,
    setMetalPercentage,
    setSelectedAlloy,
    setTargetIngots
  } from "../stores/alloyCalculator";
  import type { Alloy } from "../types/index";
  import type { SelectOption } from "../types/components";

  const alloys = alloyDefinitionsRaw as Record<string, Alloy>;

  const alloyKeys = Object.keys(alloys);
  const alloyOptions: Array<SelectOption<string>> = alloyKeys.map((key) => ({
    value: key,
    label: alloys[key]?.name ?? key
  }));

  const integerFormatter = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
    useGrouping: false
  });

  const formatQuantity = (value: number) =>
    integerFormatter.format(Number.isFinite(value) ? value : 0);

  const handleAlloyChange = (event: CustomEvent<{ value: string }>) => {
    setSelectedAlloy(event.detail.value);
  };

  const handleIngotsInput = (event: CustomEvent<{ value: number | null }>) => {
    setTargetIngots(event.detail.value);
  };

  const handlePercentInput = (metal: string, event: Event) => {
    const target = event.target as HTMLInputElement | null;
    const value = Number.parseFloat(target?.value ?? "");
    if (!Number.isFinite(value)) return;
    setMetalPercentage(metal, value);
  };
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
    value={$alloyCalculator.selectedAlloy}
    helpText="Pick the alloy recipe to calculate."
    on:change={handleAlloyChange}
  />

  <NumberInput
    id="targetIngots"
    label="Target ingots"
    value={$alloyCalculator.targetIngots}
    min={0}
    step={1}
    helpText="Total ingots to produce."
    on:input={handleIngotsInput}
  />
</div>

<div id="calculator">
  <p>
    Total units needed: <strong>{formatQuantity($alloyCalculation.totalUnits)}</strong>
  </p>
  <p>
    Smelting temperature: <strong>{$alloyCalculation.smeltTemp}</strong> | Compatible fuels:
    <strong>{$alloyCalculation.compatibleFuels}</strong>
  </p>

  <table aria-label="Alloy recipe">
    <thead>
      <tr>
        <th>Metal</th>
        <th title="Target percent range for each metal.">Recipe %</th>
        <th title="Units required to hit the target ingots.">Units needed</th>
        <th title="Total nuggets required for each metal.">Nuggets</th>
        <th title="Fine-tune the percent with a slider.">Adjust</th>
      </tr>
    </thead>
    <tbody>
      {#each $alloyCalculation.parts as part}
        <tr>
          <td data-label="Metal">{part.metal}</td>
          <td data-label="Recipe %">
            <input
              class="percent"
              type="number"
              inputmode="decimal"
              aria-label={`${part.metal} percent`}
              title={`Target ${part.metal} percent (${part.min}-${part.max}%).`}
              value={part.pct.toFixed(ALLOY_PERCENT_PRECISION)}
              min={part.min}
              max={part.max}
              step={ALLOY_PERCENT_STEP}
              on:input={(event) => handlePercentInput(part.metal, event)}
              on:change={(event) => handlePercentInput(part.metal, event)}
            />
          </td>
          <td class="units" data-label="Units needed">{formatQuantity(part.units)}</td>
          <td class="nuggets" data-label="Nuggets">{formatQuantity(part.nuggets)}</td>
          <td class="sliders" data-label="Adjust">
            <input
              class="slider"
              type="range"
              min={part.min}
              max={part.max}
              step={ALLOY_PERCENT_STEP}
              value={part.pct}
              aria-label={`${part.metal} percent slider`}
              title={`Adjust ${part.metal} percent (${part.min}-${part.max}%).`}
              on:input={(event) => handlePercentInput(part.metal, event)}
            />
          </td>
        </tr>
      {/each}
    </tbody>
  </table>

  <div class="bar" aria-label="Alloy blend proportions">
    {#each $alloyCalculation.barSegments as segment}
      <div
        class="segment"
        style={`flex:${segment.flex};background:${segment.color};`}
      >
        {segment.label}
      </div>
    {/each}
  </div>

  <div class="stack-summary">
    <div class="stack-header">
      <p class="stack-headline">
        Stacks needed: {formatQuantity($alloyCalculation.stackPlan.totalStacks ?? 0)}
      </p>
      <p class="stack-note">
        {getStackNote($alloyCalculation.hasStackInputs, $alloyCalculation.stackPlan)}
      </p>
    </div>
    <div class="process-list">
      {#each $alloyCalculation.stackPlan.processes ?? [] as process, idx}
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
