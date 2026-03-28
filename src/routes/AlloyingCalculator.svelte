<script lang="ts">
  import CalculatorCard from "../components/calculator-card.svelte";
  import NumberInput from "../components/number-input.svelte";
  import SelectInput from "../components/select-input.svelte";
  import ShareButton from "../components/share-button.svelte";
  import StackPlanPanel from "../components/stack-plan-panel.svelte";
  import alloyDefinitionsRaw from "../data/alloys.json";
  import { NUGGETS_PER_INGOT } from "../lib/constants";
  import { formatWholeNumber } from "../lib/numberFormatting";
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

  const formatQuantity = formatWholeNumber;

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

<section class="calculator-shell">
  <aside class="calculator-rail" aria-label="Alloy calculator controls">
    <CalculatorCard
      title="Alloying Calculator"
      subtitle="Blend planning"
    >
      <p>
        Calculate exact metal amounts for each alloy recipe. One ingot equals
        {NUGGETS_PER_INGOT} nuggets.
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

    <CalculatorCard title="Quick Summary" headingTag="h3">
      <div class="calculator-meta-grid">
        <p class="calculator-meta-item">
          <span>Total units</span>
          <strong>{formatQuantity($alloyCalculation.totalUnits)}</strong>
        </p>
        <p class="calculator-meta-item">
          <span>Smelting temp</span>
          <strong>{$alloyCalculation.smeltTemp}</strong>
        </p>
        <p class="calculator-meta-item calculator-meta-item--full">
          <span>Compatible fuels</span>
          <strong>{$alloyCalculation.compatibleFuels}</strong>
        </p>
      </div>
    </CalculatorCard>

    <ShareButton route="alloying" />
  </aside>

  <section class="calculator-workspace" aria-label="Alloy recipe results">
    <div id="calculator" class="calculator-main">
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

      <StackPlanPanel
        stackPlan={$alloyCalculation.stackPlan}
        hasStackInputs={$alloyCalculation.hasStackInputs}
        {formatQuantity}
      />
    </div>
  </section>
</section>
