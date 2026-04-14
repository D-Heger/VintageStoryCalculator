<script lang="ts">
  import CalculatorCard from "../components/calculator-card.svelte";
  import NumberInput from "../components/number-input.svelte";
  import SelectInput from "../components/select-input.svelte";
  import ShareButton from "../components/share-button.svelte";
  import StackPlanPanel from "../components/stack-plan-panel.svelte";
  import { NUGGETS_PER_INGOT } from "../lib/constants";
  import { formatWholeNumber } from "../lib/numberFormatting";
  import {
    addMetal,
    allMetalKeys,
    getMetalName,
    removeMetal,
    setNuggets,
    toggleExpanded,
    usageFinder,
    usageFinderResults
  } from "../stores/usageFinder";
  import type { SelectOption } from "../types/components";

  const formatQuantity = formatWholeNumber;

  $: usedKeys = new Set($usageFinder.inventory.map((e) => e.metalKey));
  $: availableOptions = allMetalKeys
    .filter((key) => !usedKeys.has(key))
    .map((key): SelectOption<string> => ({ value: key, label: getMetalName(key) }));

  let addSelectValue = "";

  const handleAddMetal = (event: CustomEvent<{ value: string }>) => {
    const key = event.detail.value;
    if (!key) return;
    addMetal(key);
    addSelectValue = "";
  };

  const handleNuggetInput = (metalKey: string, event: CustomEvent<{ value: number | null }>) => {
    setNuggets(metalKey, event.detail.value ?? 0);
  };

  const handleRemove = (metalKey: string) => {
    removeMetal(metalKey);
  };

  const handleToggle = (key: string) => {
    toggleExpanded(key);
  };
</script>

<section class="calculator-shell">
  <aside class="calculator-rail" aria-label="Usage Finder controls">
    <CalculatorCard
      title="Usage Finder"
      subtitle="What can I make?"
    >
      <p>
        Add the metals you have and see everything you can craft. One ingot
        equals {NUGGETS_PER_INGOT} nuggets.
      </p>
    </CalculatorCard>

    <div class="controls">
      {#each $usageFinder.inventory as entry (entry.metalKey)}
        <div class="inventory-row">
          <div class="inventory-input">
            <NumberInput
              id="inv_{entry.metalKey}"
              label="{getMetalName(entry.metalKey)} nuggets"
              value={entry.nuggets}
              min={0}
              step={1}
              helpText=""
              on:input={(e) => handleNuggetInput(entry.metalKey, e)}
            />
          </div>
          <button
            class="inventory-remove"
            type="button"
            aria-label="Remove {getMetalName(entry.metalKey)}"
            title="Remove {getMetalName(entry.metalKey)}"
            on:click={() => handleRemove(entry.metalKey)}
          >×</button>
        </div>
      {/each}

      {#if availableOptions.length > 0}
        <SelectInput
          id="addMetal"
          label="Add metal"
          options={[{ value: "", label: "Select a metal…" }, ...availableOptions]}
          value={addSelectValue}
          helpText=""
          on:change={handleAddMetal}
        />
      {/if}
    </div>

    <CalculatorCard title="Quick Summary" headingTag="h3">
      <div class="calculator-meta-grid">
        <p class="calculator-meta-item">
          <span>Metals added</span>
          <strong>{$usageFinder.inventory.length}</strong>
        </p>
        <p class="calculator-meta-item">
          <span>Total nuggets</span>
          <strong>{formatQuantity($usageFinder.inventory.reduce((sum, e) => sum + e.nuggets, 0))}</strong>
        </p>
      </div>
    </CalculatorCard>

    <ShareButton route="usage" />
  </aside>

  <section class="calculator-workspace" aria-label="Usage Finder results">
    <div class="calculator-main usage-results">
      {#if $usageFinder.inventory.length === 0}
        <div class="usage-empty">
          <p>Add metals above to see what you can make.</p>
        </div>
      {:else if $usageFinderResults.length === 0}
        <div class="usage-empty">
          <p>Not enough nuggets for any recipe. You need at least {NUGGETS_PER_INGOT} nuggets of any metal.</p>
        </div>
      {:else}
        {#each $usageFinderResults as result (result.key)}
          <button
            class="result-card"
            class:result-card--expanded={$usageFinder.expandedResults.has(result.key)}
            type="button"
            aria-expanded={$usageFinder.expandedResults.has(result.key)}
            on:click={() => handleToggle(result.key)}
          >
            <div class="result-header">
              <span class="result-name">{result.name}</span>
              <span class="result-badge">{result.ingots} ingot{result.ingots !== 1 ? "s" : ""}</span>
              <span class="result-summary">{result.leftoverNuggets} leftover nugget{result.leftoverNuggets !== 1 ? "s" : ""}</span>
              <span class="result-chevron" aria-hidden="true">{$usageFinder.expandedResults.has(result.key) ? "▾" : "▸"}</span>
            </div>

            {#if $usageFinder.expandedResults.has(result.key)}
              <!-- svelte-ignore a11y-no-static-element-interactions -->
              <div class="result-details" on:click|stopPropagation on:keydown|stopPropagation>
                <table class="result-breakdown" aria-label="{result.name} breakdown">
                  <thead>
                    <tr>
                      <th>Metal</th>
                      <th>Available</th>
                      <th>Used</th>
                      <th>Leftover</th>
                    </tr>
                  </thead>
                  <tbody>
                    {#each result.details as detail}
                      <tr>
                        <td>{detail.metal}</td>
                        <td>{formatQuantity(detail.available)}</td>
                        <td>{formatQuantity(detail.used)}</td>
                        <td>{formatQuantity(detail.leftover)}</td>
                      </tr>
                    {/each}
                  </tbody>
                </table>

                <div class="result-meta">
                  <span><strong>Alloy temp:</strong> {result.smeltTemp}</span>
                  <span><strong>Fuels:</strong> {result.compatibleFuels}</span>
                </div>

                {#if result.ingredientFuels.length > 1}
                  <div class="ingredient-fuel-details">
                    <p class="ingredient-fuel-heading">Per-ingredient smelting</p>
                    {#each result.ingredientFuels as info}
                      <div class="ingredient-fuel-row">
                        <span class="ingredient-fuel-metal">{info.metal}</span>
                        <span class="ingredient-fuel-temp">{info.formattedTemp}</span>
                        <span class="ingredient-fuel-fuels">{info.formattedFuels}</span>
                      </div>
                    {/each}
                  </div>
                {/if}

                <StackPlanPanel
                  stackPlan={result.stackPlan}
                  hasStackInputs={result.hasStackInputs}
                  {formatQuantity}
                />
              </div>
            {/if}
          </button>
        {/each}
      {/if}
    </div>
  </section>
</section>
