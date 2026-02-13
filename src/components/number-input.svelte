<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { NumberInputEvents, NumberInputProps } from "../types/components";

  export let id: NumberInputProps["id"];
  export let label: NumberInputProps["label"];
  export let value: NumberInputProps["value"] = "";
  export let min: NumberInputProps["min"] = undefined;
  export let max: NumberInputProps["max"] = undefined;
  export let step: NumberInputProps["step"] = undefined;
  export let placeholder: NumberInputProps["placeholder"] = "";
  export let required: NumberInputProps["required"] = false;
  export let disabled: NumberInputProps["disabled"] = false;
  export let inputMode: NumberInputProps["inputMode"] = "numeric";
  export let helpText: NumberInputProps["helpText"] = "";
  export let inputEl: NumberInputProps["inputEl"] = null;

  const dispatch = createEventDispatcher<NumberInputEvents>();

  const parseValue = (event: Event) => {
    const raw = event.target as HTMLInputElement | null;
    const parsed = Number.parseFloat(raw?.value ?? "");
    return Number.isFinite(parsed) ? parsed : null;
  };

  const handleInput = (event: Event) => {
    dispatch("input", { value: parseValue(event), rawEvent: event });
  };

  const handleChange = (event: Event) => {
    dispatch("change", { value: parseValue(event), rawEvent: event });
  };
</script>

<div class="control">
  <label for={id}>{label}</label>
  <input
    id={id}
    bind:this={inputEl}
    type="number"
    value={value ?? ""}
    min={min}
    max={max}
    step={step}
    placeholder={placeholder}
    required={required}
    disabled={disabled}
    inputmode={inputMode}
    title={helpText || undefined}
    aria-describedby={helpText ? `${id}-help` : undefined}
    on:input={handleInput}
    on:change={handleChange}
  />
  {#if helpText}
    <p class="control-help" id={`${id}-help`}>{helpText}</p>
  {/if}
</div>
