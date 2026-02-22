const MODE_CONFIG = {
  bug: {
    titlePrefix: "[BUG]",
    labels: ["bug", "triage"]
  },
  feature: {
    titlePrefix: "[FEATURE]",
    labels: ["enhancement", "feature-request"]
  },
  feedback: {
    titlePrefix: "[GENERAL]",
    labels: ["question", "discussion"]
  }
};

const jsonResponse = (statusCode, payload) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  },
  body: JSON.stringify(payload)
});

const ensureString = (value) => (typeof value === "string" ? value.trim() : "");

const buildIssueBody = (mode, form) => {
  const sections = [];

  if (mode === "bug") {
    sections.push(
      "## Description",
      ensureString(form.description) || "_No description provided._",
      "",
      "## Steps to Reproduce",
      ensureString(form.stepsToReproduce) || "_Not provided._",
      "",
      "## Expected Behavior",
      ensureString(form.expectedBehavior) || "_Not provided._",
      "",
      "## Actual Behavior",
      ensureString(form.actualBehavior) || "_Not provided._"
    );
  }

  if (mode === "feature") {
    sections.push(
      "## Feature Description",
      ensureString(form.description) || "_No description provided._",
      "",
      "## Use Case",
      ensureString(form.useCase) || "_Not provided._",
      "",
      "## Proposed Solution",
      ensureString(form.proposedSolution) || "_Not provided._",
      "",
      "## Alternatives Considered",
      ensureString(form.alternativesConsidered) || "_None provided._",
      "",
      "## Priority",
      ensureString(form.priority) || "Medium",
      "",
      "## Calculator Area",
      Array.isArray(form.calculatorArea) && form.calculatorArea.length > 0 ? form.calculatorArea.join(", ") : "Not specified"
    );
  }

  if (mode === "feedback") {
    sections.push(
      "## Issue Type",
      ensureString(form.issueType) || "Discussion",
      "",
      "## Details",
      ensureString(form.description) || "_No details provided._"
    );
  }

  sections.push(
    "",
    "## Environment",
    `- Browser: ${ensureString(form.browser) || "Not provided"}`,
    `- OS: ${ensureString(form.operatingSystem) || "Not provided"}`
  );

  if (ensureString(form.additionalContext)) {
    sections.push("", "## Additional Context", ensureString(form.additionalContext));
  }

  sections.push(
    "",
    "## Submission Metadata",
    "- Source: anonymous-web-form",
    "- Notifications: reporter must monitor issue progress manually"
  );

  const email = ensureString(form.email);
  if (email) {
    sections.push(
      "",
      "## Reporter Contact (Voluntary)",
      `- Email: ${email}`,
      "- Reporter provided explicit consent to include this in a public issue"
    );
  }

  return sections.join("\n");
};

const validatePayload = (mode, form) => {
  if (!MODE_CONFIG[mode]) return "Invalid submission mode.";
  if (!form || typeof form !== "object") return "Invalid form payload.";
  if (ensureString(form.honey)) return "Submission could not be validated.";
  if (!form.privacyConsent) return "Privacy consent is required.";
  if (!form.anonymousProgressConsent) return "Anonymous progress confirmation is required.";

  const title = ensureString(form.title);
  if (!title) return "Issue title is required.";

  if (mode === "bug") {
    if (!ensureString(form.description) || !ensureString(form.stepsToReproduce) || !ensureString(form.expectedBehavior) || !ensureString(form.actualBehavior)) {
      return "All required bug report fields must be completed.";
    }
  }

  if (mode === "feature") {
    if (!ensureString(form.description) || !ensureString(form.useCase) || !ensureString(form.proposedSolution)) {
      return "All required feature request fields must be completed.";
    }
  }

  if (mode === "feedback" && !ensureString(form.description)) {
    return "Feedback details are required.";
  }

  const email = ensureString(form.email);
  if (email && !form.shareEmailPublicly) {
    return "Email consent is required when email is provided.";
  }

  return null;
};

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return jsonResponse(405, { error: "Method not allowed." });
  }

  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER || "D-Heger";
  const repo = process.env.GITHUB_REPO || "VintageStoryCalculator";

  if (!token) {
    return jsonResponse(500, { error: "Server is not configured for issue submission." });
  }

  let parsed;
  try {
    parsed = JSON.parse(event.body || "{}");
  } catch {
    return jsonResponse(400, { error: "Invalid JSON payload." });
  }

  const mode = parsed?.mode;
  const form = parsed?.form;
  const validationError = validatePayload(mode, form);
  if (validationError) {
    return jsonResponse(400, { error: validationError });
  }

  const config = MODE_CONFIG[mode];
  const title = `${config.titlePrefix} ${ensureString(form.title)}`.trim();
  const body = buildIssueBody(mode, form);

  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "vintage-story-calculator-netlify-function"
      },
      body: JSON.stringify({
        title,
        body,
        labels: config.labels
      })
    });

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => ({}));
      const rawMessage = ensureString(errorPayload?.message);
      const safeMessage =
        rawMessage && /rate limit/i.test(rawMessage)
          ? "GitHub API rate limit exceeded. Please try again later."
          : "Failed to create GitHub issue via GitHub API.";
      return jsonResponse(502, { error: safeMessage });
    }

    const issue = await response.json();

    return jsonResponse(200, {
      issueNumber: issue.number,
      issueUrl: issue.html_url
    });
  } catch {
    return jsonResponse(500, { error: "Unexpected error while creating issue." });
  }
}
