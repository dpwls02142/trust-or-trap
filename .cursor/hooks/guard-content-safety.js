const fs = require("fs");
const path = require("path");

const teenScenarioPattern = /teen-[a-z0-9-]*\.json$/i;
const markerPath = path.join(
  process.cwd(),
  ".cursor",
  "hooks",
  ".content-safety-marker"
);

async function readStdin() {
  let inputData = "";
  for await (const inputChunk of process.stdin) {
    inputData += inputChunk;
  }
  return inputData ? JSON.parse(inputData) : {};
}

async function main() {
  const hookInput = await readStdin();
  const editedFilePath =
    hookInput.file_path || hookInput.path || hookInput.filePath || "";

  if (editedFilePath && teenScenarioPattern.test(editedFilePath)) {
    const markerDirectory = path.dirname(markerPath);
    if (!fs.existsSync(markerDirectory)) {
      fs.mkdirSync(markerDirectory, { recursive: true });
    }
    fs.writeFileSync(
      markerPath,
      JSON.stringify({ lastEdit: editedFilePath, timestamp: Date.now() })
    );
  }

  process.stdout.write(JSON.stringify({}));
}

main().catch(() => {
  process.stdout.write(JSON.stringify({}));
});
