const fs = require("fs");
const path = require("path");

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
  await readStdin();

  if (!fs.existsSync(markerPath)) {
    process.stdout.write(JSON.stringify({}));
    return;
  }

  let markerData = {};
  try {
    markerData = JSON.parse(fs.readFileSync(markerPath, "utf8"));
  } catch {
    fs.unlinkSync(markerPath);
    process.stdout.write(JSON.stringify({}));
    return;
  }

  fs.unlinkSync(markerPath);

  const editedFile = markerData.lastEdit || "teen 시나리오 파일";
  const followupMessage =
    "미성년자(teen) 시나리오 파일(" +
    editedFile +
    ")이 수정되었습니다. .cursor/rules/content-safety-teen.mdc 기준으로 (1) 모든 노드 voice_enabled=false, (2) forbidden_content에 성적 콘텐츠/노골적 묘사 금지 명시를 재확인하고, security-review 서브에이전트로 콘텐츠 안전을 감사해 주세요.";

  process.stdout.write(JSON.stringify({ followup_message: followupMessage }));
}

main().catch(() => {
  process.stdout.write(JSON.stringify({}));
});
