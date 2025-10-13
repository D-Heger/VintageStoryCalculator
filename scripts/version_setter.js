async function displayVersion() {
  const versionElement = document.getElementById("version");
  const pathsToTry = ["CHANGELOG.md", "../CHANGELOG.md"];
  let version = "Unknown";

  for (const path of pathsToTry) {
    try {
      const response = await fetch(path);
      if (!response.ok) continue; // Try next path if not found

      const text = await response.text();
      const match = text.match(/^## \[(\d+\.\d+\.\d+)\]/m);

      if (match) {
        version = match[1];
        break; // Found it, stop looking
      }
    } catch (error) {
      // Ignore fetch errors and try the next path
      console.error(`Could not fetch ${path}:`, error);
    }
  }

  versionElement.textContent = version;
}

displayVersion();