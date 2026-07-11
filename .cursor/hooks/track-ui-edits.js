const fs = require("fs");
const path = require("path");

const uiFilePattern = /\.(tsx|jsx|vue|svelte|css|scss|sass|less|html|htm)$/i;
const markerPath = path.join(
  process.cwd(),
  ".cursor",
  "hooks",
  ".ui-edits-marker"
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

  if (editedFilePath && uiFilePattern.test(editedFilePath)) {
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
