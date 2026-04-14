<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { CalculationMode } from "../types/index";

  export let mode: CalculationMode = "need";

  const dispatch = createEventDispatcher<{ change: { value: CalculationMode } }>();

  const handleClick = (selected: CalculationMode) => {
    if (selected === mode) return;
    dispatch("change", { value: selected });
  };
</script>

<div class="mode-toggle" role="radiogroup" aria-label="Calculation direction">
  <button
    type="button"
    role="radio"
    aria-checked={mode === "need"}
    class:active={mode === "need"}
    on:click={() => handleClick("need")}
  >
    I need ingots
  </button>
  <button
    type="button"
    role="radio"
    aria-checked={mode === "have"}
    class:active={mode === "have"}
    on:click={() => handleClick("have")}
  >
    I have nuggets
  </button>
</div>
