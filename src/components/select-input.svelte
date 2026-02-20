<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { SelectInputEvents, SelectInputProps } from "../types/components";
  import { showHelpText } from "../stores/settings";

  export let id: SelectInputProps["id"];
  export let label: SelectInputProps["label"];
  export let options: SelectInputProps["options"] = [];
  export let value: SelectInputProps["value"] = undefined;
  export let disabled: SelectInputProps["disabled"] = false;
  export let helpText: SelectInputProps["helpText"] = "";
  export let selectEl: SelectInputProps["selectEl"] = null;

  const dispatch = createEventDispatcher<SelectInputEvents>();

  const parseValue = (event: Event): string => {
    const target = event.target as HTMLSelectElement | null;
    return target?.value ?? "";
  };

  const handleInput = (event: Event) => {
    dispatch("input", { value: parseValue(event), rawEvent: event });
  };

  const handleChange = (event: Event) => {
    dispatch("change", { value: parseValue(event), rawEvent: event });
  };
  
  $: shouldShowHelp = $showHelpText && helpText;
</script>

<div class="control">
  <label for={id}>{label}</label>
  <select
    id={id}
    bind:this={selectEl}
    value={value}
    disabled={disabled}
    title={shouldShowHelp ? helpText : undefined}
    aria-describedby={shouldShowHelp ? `${id}-help` : undefined}
    on:input={handleInput}
    on:change={handleChange}
  >
    {#each options as option (option.value)}
      <option value={option.value} disabled={option.disabled}>{option.label}</option>
    {/each}
  </select>
  {#if shouldShowHelp}
    <p class="control-help" id={`${id}-help`}>{helpText}</p>
  {/if}
</div>
