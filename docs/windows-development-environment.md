# Windows 개발 환경 가이드

> trust-or-trap 프로젝트는 Mac 위주로 개발되는 경향이 있지만, **주 개발 머신은 Windows 11**입니다.
> 이 문서는 에이전트와 개발자 모두 Mac 가정 없이 Windows에서 안정적으로 작업하기 위한 기준입니다.

## 머신 사양

| 항목 | 값 |
|------|-----|
| OS | Microsoft Windows 11 Home |
| 총 메모리 | 15.6 GB |
| 사용 가능 메모리 (일반) | ~3.7 GB (백그라운드 앱에 따라 변동) |
| CPU | Intel Core Ultra 5 125H (14코어 / 18 논리 프로세서, 3.6 GHz) |

### 사양 기반 개발 원칙

1. **메모리 절약 우선** — 동시에 무거운 프로세스를 여러 개 띄우지 않습니다.
2. **단일 dev server** — `npm run dev` 하나만 실행하고, 필요할 때만 테스트/빌드를 실행합니다.
3. **병렬 작업 제한** — 에이전트가 `npm test` + `npm run build` + dev server를 동시에 돌리지 않도록 합니다.
4. **WSL2는 선택** — Docker/Linux 전용 도구가 필요할 때만 사용합니다. WSL2는 추가 RAM(2~4 GB)을 사용합니다.

---

## Mac vs Windows 차이점

### 1. 셸 및 명령어

| Mac (팀원) | Windows (나) | 권장 |
|------------|--------------|------|
| bash/zsh | PowerShell | 크로스 플랫폼 npm 스크립트 사용 |
| `open url` | `Start-Process url` | Node.js 또는 `npm run` 스크립트 |
| `pbcopy` | `Set-Clipboard` | 클립보드 조작은 스크립트에서 피함 |
| `sed -i ''` | PowerShell `-replace` | Node.js fs API 또는 npm 패키지 |
| `/tmp` | `$env:TEMP` | `os.tmpdir()` (Node) |

**에이전트 지침:** macOS 전용 명령어를 제안하거나 실행하지 않습니다.

### 2. 줄바꿈 (Line Endings)

- Windows 기본: CRLF (`\r\n`)
- Mac/Linux: LF (`\n`)
- **저장소 표준: LF** (`.gitattributes`로 강제)

```gitattributes
* text=auto eol=lf
*.{cmd,bat} text eol=crlf
```

Git 설정 (로컬, 한 번만):

```powershell
git config core.autocrlf input
```

### 3. 파일 경로

- Windows는 `\`와 `/` 모두 허용 (Node.js, npm)
- 코드·import 경로는 **항상 forward slash** (`src/components/Button.tsx`)
- 파일명 **대소문자 주의** — Windows는 case-insensitive, Mac/Linux CI는 sensitive

### 4. 파일 감시 (File Watching)

Windows에서 dev server HMR이 느리거나 파일 변경을 못 잡을 때:

```powershell
# PowerShell (관리자) — 일시적 해결
# 또는 .env.local에 추가 (Next.js/Vite 등)
WATCHPACK_POLLING=true
```

메모리가 부족할 때 polling은 CPU/RAM 부담이 커지므로, 문제가 있을 때만 사용합니다.

### 5. 네이티브 모듈

`node-gyp`, `sharp`, `bcrypt` 등 네이티브 바이너리는 Windows용 prebuild가 필요합니다.

- **Visual Studio Build Tools** (C++ workload) 설치 권장
- `npm install` 실패 시: `npm rebuild` 또는 prebuild 버전 확인

### 6. Docker

- **Docker Desktop for Windows** 사용 (WSL2 backend 권장)
- Docker Desktop은 RAM 2~4 GB 추가 사용 → 메모리 여유 없을 때는 Docker 중지
- Mac 팀원의 `docker compose up` 명령은 Windows에서도 동일하게 동작 (경로만 주의)

---

## 권장 로컬 설정

### Node.js

- **LTS 버전** 사용 (팀과 동일 major 버전 유지)
- 패키지 매니저: 프로젝트에 `package-lock.json`이 있으면 **npm**, `pnpm-lock.yaml`이 있으면 **pnpm**

### Git

```powershell
git config core.autocrlf input
git config core.longpaths true   # Windows 긴 경로 지원
```

### 에디터 (Cursor)

- `"files.eol": "\n"` — LF 강제
- `"files.insertFinalNewline": true`

---

## 성능 최적화 체크리스트

- [ ] 불필요한 dev server / Docker / WSL 종료 후 작업
- [ ] 브라우저 탭·Electron 앱 최소화 (RAM 확보)
- [ ] `node_modules`는 OneDrive 동기화 폴더 밖에 두는 것이 이상적
  - 현재 경로가 OneDrive(`OneDrive\Desktop`)이므로, 대형 `node_modules` 설치 시 동기화 지연 가능
  - 문제 발생 시 프로젝트를 `C:\dev\trust-or-trap` 등 로컬 경로로 이동 검토
- [ ] TypeScript `--incremental` / IDE tsserver는 RAM 사용 — 큰 변경 시 IDE 재시작

---

## 에이전트·훅·스크립트 작성 규칙

1. **Node.js 우선** — `.cursor/hooks/*.js`는 Mac/Windows 모두에서 동작
2. **PowerShell 호환** — 셸 명령은 PowerShell 5.1+ 문법 준수
3. **HEREDOC 대신 `-m` 플래그** — Windows PowerShell 5.1은 bash HEREDOC 미지원
   - 커밋: `git commit --trailer "Co-authored-by: Cursor <cursoragent@cursor.com>" -m "message"`
   - PR body: 임시 파일 또는 `gh pr create --body-file pr-body.md`
4. **경로 구분자** — 스크립트에서 `path.join()` 사용

---

## 트러블슈팅

| 증상 | 원인 | 해결 |
|------|------|------|
| `EACCES` / permission denied | OneDrive 잠금 | IDE·터미널 재시작, OneDrive 동기화 완료 대기 |
| `ENOENT` import | 대소문자 불일치 | Mac CI에서만 실패 — import 경로와 파일명 일치 확인 |
| dev server OOM | RAM 부족 | 다른 프로세스 종료, `--max-old-space-size=4096` |
| hook 미실행 | Node PATH | Cursor 재시작, `node -v` 확인 |
| CRLF diff noise | line ending | `.gitattributes` + `core.autocrlf input` |

---

## 관련 파일

- `.cursor/rules/windows-development.mdc` — 에이전트용 요약 규칙
- `.gitattributes` — LF 강제
- `AGENTS.md` — 에이전트 오케스트레이션
