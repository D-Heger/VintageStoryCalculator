<script lang="ts">
  import CalculatorCard from "../components/calculator-card.svelte";
  import ModeToggle from "../components/mode-toggle.svelte";
  import NumberInput from "../components/number-input.svelte";
  import ShareButton from "../components/share-button.svelte";
  import PitPreview from "../components/pit-preview.svelte";
  import { formatWholeNumber } from "../lib/numberFormatting";
  import {
    firewoodPerLog,
    firewoodPerStack,
    charcoalPerStack,
    maxPitDimension,
    minPitDimension,
    maxPossibleCharcoal
  } from "../lib/charcoal";
  import {
    charcoalCalculation,
    charcoalCalculator,
    setMode,
    setWidth,
    setDepth,
    setHeight,
    setTargetCharcoal
  } from "../stores/charcoalCalculator";
  import type { CalculationMode } from "../types/index";

  const formatQuantity = formatWholeNumber;

  const formatDecimal = (value: number): string => {
    if (Number.isInteger(value)) return String(value);
    return value.toFixed(1);
  };

  const handleModeChange = (event: CustomEvent<{ value: CalculationMode }>) => {
    setMode(event.detail.value);
  };

  const handleWidthInput = (event: CustomEvent<{ value: number | null }>) => {
    setWidth(event.detail.value);
  };

  const handleDepthInput = (event: CustomEvent<{ value: number | null }>) => {
    setDepth(event.detail.value);
  };

  const handleHeightInput = (event: CustomEvent<{ value: number | null }>) => {
    setHeight(event.detail.value);
  };

  const handleTargetInput = (event: CustomEvent<{ value: number | null }>) => {
    setTargetCharcoal(event.detail.value);
  };
</script>

<section class="calculator-shell">
  <aside class="calculator-rail" aria-label="Charcoal calculator controls">
    <CalculatorCard
      title="Charcoal Calculator"
      subtitle="Charcoal pit planning"
    >
      <p>
        {#if $charcoalCalculator.mode === "have"}
          Enter pit dimensions to calculate firewood and logs needed, plus
          expected charcoal yield.
        {:else}
          Enter your target charcoal amount and get a suggested pit size with
          resource requirements.
        {/if}
      </p>
    </CalculatorCard>

    <div class="controls">
      <ModeToggle
        mode={$charcoalCalculator.mode}
        needLabel="I need charcoal"
        haveLabel="I have a pit"
        on:change={handleModeChange}
      />

      {#if $charcoalCalculator.mode === "have"}
        <NumberInput
          id="pitWidth"
          label="Width"
          value={$charcoalCalculator.width}
          min={minPitDimension}
          max={maxPitDimension}
          step={1}
          helpText="Pit width in blocks ({minPitDimension}–{maxPitDimension})."
          on:input={handleWidthInput}
        />
        <NumberInput
          id="pitDepth"
          label="Depth"
          value={$charcoalCalculator.depth}
          min={minPitDimension}
          max={maxPitDimension}
          step={1}
          helpText="Pit depth in blocks ({minPitDimension}–{maxPitDimension})."
          on:input={handleDepthInput}
        />
        <NumberInput
          id="pitHeight"
          label="Height"
          value={$charcoalCalculator.height}
          min={minPitDimension}
          max={maxPitDimension}
          step={1}
          helpText="Pit height in blocks ({minPitDimension}–{maxPitDimension})."
          on:input={handleHeightInput}
        />
      {:else}
        <NumberInput
          id="targetCharcoal"
          label="Target charcoal"
          value={$charcoalCalculator.targetCharcoal}
          min={1}
          max={maxPossibleCharcoal}
          step={1}
          helpText="How much charcoal you want to produce (max {maxPossibleCharcoal})."
          on:input={handleTargetInput}
        />
      {/if}
    </div>

    <CalculatorCard title="Quick Summary" headingTag="h3">
      <div class="calculator-meta-grid">
        <p class="calculator-meta-item">
          <span>Pit volume</span>
          <strong>{formatQuantity($charcoalCalculation.volume)} blocks</strong>
        </p>
        <p class="calculator-meta-item">
          <span>Firewood stacks</span>
          <strong>{formatQuantity($charcoalCalculation.totalFirewoodStacks)}</strong>
        </p>
        <p class="calculator-meta-item charcoal-avg">
          <span>Avg charcoal</span>
          <strong>{formatDecimal($charcoalCalculation.charcoalAvg)}</strong>
        </p>
        <p class="calculator-meta-item">
          <span>Burn time</span>
          <strong>{$charcoalCalculation.burnTimeGameHours}h / {$charcoalCalculation.burnTimeRealMinutes}m</strong>
        </p>
      </div>
    </CalculatorCard>

    <ShareButton route="charcoal" />
  </aside>

  <section class="calculator-workspace" aria-label="Charcoal calculator results">
    <div id="calculator" class="calculator-main">
      {#if $charcoalCalculator.mode === "need"}
        <CalculatorCard title="Suggested Pit Size" headingTag="h3">
          <p class="suggested-note">
            To produce ~{formatQuantity($charcoalCalculator.targetCharcoal)} charcoal
            (using average yield of {charcoalPerStack.avg}/stack), you need at least:
          </p>
          <div class="suggested-dims">
            <span class="suggested-dim">{$charcoalCalculation.pitWidth}</span>
            <span class="suggested-sep">&times;</span>
            <span class="suggested-dim">{$charcoalCalculation.pitDepth}</span>
            <span class="suggested-sep">&times;</span>
            <span class="suggested-dim">{$charcoalCalculation.pitHeight}</span>
          </div>
        </CalculatorCard>
      {/if}

      <CalculatorCard title="Resources Required" headingTag="h3">
        <div class="calculator-meta-grid charcoal-resources-grid">
          <p class="calculator-meta-item">
            <span>Logs to chop</span>
            <strong>{formatQuantity($charcoalCalculation.totalLogs)}</strong>
          </p>
          <p class="calculator-meta-item">
            <span>Total firewood</span>
            <strong>{formatQuantity($charcoalCalculation.totalFirewood)}</strong>
          </p>
          <p class="calculator-meta-item">
            <span>Firewood stacks</span>
            <strong>{formatQuantity($charcoalCalculation.totalFirewoodStacks)} × {firewoodPerStack}</strong>
          </p>
        </div>
      </CalculatorCard>

      <CalculatorCard title="Charcoal Output &amp; Burn Time" headingTag="h3">
        <div class="calculator-meta-grid charcoal-yield-grid">
          <p class="calculator-meta-item">
            <span>Min yield</span>
            <strong>{formatQuantity($charcoalCalculation.charcoalMin)}</strong>
          </p>
          <p class="calculator-meta-item charcoal-avg">
            <span>Avg charcoal</span>
            <strong>{formatDecimal($charcoalCalculation.charcoalAvg)}</strong>
          </p>
          <p class="calculator-meta-item">
            <span>Max yield</span>
            <strong>{formatQuantity($charcoalCalculation.charcoalMax)}</strong>
          </p>
          <p class="calculator-meta-item">
            <span>Game time</span>
            <strong>{$charcoalCalculation.burnTimeGameHours}h</strong>
          </p>
          <p class="calculator-meta-item">
            <span>Real time</span>
            <strong>{$charcoalCalculation.burnTimeRealMinutes} min</strong>
          </p>
        </div>
      </CalculatorCard>

      <CalculatorCard title="Pit Preview" headingTag="h3">
        <PitPreview
          width={$charcoalCalculation.pitWidth}
          depth={$charcoalCalculation.pitDepth}
          height={$charcoalCalculation.pitHeight}
        />
      </CalculatorCard>

      <div class="charcoal-tip">
        <strong>Tip:</strong> After lighting the firepit on top of the pit,
        you have <strong>30 seconds</strong> to seal it completely with
        non-combustible blocks (dirt, stone, etc.) or the process will fail.
        All firewood stacks must be full ({firewoodPerStack} each), partial
        stacks produce nothing.
      </div>
    </div>
  </section>
</section>

<style>
  .charcoal-resources-grid {
    grid-template-columns: 1fr 1fr 1fr;
  }

  .charcoal-yield-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .charcoal-avg {
    border-color: var(--primary-color);
  }

  .charcoal-avg strong {
    font-size: 1.15rem;
    color: var(--primary-color);
  }

  .suggested-note {
    margin: 0 0 0.5rem;
    color: var(--text-secondary);
  }

  .suggested-dims {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 0;
  }

  .suggested-dim {
    font-family: var(--font-display);
    font-size: calc(2rem * var(--ui-scale, 1));
    font-weight: 700;
    color: var(--primary-color);
  }

  .suggested-sep {
    font-size: calc(1.5rem * var(--ui-scale, 1));
    color: var(--text-secondary);
  }

  .charcoal-tip {
    padding: calc(0.75rem * var(--ui-scale, 1));
    background: var(--surface-muted);
    border-left: 3px solid var(--primary-color);
    border-radius: 4px;
    font-size: calc(0.9rem * var(--ui-scale, 1));
    color: var(--text-secondary);
    line-height: 1.5;
  }

  .charcoal-tip strong {
    color: var(--text-primary);
  }

  @media (max-width: 600px) {
    .charcoal-resources-grid,
    .charcoal-yield-grid {
      grid-template-columns: 1fr 1fr;
    }
  }
</style>
