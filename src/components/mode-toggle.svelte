<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { CalculationMode } from "../types/index";

  export let mode: CalculationMode = "need";
  export let needLabel: string = "I need ingots";
  export let haveLabel: string = "I have nuggets";

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
    {needLabel}
  </button>
  <button
    type="button"
    role="radio"
    aria-checked={mode === "have"}
    class:active={mode === "have"}
    on:click={() => handleClick("have")}
  >
    {haveLabel}
  </button>
</div>
