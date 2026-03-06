<script lang="ts">
  import {
    getProcessLine,
    getProcessStepLabel,
    getStackNote
  } from "../lib/stack-display";
  import type { StackPlanPanelProps } from "../types/components";

  export let stackPlan: StackPlanPanelProps["stackPlan"];
  export let hasStackInputs: StackPlanPanelProps["hasStackInputs"];
  export let formatQuantity: StackPlanPanelProps["formatQuantity"];
</script>

<div class="stack-summary">
  <div class="stack-header">
    <div class="stack-heading-group">
      <p class="stack-headline">Smelting Stack Plan</p>
      <p class="stack-note">
        {getStackNote(hasStackInputs, stackPlan)}
      </p>
    </div>
    <div class="stack-metrics" aria-label="Stack plan summary">
      <p class="stack-metric">
        <span>Stacks needed</span>
        <strong>{formatQuantity(stackPlan.totalStacks ?? 0)}</strong>
      </p>
      <p class="stack-metric">
        <span>Processes</span>
        <strong>{formatQuantity(stackPlan.processes?.length ?? 0)}</strong>
      </p>
    </div>
  </div>
  <div class="process-list">
    {#each stackPlan.processes ?? [] as process, idx}
      <article class="process-card" aria-label={`Process ${idx + 1} stack layout`}>
        <div class="process-header">
          <div class="process-heading-group">
            <span class="process-title">Process {idx + 1}</span>
            <span class="process-line">{getProcessLine(process, formatQuantity)}</span>
          </div>
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
      </article>
    {/each}
  </div>
</div>