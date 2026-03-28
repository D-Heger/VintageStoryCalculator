<script lang="ts">
  import { onDestroy } from "svelte";
  import { buildShareUrl } from "../lib/url-state";

  export let route: string;

  let copied = false;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const copyToClipboard = async (text: string): Promise<void> => {
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text);
        return;
      } catch {
        // Fall back to the textarea approach if writeText fails
      }
    }
    // Fallback for insecure contexts or when writeText fails
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  };

  const handleClick = async () => {
    try {
      const url = buildShareUrl(route);
      await copyToClipboard(url);
      copied = true;
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        copied = false;
      }, 2000);
    } catch {
      // Silently fail — clipboard access may be blocked
    }
  };

  onDestroy(() => {
    clearTimeout(timeoutId);
  });
</script>

<button
  class="share-button"
  class:share-button--copied={copied}
  type="button"
  on:click={handleClick}
  aria-label={copied ? "Link copied to clipboard" : "Copy shareable link"}
  title={copied ? "Copied!" : "Share this recipe"}
>
  {#if copied}
    <svg class="share-button__icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4 10.5l4 4 8-9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <span class="share-button__label">Copied!</span>
  {:else}
    <svg class="share-button__icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M8 12a3 3 0 0 0 4.243 0l2.828-2.829a3 3 0 0 0-4.243-4.243L9.586 6.172" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M12 8a3 3 0 0 0-4.243 0L4.929 10.83a3 3 0 1 0 4.243 4.242l1.242-1.243" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <span class="share-button__label">Share recipe</span>
  {/if}
</button>
