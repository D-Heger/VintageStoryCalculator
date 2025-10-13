fetch("CHANGELOG.md")
  .then((response) => response.text())
  .then((text) => {
    const lines = text.split("\n");
    for (const line of lines) {
      const match = line.match(/^## \[(\d+\.\d+\.\d+)\]/);
      if (match) {
        document.getElementById("version").textContent = match[1];
        break;
      }
    }
  })
  .catch((err) => {
    document.getElementById("version").textContent = "Unknown";
  });
