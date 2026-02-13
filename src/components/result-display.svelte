<script lang="ts">
  import type { ResultDisplayProps } from "../types/components";

  export let label: ResultDisplayProps["label"];
  export let value: ResultDisplayProps["value"] = "-";
  export let valueId: ResultDisplayProps["valueId"] = undefined;
  export let helperText: ResultDisplayProps["helperText"] = "";
  export let size: ResultDisplayProps["size"] = "default";

  const getValueClassName = (variant: ResultDisplayProps["size"]) =>
    variant === "large" ? "result-value result-value--large" : "result-value";
</script>

<p class="result-display">
  <span class="result-label">{label}</span>
  <strong class={getValueClassName(size)} id={valueId}>{value}</strong>
  {#if helperText}
    <span class="result-note">{helperText}</span>
  {/if}
</p>
