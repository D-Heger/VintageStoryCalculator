<script lang="ts">
  import { settings, updateSetting, resetSettings, fontFamilyEntries, uiScaleEntries, type FontFamilyKey, type UIScaleKey } from "../stores/settings";
  import { themeEntries, type ThemeKey } from "../stores/theme";
  
  export let isOpen = false;
  export let onClose: () => void;
  
  let activeSection: "appearance" | "accessibility" = "appearance";
  
  const handleThemeChange = (event: Event) => {
    const target = event.target as HTMLSelectElement;
    updateSetting("theme", target.value as ThemeKey);
  };
  
  const handleFontChange = (event: Event) => {
    const target = event.target as HTMLSelectElement;
    updateSetting("fontFamily", target.value as FontFamilyKey);
  };
  
  const handleScaleChange = (event: Event) => {
    const target = event.target as HTMLSelectElement;
    updateSetting("uiScale", target.value as UIScaleKey);
  };
  
  const handleHelpTextToggle = (event: Event) => {
    const target = event.target as HTMLInputElement;
    updateSetting("showHelpText", target.checked);
  };
  
  const handleReset = () => {
    if (confirm("Reset all settings to defaults?")) {
      resetSettings();
    }
  };
  
  const handleBackdropClick = (event: MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };
  
  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      onClose();
    }
  };
</script>

{#if isOpen}
  <div 
    class="settings-backdrop" 
    on:click={handleBackdropClick}
    on:keydown={handleKeydown}
    role="presentation"
  >
    <div class="settings-modal" role="dialog" aria-labelledby="settings-title" aria-modal="true">
      <div class="settings-header">
        <h2 id="settings-title">Settings</h2>
        <button 
          class="close-button" 
          on:click={onClose}
          aria-label="Close settings"
          type="button"
        >
          ✕
        </button>
      </div>
      
      <div class="settings-tabs">
        <button
          class="tab-button"
          class:active={activeSection === "appearance"}
          on:click={() => activeSection = "appearance"}
          type="button"
        >
          Appearance
        </button>
        <button
          class="tab-button"
          class:active={activeSection === "accessibility"}
          on:click={() => activeSection = "accessibility"}
          type="button"
        >
          Accessibility
        </button>
      </div>
      
      <div class="settings-content">
        {#if activeSection === "appearance"}
          <section class="settings-section" aria-labelledby="appearance-heading">
            <h3 id="appearance-heading">Appearance</h3>
            
            <div class="setting-item">
              <label for="theme-select">
                <span class="setting-label">Theme</span>
                <span class="setting-description">Choose your color scheme</span>
              </label>
              <select 
                id="theme-select"
                value={$settings.theme}
                on:change={handleThemeChange}
              >
                {#each themeEntries as [key, label]}
                  <option value={key}>{label}</option>
                {/each}
              </select>
            </div>
            
            <div class="setting-item">
              <label for="font-select">
                <span class="setting-label">Font Family</span>
                <span class="setting-description">Adjust text appearance</span>
              </label>
              <select 
                id="font-select"
                value={$settings.fontFamily}
                on:change={handleFontChange}
              >
                {#each fontFamilyEntries as [key, label]}
                  <option value={key}>{label}</option>
                {/each}
              </select>
            </div>
            
            <div class="setting-item">
              <label for="scale-select">
                <span class="setting-label">UI Size</span>
                <span class="setting-description">Adjust interface scale</span>
              </label>
              <select 
                id="scale-select"
                value={$settings.uiScale}
                on:change={handleScaleChange}
              >
                {#each uiScaleEntries as [key, value]}
                  <option value={key}>{value.label}</option>
                {/each}
              </select>
            </div>
          </section>
        {/if}
        
        {#if activeSection === "accessibility"}
          <section class="settings-section" aria-labelledby="accessibility-heading">
            <h3 id="accessibility-heading">Accessibility</h3>
            
            <div class="setting-item">
              <label for="help-text-toggle" class="toggle-label">
                <div>
                  <span class="setting-label">Show Help Text</span>
                  <span class="setting-description">Display hints and descriptions on form inputs</span>
                </div>
                <input 
                  id="help-text-toggle"
                  type="checkbox"
                  class="toggle-input"
                  checked={$settings.showHelpText}
                  on:change={handleHelpTextToggle}
                />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </section>
        {/if}
      </div>
      
      <div class="settings-footer">
        <button 
          class="reset-button"
          on:click={handleReset}
          type="button"
        >
          Reset to Defaults
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .settings-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    padding: var(--spacing-md);
    animation: fadeIn 0.2s ease;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  .settings-modal {
    background: var(--surface);
    border-radius: var(--border-radius);
    box-shadow: 0 8px 32px var(--shadow);
    border: 1px solid var(--border-strong);
    width: 100%;
    max-width: 600px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    animation: slideUp 0.3s ease;
  }
  
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .settings-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-md) var(--spacing-lg);
    border-bottom: 1px solid var(--border-color);
  }
  
  .settings-header h2 {
    margin: 0;
    font-size: 1.5rem;
    color: var(--text-primary);
  }
  
  .close-button {
    background: transparent;
    border: none;
    font-size: 1.5rem;
    color: var(--text-secondary);
    cursor: pointer;
    padding: var(--spacing-xs);
    line-height: 1;
    border-radius: calc(var(--border-radius) / 2);
    transition: all var(--transition);
  }
  
  .close-button:hover {
    background: var(--surface-hover);
    color: var(--text-primary);
  }
  
  .settings-tabs {
    display: flex;
    gap: var(--spacing-xs);
    padding: var(--spacing-sm) var(--spacing-lg) 0;
    border-bottom: 1px solid var(--border-color);
  }
  
  .tab-button {
    background: transparent;
    border: none;
    padding: var(--spacing-sm) var(--spacing-md);
    color: var(--text-secondary);
    cursor: pointer;
    font-weight: 500;
    border-bottom: 2px solid transparent;
    transition: all var(--transition);
  }
  
  .tab-button:hover {
    color: var(--text-primary);
  }
  
  .tab-button.active {
    color: var(--primary-color);
    border-bottom-color: var(--primary-color);
  }
  
  .settings-content {
    flex: 1;
    overflow-y: auto;
    padding: var(--spacing-lg);
  }
  
  .settings-section h3 {
    margin: 0 0 var(--spacing-md) 0;
    font-size: 1.1rem;
    color: var(--text-primary);
  }
  
  .setting-item {
    margin-bottom: var(--spacing-lg);
  }
  
  .setting-item:last-child {
    margin-bottom: 0;
  }
  
  .setting-item label {
    display: block;
    margin-bottom: var(--spacing-xs);
  }
  
  .setting-label {
    display: block;
    font-weight: 500;
    color: var(--text-primary);
    margin-bottom: 0.25rem;
  }
  
  .setting-description {
    display: block;
    font-size: 0.85rem;
    color: var(--text-secondary);
  }
  
  .setting-item select {
    width: 100%;
    padding: var(--spacing-xs) var(--spacing-sm);
    background: var(--surface);
    border: 1px solid var(--border-color);
    border-radius: calc(var(--border-radius) / 2);
    color: var(--text-primary);
    font-size: 1rem;
    cursor: pointer;
    transition: all var(--transition);
  }
  
  .setting-item select:hover {
    border-color: var(--border-strong);
  }
  
  .setting-item select:focus {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }
  
  /* Toggle switch styling */
  .toggle-label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    gap: var(--spacing-md);
    padding: var(--spacing-sm);
    border-radius: calc(var(--border-radius) / 2);
    transition: background var(--transition);
  }
  
  .toggle-label:hover {
    background: var(--surface-hover);
  }
  
  .toggle-label > div {
    flex: 1;
  }
  
  .toggle-input {
    display: none;
  }
  
  .toggle-slider {
    position: relative;
    display: inline-block;
    width: 48px;
    height: 24px;
    background: var(--border-color);
    border-radius: 12px;
    transition: background var(--transition);
    flex-shrink: 0;
  }
  
  .toggle-slider::before {
    content: "";
    position: absolute;
    top: 2px;
    left: 2px;
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    transition: transform var(--transition);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
  
  .toggle-input:checked + .toggle-slider {
    background: var(--primary-color);
  }
  
  .toggle-input:checked + .toggle-slider::before {
    transform: translateX(24px);
  }
  
  .settings-footer {
    padding: var(--spacing-md) var(--spacing-lg);
    border-top: 1px solid var(--border-color);
    display: flex;
    justify-content: flex-end;
  }
  
  .reset-button {
    background: transparent;
    border: 1px solid var(--border-color);
    color: var(--text-secondary);
    padding: var(--spacing-xs) var(--spacing-md);
    border-radius: calc(var(--border-radius) / 2);
    cursor: pointer;
    font-weight: 500;
    transition: all var(--transition);
  }
  
  .reset-button:hover {
    background: var(--surface-hover);
    border-color: var(--border-strong);
    color: var(--text-primary);
  }
  
  @media (max-width: 768px) {
    .settings-modal {
      max-width: 100%;
      max-height: 100vh;
      border-radius: 0;
    }
    
    .settings-tabs {
      overflow-x: auto;
    }
  }
</style>
