<script lang="ts">
  import type { CalculatorCardProps } from "../types/components";

  export let title: CalculatorCardProps["title"];
  export let subtitle: CalculatorCardProps["subtitle"] = "";
  export let verifiedVersion: CalculatorCardProps["verifiedVersion"] = "";
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
  {#if subtitle || verifiedVersion}
    <div class="card-meta">
      {#if subtitle}
        <span class="card-subtitle">{subtitle}</span>
      {/if}
      {#if verifiedVersion}
        <span
          class="card-info-badge"
          aria-label={`Accuracy verified for Vintage Story ${verifiedVersion}`}
          title={`Accuracy verified for Vintage Story ${verifiedVersion}`}
        >
          Verified for {verifiedVersion}
        </span>
      {/if}
    </div>
  {/if}
  <slot />
</div>
