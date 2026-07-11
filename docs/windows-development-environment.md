# Windows 개발 환경 가이드

> **1인 Windows 11 개발자**가 Cursor로 바이브코딩하는 프로젝트입니다.
> Cursor 에이전트는 기본적으로 **Mac/bash 기준 터미널 명령**을 사용하는 경향이 있어, 이 문서는 에이전트가 **PowerShell + Windows** 환경에 맞게 동작하도록 하는 기준입니다.

## 머신 사양

| 항목 | 값 |
|------|-----|
| OS | Microsoft Windows 11 Home |
| 총 메모리 | 15.6 GB |
| 사용 가능 메모리 (일반) | ~3.7 GB (백그라운드 앱에 따라 변동) |
| CPU | Intel Core Ultra 5 125H (14코어 / 18 논리 프로세서, 3.6 GHz) |
| 셸 | PowerShell (Cursor 기본 터미널) |

### 사양 기반 개발 원칙

1. **메모리 절약 우선** — dev server, 테스트, 빌드를 동시에 돌리지 않습니다.
2. **단일 dev server** — `npm run dev` 하나만 실행하고, 필요할 때만 테스트/빌드를 실행합니다.
3. **WSL2/Docker는 선택** — 꼭 필요할 때만 사용합니다 (각각 RAM 2~4 GB 추가).

---

## 핵심 문제: 에이전트가 Mac/bash 명령을 쓰는 경우

Cursor 에이전트는 학습 데이터상 Mac/bash 명령을 기본으로 제안합니다. Windows PowerShell 환경에서 **실패하거나 동작하지 않는** 대표 패턴:

| 에이전트가 자주 쓰는 명령 (Mac/bash) | Windows PowerShell 대안 |
|--------------------------------------|-------------------------|
| `cmd1 && cmd2` | `cmd1; if ($?) { cmd2 }` 또는 한 줄씩 실행 |
| `cat <<'EOF' ... EOF` (HEREDOC) | 파일 작성 후 `--body-file` / `-m` 플래그 |
| `export VAR=value` | `$env:VAR = "value"` |
| `open http://localhost:3000` | `Start-Process "http://localhost:3000"` |
| `pbcopy` / `pbpaste` | `Set-Clipboard` / `Get-Clipboard` |
| `sed -i '' 's/a/b/' file` | Node.js fs API 또는 PowerShell `(Get-Content ...) -replace` |
| `rm -rf dir` | `Remove-Item -Recurse -Force dir` |
| `touch file` | `New-Item -ItemType File file` |
| `/tmp/file` | `$env:TEMP\file` 또는 Node `os.tmpdir()` |
| `which node` | `Get-Command node` |

**에이전트 지침:** 터미널 명령은 **PowerShell 5.1+** 문법으로 작성하고, macOS 전용 명령은 사용하지 않습니다.

---

## PowerShell 명령 작성 규칙

### 명령 연결

```powershell
# ❌ bash 스타일 (PowerShell 5.1에서 실패)
git fetch origin && git rebase origin/main

# ✅ PowerShell
git fetch origin; git rebase origin/main
```

### Git 커밋

```powershell
# ❌ 인터랙티브 커밋 (에이전트/훅에서 차단)
git commit

# ✅ 메시지 직접 지정
git commit -m "feat: add login page"
```

### PR 생성

```powershell
# ❌ bash HEREDOC
gh pr create --body "$(cat <<'EOF' ... EOF)"

# ✅ body 파일 사용
gh pr create --title "feat: add login" --body-file .github/pr-body-template.md
```

### 환경 변수

```powershell
# ❌ bash
export NODE_ENV=development

# ✅ PowerShell
$env:NODE_ENV = "development"
```

---

## 줄바꿈 (Line Endings)

- Windows 기본: CRLF — Git이 LF로 정규화 (`.gitattributes`)
- **저장소 표준: LF**

```powershell
git config core.autocrlf input
git config core.longpaths true
```

---

## 파일 경로

- 코드·import 경로: **forward slash** (`src/components/Button.tsx`)
- Windows는 case-insensitive — import 경로와 파일명 대소문자를 일치시킵니다 (CI/Linux 배포 시 오류 방지)

---

## 성능 최적화 (저메모리 환경)

- [ ] dev server / Docker / WSL 불필요 시 종료
- [ ] 브라우저·백그라운드 앱 최소화
- [ ] 프로젝트 경로가 OneDrive(`OneDrive\Desktop`) — `node_modules` 동기화 지연 가능
  - 문제 발생 시 `C:\dev\trust-or-trap` 등 로컬 경로로 이동 검토
- [ ] HMR 느릴 때: `.env.local`에 `WATCHPACK_POLLING=true` (RAM 부담 있으므로 필요 시만)

---

## 에이전트·훅·스크립트 작성 규칙

1. **Node.js 우선** — `.cursor/hooks/*.js`는 OS 무관하게 동작
2. **PowerShell 호환** — Shell 도구로 실행하는 명령은 PowerShell 문법
3. **HEREDOC 금지** — `-m`, `--body-file`, Node `fs.writeFileSync` 사용
4. **`path.join()`** — 경로 조합 시 Node API 사용

---

## 트러블슈팅

| 증상 | 원인 | 해결 |
|------|------|------|
| `&&` 토큰 오류 | bash 문법을 PowerShell에서 사용 | `;`로 분리 |
| HEREDOC 실패 | PowerShell 5.1 미지원 | `--body-file` 또는 `-m` |
| `EACCES` | OneDrive 파일 잠금 | IDE 재시작, 동기화 대기 |
| dev server OOM | RAM 부족 | 다른 프로세스 종료 |
| hook 미실행 | Node PATH | Cursor 재시작, `node -v` 확인 |

---

## 관련 파일

- `.cursor/rules/windows-development.mdc` — 에이전트용 요약 규칙
- `.gitattributes` — LF 강제
- `AGENTS.md` — 에이전트 오케스트레이션
