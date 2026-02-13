<script lang="ts">
  import type { TemperatureDisplayProps } from "../types/components";

  export let label: TemperatureDisplayProps["label"] = "Smelting Temperature";
  export let temperature: TemperatureDisplayProps["temperature"];
  export let unit: TemperatureDisplayProps["unit"] = "";
  export let valueId: TemperatureDisplayProps["valueId"] = undefined;
  export let helperText: TemperatureDisplayProps["helperText"] = "";

  const formatTemperature = (value: TemperatureDisplayProps["temperature"]) =>
    unit ? `${value}${unit}` : String(value);
</script>

<div class="info-row">
  <span class="info-label">{label}:</span>
  <span class="info-value" id={valueId}>{formatTemperature(temperature)}</span>
  {#if helperText}
    <span class="info-note">{helperText}</span>
  {/if}
</div>
