import changelogRaw from "../../CHANGELOG.md?raw";

const VERSION_PATTERN = /^## \[(\d+\.\d+\.\d+(?:-[a-zA-Z0-9.]+)?)\]/m;

export function extractLatestVersion(text?: string) {
  if (typeof text !== "string") return undefined;
  const match = text.match(VERSION_PATTERN);
  return match ? match[1] : undefined;
}

export async function getProjectVersion() {
  return extractLatestVersion(changelogRaw) ?? "Unknown";
}
