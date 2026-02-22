<script lang="ts">
  type IntakeMode = "feature" | "feedback" | "bug";
  type SubmissionMethod = "github" | "anonymous";

  export let isOpen = false;
  export let mode: IntakeMode = "feedback";
  export let onClose: () => void;

  const REPO_OWNER = "D-Heger";
  const REPO_NAME = "VintageStoryCalculator";

  type FormState = {
    title: string;
    description: string;
    stepsToReproduce: string;
    expectedBehavior: string;
    actualBehavior: string;
    useCase: string;
    proposedSolution: string;
    alternativesConsidered: string;
    priority: "Low" | "Medium" | "High" | "Critical";
    calculatorArea: string[];
    issueType: "Question" | "Discussion" | "Documentation Issue" | "Performance Issue" | "Security Concern" | "Other";
    additionalContext: string;
    browser: string;
    operatingSystem: string;
    email: string;
    shareEmailPublicly: boolean;
    privacyConsent: boolean;
    anonymousProgressConsent: boolean;
    submissionMethod: SubmissionMethod;
    honey: string;
  };

  const emptyForm = (): FormState => ({
    title: "",
    description: "",
    stepsToReproduce: "1.\n2.\n3.\n4.",
    expectedBehavior: "",
    actualBehavior: "",
    useCase: "",
    proposedSolution: "",
    alternativesConsidered: "",
    priority: "Medium",
    calculatorArea: [],
    issueType: "Discussion",
    additionalContext: "",
    browser: "",
    operatingSystem: "",
    email: "",
    shareEmailPublicly: false,
    privacyConsent: false,
    anonymousProgressConsent: false,
    submissionMethod: "github",
    honey: ""
  });

  const calculatorAreaOptions = [
    "Alloying Calculator",
    "General UI/UX",
    "New Calculator Type",
    "Data/Recipes",
    "Performance",
    "Mobile Experience",
    "Other"
  ];

  const modeConfig = {
    bug: {
      heading: "Bug Report",
      template: "bug_report.yml",
      titlePrefix: "[BUG]",
      labels: ["bug", "triage"]
    },
    feature: {
      heading: "Feature Request",
      template: "feature_request.yml",
      titlePrefix: "[FEATURE]",
      labels: ["enhancement", "feature-request"]
    },
    feedback: {
      heading: "Feedback",
      template: "general_issue.yml",
      titlePrefix: "[GENERAL]",
      labels: ["question", "discussion"]
    }
  } as const;

  let form: FormState = emptyForm();
  let submitError = "";
  let submitSuccess = "";
  let submitLink = "";
  let copyStatus = "";
  let isSubmitting = false;
  let activeMode: IntakeMode = mode;
  let wasOpen = false;

  const detectClientEnvironment = () => {
    if (typeof navigator === "undefined") return;
    if (!form.browser.trim()) form.browser = navigator.userAgent;
    if (!form.operatingSystem.trim()) form.operatingSystem = navigator.platform || "Unknown";
  };

  const resetForm = () => {
    form = {
      ...emptyForm(),
      submissionMethod: "github",
      issueType: activeMode === "feedback" ? "Discussion" : "Other"
    };
    detectClientEnvironment();
    submitError = "";
    submitSuccess = "";
    submitLink = "";
    copyStatus = "";
  };

  const handleModeChange = (nextMode: IntakeMode) => {
    if (activeMode === nextMode) return;
    activeMode = nextMode;
    resetForm();
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const handleBackdropClick = (event: MouseEvent) => {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  };

  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      handleClose();
    }
  };

  const toggleCalculatorArea = (area: string, checked: boolean) => {
    if (checked) {
      form.calculatorArea = [...form.calculatorArea, area];
      return;
    }
    form.calculatorArea = form.calculatorArea.filter((value) => value !== area);
  };

  const handleCalculatorAreaChange = (area: string, event: Event) => {
    const target = event.target as HTMLInputElement;
    toggleCalculatorArea(area, target.checked);
  };

  const buildGitHubIssueUrl = () => {
    const config = modeConfig[activeMode];
    const url = new URL(`https://github.com/${REPO_OWNER}/${REPO_NAME}/issues/new`);
    const params = new URLSearchParams();

    params.set("template", config.template);

    const fullTitle = `${config.titlePrefix} ${form.title.trim()}`.trim();
    if (fullTitle.length > 0) {
      params.set("title", fullTitle);
    }

    if (activeMode === "bug") {
      params.set("description", form.description.trim());
      params.set("steps_to_reproduce", form.stepsToReproduce.trim());
      params.set("expected_behavior", form.expectedBehavior.trim());
      params.set("actual_behavior", form.actualBehavior.trim());
      params.set("browser", form.browser.trim());
      params.set("operating_system", form.operatingSystem.trim());
      params.set("additional_context", form.additionalContext.trim());
    }

    if (activeMode === "feature") {
      params.set("feature_description", form.description.trim());
      params.set("use_case", form.useCase.trim());
      params.set("proposed_solution", form.proposedSolution.trim());
      params.set("alternatives_considered", form.alternativesConsidered.trim());
      params.set("priority", form.priority);
      if (form.calculatorArea.length > 0) {
        for (const area of form.calculatorArea) {
          params.append("calculator_area", area);
        }
      }
      params.set("additional_context", form.additionalContext.trim());
    }

    if (activeMode === "feedback") {
      params.set("issue_summary", form.title.trim());
      params.set("issue_type", form.issueType);
      params.set("details", form.description.trim());
      params.set("browser", form.browser.trim());
      params.set("operating_system", form.operatingSystem.trim());
      params.set("additional_context", form.additionalContext.trim());
    }

    url.search = params.toString();
    return url.toString();
  };

  const validate = () => {
    submitError = "";

    if (form.honey.trim().length > 0) {
      submitError = "Submission could not be validated.";
      return false;
    }

    if (!form.privacyConsent) {
      submitError = "You must accept the privacy notice before submitting.";
      return false;
    }

    if (form.submissionMethod === "anonymous" && !form.anonymousProgressConsent) {
      submitError = "Please confirm you understand anonymous progress tracking expectations.";
      return false;
    }

    if (!form.title.trim() && activeMode !== "feedback") {
      submitError = "Please enter a title.";
      return false;
    }

    if (activeMode === "bug") {
      if (!form.description.trim() || !form.stepsToReproduce.trim() || !form.expectedBehavior.trim() || !form.actualBehavior.trim()) {
        submitError = "Please complete all required bug report fields.";
        return false;
      }
    }

    if (activeMode === "feature") {
      if (!form.description.trim() || !form.useCase.trim() || !form.proposedSolution.trim()) {
        submitError = "Please complete all required feature request fields.";
        return false;
      }
    }

    if (activeMode === "feedback") {
      if (!form.title.trim() || !form.description.trim()) {
        submitError = "Please complete the feedback summary and details.";
        return false;
      }
    }

    if (form.email.trim().length > 0 && !form.shareEmailPublicly) {
      submitError = "Please confirm email visibility consent or clear the email field.";
      return false;
    }

    return true;
  };

  const submitAnonymous = async () => {
    const response = await fetch("/.netlify/functions/submit-issue", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        mode: activeMode,
        form: {
          ...form,
          email: form.email.trim()
        }
      })
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload?.error || "Failed to submit anonymous issue.");
    }

    submitLink = payload.issueUrl || "";
    submitSuccess = "Anonymous issue created successfully.";
  };

  const copySubmitLink = async () => {
    if (!submitLink || typeof navigator === "undefined" || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(submitLink);
      copyStatus = "Link copied";
    } catch {
      copyStatus = "Unable to copy link";
    }
  };

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    submitSuccess = "";
    submitLink = "";
    copyStatus = "";

    if (!validate()) return;

    isSubmitting = true;
    try {
      if (form.submissionMethod === "github") {
        const url = buildGitHubIssueUrl();
        window.open(url, "_blank", "noopener,noreferrer");
        submitLink = url;
        submitSuccess = "GitHub issue form opened in a new tab with your data prefilled.";
      } else {
        await submitAnonymous();
      }
    } catch (error) {
      submitError = error instanceof Error ? error.message : "Failed to submit report.";
    } finally {
      isSubmitting = false;
    }
  };

  $: if (isOpen && !wasOpen) {
    activeMode = mode;
    resetForm();
  }

  $: if (!isOpen && wasOpen) {
    submitError = "";
    submitSuccess = "";
    submitLink = "";
    copyStatus = "";
  }

  $: wasOpen = isOpen;
</script>

{#if isOpen}
  <div
    class="intake-backdrop"
    on:click={handleBackdropClick}
    on:keydown={handleKeydown}
    role="presentation"
  >
    <div class="intake-modal" role="dialog" aria-labelledby="intake-title" aria-modal="true">
      <div class="intake-header">
        <h2 id="intake-title">{modeConfig[activeMode].heading}</h2>
        <button class="close-button" on:click={handleClose} type="button" aria-label="Close report form">✕</button>
      </div>

      <div class="mode-tabs" role="tablist" aria-label="Report type">
        <button
          type="button"
          role="tab"
          class="mode-tab"
          class:active={activeMode === "feedback"}
          aria-selected={activeMode === "feedback"}
          on:click={() => handleModeChange("feedback")}
        >
          Feedback
        </button>
        <button
          type="button"
          role="tab"
          class="mode-tab"
          class:active={activeMode === "feature"}
          aria-selected={activeMode === "feature"}
          on:click={() => handleModeChange("feature")}
        >
          Feature Request
        </button>
        <button
          type="button"
          role="tab"
          class="mode-tab"
          class:active={activeMode === "bug"}
          aria-selected={activeMode === "bug"}
          on:click={() => handleModeChange("bug")}
        >
          Bug Report
        </button>
      </div>

      <form class="intake-form" on:submit={handleSubmit}>
        <div class="field">
          <label for="issue-title">Title</label>
          <input id="issue-title" type="text" bind:value={form.title} required />
        </div>

        <div class="field">
          <label for="issue-description">{activeMode === "feature" ? "Feature Description" : activeMode === "feedback" ? "Details" : "Description"}</label>
          <textarea id="issue-description" rows="4" bind:value={form.description} required></textarea>
        </div>

        {#if activeMode === "bug"}
          <div class="field">
            <label for="steps">Steps to Reproduce</label>
            <textarea id="steps" rows="4" bind:value={form.stepsToReproduce} required></textarea>
          </div>
          <div class="field-group">
            <div class="field">
              <label for="expected">Expected Behavior</label>
              <textarea id="expected" rows="3" bind:value={form.expectedBehavior} required></textarea>
            </div>
            <div class="field">
              <label for="actual">Actual Behavior</label>
              <textarea id="actual" rows="3" bind:value={form.actualBehavior} required></textarea>
            </div>
          </div>
        {/if}

        {#if activeMode === "feature"}
          <div class="field">
            <label for="use-case">Use Case</label>
            <textarea id="use-case" rows="3" bind:value={form.useCase} required></textarea>
          </div>
          <div class="field">
            <label for="proposed-solution">Proposed Solution</label>
            <textarea id="proposed-solution" rows="3" bind:value={form.proposedSolution} required></textarea>
          </div>
          <div class="field">
            <label for="alternatives">Alternatives Considered</label>
            <textarea id="alternatives" rows="3" bind:value={form.alternativesConsidered}></textarea>
          </div>
          <div class="field-group">
            <div class="field">
              <label for="priority">Priority</label>
              <select id="priority" bind:value={form.priority}>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
              </select>
            </div>
            <fieldset class="field checkbox-group">
              <legend>Calculator Area</legend>
              {#each calculatorAreaOptions as area}
                <label class="checkbox-item">
                  <input
                    type="checkbox"
                    checked={form.calculatorArea.includes(area)}
                    on:change={(event) => handleCalculatorAreaChange(area, event)}
                  />
                  <span>{area}</span>
                </label>
              {/each}
            </fieldset>
          </div>
        {/if}

        {#if activeMode === "feedback"}
          <div class="field">
            <label for="issue-type">Feedback Type</label>
            <select id="issue-type" bind:value={form.issueType}>
              <option>Question</option>
              <option>Discussion</option>
              <option>Documentation Issue</option>
              <option>Performance Issue</option>
              <option>Security Concern</option>
              <option>Other</option>
            </select>
          </div>
        {/if}

        <div class="field-group">
          <div class="field">
            <label for="browser">Browser</label>
            <input id="browser" type="text" bind:value={form.browser} />
          </div>
          <div class="field">
            <label for="os">Operating System</label>
            <input id="os" type="text" bind:value={form.operatingSystem} />
          </div>
        </div>

        <div class="field">
          <label for="additional-context">Additional Context</label>
          <textarea id="additional-context" rows="3" bind:value={form.additionalContext}></textarea>
        </div>

        <fieldset class="field">
          <legend>Submission Method</legend>
          <label class="radio-item">
            <input type="radio" bind:group={form.submissionMethod} value="github" />
            <span>GitHub account (recommended, opens prefilled issue in new tab)</span>
          </label>
          <label class="radio-item">
            <input type="radio" bind:group={form.submissionMethod} value="anonymous" />
            <span>Anonymous submission (issue created by bot)</span>
          </label>
        </fieldset>

        {#if form.submissionMethod === "anonymous"}
          <div class="field">
            <label for="email">Optional email for follow-up reference</label>
            <input id="email" type="email" bind:value={form.email} placeholder="you@example.com" />
            <label class="checkbox-item consent-item">
              <input type="checkbox" bind:checked={form.shareEmailPublicly} />
              <span>I understand this email may be visible in the created GitHub issue.</span>
            </label>
          </div>
        {/if}

        <div class="privacy-box">
          <p>
            Privacy notice: this form processes your input only to create a project issue. Anonymous submissions are posted by a bot account.
            Please do not include sensitive personal data.
          </p>
          <p>
            For anonymous submissions, you must check issue progress yourself unless you provide contact info and consent to share it.
          </p>
        </div>

        <label class="checkbox-item consent-item">
          <input type="checkbox" bind:checked={form.privacyConsent} required />
          <span>I consent to processing this data for issue triage and project support.</span>
        </label>

        {#if form.submissionMethod === "anonymous"}
          <label class="checkbox-item consent-item">
            <input type="checkbox" bind:checked={form.anonymousProgressConsent} required />
            <span>I understand anonymous submissions do not provide automatic status notifications.</span>
          </label>
        {/if}

        <input class="honey" type="text" tabindex="-1" autocomplete="off" bind:value={form.honey} aria-hidden="true" />

        {#if submitError}
          <p class="status status-error" role="alert">{submitError}</p>
        {/if}

        {#if submitSuccess}
          <div class="status-group">
            <p class="status status-success">{submitSuccess}</p>
            {#if submitLink}
              <a class="status-link" href={submitLink} target="_blank" rel="noopener noreferrer">Open link</a>
              <button class="copy-link-button" type="button" on:click={copySubmitLink}>Copy link</button>
            {/if}
            {#if copyStatus}
              <p class="copy-status">{copyStatus}</p>
            {/if}
          </div>
        {/if}

        <div class="actions">
          <button class="secondary-button" type="button" on:click={handleClose}>Cancel</button>
          <button class="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : form.submissionMethod === "github" ? "Open GitHub Form" : "Submit Anonymously"}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<style>
  .intake-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.55);
    display: flex;
    justify-content: center;
    align-items: center;
    padding: var(--spacing-md);
    z-index: 2100;
  }

  .intake-modal {
    width: 100%;
    max-width: 780px;
    max-height: 92vh;
    overflow: auto;
    background: var(--surface);
    border: 1px solid var(--border-strong);
    border-radius: var(--border-radius);
    box-shadow: 0 8px 28px var(--shadow);
  }

  .intake-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-md) var(--spacing-lg);
    border-bottom: 1px solid var(--border-color);
  }

  .intake-header h2 {
    margin: 0;
  }

  .close-button {
    background: transparent;
    border: none;
    color: var(--text-secondary);
    font-size: 1.3rem;
    cursor: pointer;
  }

  .intake-form {
    padding: var(--spacing-lg);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .mode-tabs {
    display: flex;
    gap: var(--spacing-xs);
    padding: var(--spacing-sm) var(--spacing-lg) 0;
    border-bottom: 1px solid var(--border-color);
  }

  .mode-tab {
    background: transparent;
    border: none;
    padding: var(--spacing-sm) var(--spacing-md);
    color: var(--text-secondary);
    cursor: pointer;
    font-weight: 500;
    border-bottom: 2px solid transparent;
    transition: all var(--transition);
  }

  .mode-tab:hover {
    color: var(--text-primary);
  }

  .mode-tab.active {
    color: var(--primary-color);
    border-bottom-color: var(--primary-color);
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  .field-group {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--spacing-md);
  }

  .field input,
  .field textarea,
  .field select {
    background: var(--surface-muted);
    color: var(--text-primary);
    border: 1px solid var(--border-soft);
    border-radius: calc(var(--border-radius) / 1.4);
    padding: var(--spacing-xs) var(--spacing-sm);
    font: inherit;
  }

  .checkbox-group {
    border: 1px solid var(--border-soft);
    border-radius: calc(var(--border-radius) / 1.4);
    padding: var(--spacing-sm);
    margin: 0;
  }

  .checkbox-item,
  .radio-item {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-xs);
    font-size: 0.95rem;
  }

  .privacy-box {
    background: var(--surface-muted);
    border: 1px solid var(--border-soft);
    border-radius: calc(var(--border-radius) / 1.4);
    padding: var(--spacing-sm);
  }

  .privacy-box p {
    margin: 0;
  }

  .privacy-box p + p {
    margin-top: var(--spacing-xs);
  }

  .consent-item {
    margin-top: calc(var(--spacing-xs) * -1);
  }

  .honey {
    position: absolute;
    left: -10000px;
    opacity: 0;
    pointer-events: none;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--spacing-sm);
  }

  .primary-button,
  .secondary-button {
    border-radius: var(--border-radius);
    border: 1px solid var(--border-strong);
    padding: var(--spacing-xs) var(--spacing-md);
    cursor: pointer;
    font-weight: 500;
  }

  .primary-button {
    background: var(--primary-color);
    color: #fff;
  }

  .secondary-button {
    background: var(--surface-muted);
    color: var(--text-primary);
  }

  .status {
    margin: 0;
    font-size: 0.92rem;
  }

  .status-error {
    color: #b42318;
  }

  .status-success {
    color: var(--primary-color);
  }

  .status-group {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--spacing-xs);
  }

  .status-link {
    color: var(--primary-color);
    font-size: 0.92rem;
  }

  .copy-link-button {
    border: 1px solid var(--border-soft);
    background: var(--surface-muted);
    color: var(--text-primary);
    border-radius: calc(var(--border-radius) / 1.4);
    padding: 0.2rem 0.5rem;
    cursor: pointer;
    font-size: 0.85rem;
  }

  .copy-status {
    margin: 0;
    color: var(--text-secondary);
    font-size: 0.85rem;
  }

  @media (max-width: 768px) {
    .field-group {
      grid-template-columns: 1fr;
    }

    .actions {
      flex-direction: column;
      align-items: stretch;
    }
  }
</style>
