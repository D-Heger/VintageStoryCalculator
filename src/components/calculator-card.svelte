<script lang="ts">
  import type { CalculatorCardProps } from "../types/components";

  export let title: CalculatorCardProps["title"];
  export let subtitle: CalculatorCardProps["subtitle"] = "";
  export let headingTag: CalculatorCardProps["headingTag"] = "h2";
  export let className: CalculatorCardProps["className"] = "";

  $: cardClassName = getCardClassName(className ?? "");

  const getCardClassName = (value: string) => {
    const trimmed = value.trim();
    return trimmed ? `card ${trimmed}` : "card";
  };
</script>

<div class={cardClassName}>
  <svelte:element this={headingTag}>{title}</svelte:element>
  {#if subtitle}
    <p>{subtitle}</p>
  {/if}
  <slot />
</div>
