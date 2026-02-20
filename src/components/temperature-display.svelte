<script lang="ts">
  import type { TemperatureDisplayProps } from "../types/components";
  import { showHelpText } from "../stores/settings";

  export let label: TemperatureDisplayProps["label"] = "Smelting Temperature";
  export let temperature: TemperatureDisplayProps["temperature"];
  export let unit: TemperatureDisplayProps["unit"] = "";
  export let valueId: TemperatureDisplayProps["valueId"] = undefined;
  export let helperText: TemperatureDisplayProps["helperText"] = "";

  const formatTemperature = (value: TemperatureDisplayProps["temperature"]) =>
    unit ? `${value}${unit}` : String(value);
  
  $: shouldShowHelp = $showHelpText && helperText;
</script>

<div class="info-row">
  <span class="info-label">{label}:</span>
  <span class="info-value" id={valueId}>{formatTemperature(temperature)}</span>
  {#if shouldShowHelp}
    <span class="info-note">{helperText}</span>
  {/if}
</div>
