# trust-or-trap — Agent Guide

Solo Windows 11 developer using Cursor for vibe coding. Agents must use **PowerShell**, not Mac/bash defaults.

**Trust or Trap** = 피싱/디지털 스캠 예방 시뮬레이션 게임("폰 속의 폰" UI). 시나리오 그래프가 사건의 진실, LLM은 대사만 생성.

## Read First (신규 작업 진입 시)

1. [docs/product-planning.md](docs/product-planning.md) — 무엇을/왜
2. [docs/technical-architecture.md](docs/technical-architecture.md) — 어떻게 + **불변 원칙**
3. [docs/domain-glossary.md](docs/domain-glossary.md) — 식별자/값 명명 기준
4. [docs/ai-collaboration.md](docs/ai-collaboration.md) — hooks/rules/skills/subagents/MCP 연결 지도

## 절대 원칙 (요약, 상세는 trust-or-trap-core.mdc)

1. 시나리오 그래프 = 진실의 원천. LLM은 노드 범위 내 대사만 생성.
2. API 키는 서버(API Route) 전용. 클라이언트 직접 호출 금지.
3. 텍스트는 SSE 스트리밍, TTS는 생성 완료 후 문장 단위 순차 재생(통화 앱 전용).
4. 10대(teen) 시나리오는 음성 미적용 + 강화 콘텐츠 안전.
5. 엔딩 3갈래(safe/warning/harm).

## Quick Context

- **Platform:** Windows 11, PowerShell — [docs/windows-development-environment.md](docs/windows-development-environment.md)
- **Git:** main → feature/fix → PR → squash merge — [docs/git-branch-workflow.md](docs/git-branch-workflow.md)
- **Team size:** 1 — self-review via bugbot subagent before PR

---

## Architecture

```
Session Start (hook)
  └─ inject Windows/PowerShell + workflow context

Rules
  ├─ [always] windows-development.mdc     → PowerShell, no bash
  ├─ [always] git-workflow.mdc
  ├─ [always] trust-or-trap-core.mdc      → 프로젝트 불변 원칙
  ├─ [glob]   nextjs-react.mdc            → **/*.{ts,tsx}
  ├─ [glob]   scenario-graph.mdc          → src/scenarios/**
  ├─ [glob]   api-routes.mdc              → src/app/api/**
  ├─ [glob]   phone-ui.mdc                → src/components/phone/**
  └─ [glob]   content-safety-teen.mdc     → src/scenarios/graphs/teen-*.json

Skills (load when task matches)
  ├─ 프로젝트: add-scenario-node · phone-ui-component · streaming-api-route · persona-matching
  └─ 워크플로: writing-commit-message · creating-pr · visual-qa-testing

Hooks (automated)
  ├─ sessionStart            → session-context.js
  ├─ beforeShellExecution    → guard-git-commands.js
  ├─ afterFileEdit           → track-ui-edits.js · guard-content-safety.js
  ├─ stop                    → suggest-visual-qa.js · remind-content-safety.js
  └─ subagentStop            → subagent-followup.js

Subagents (Task tool)
  ├─ bugbot           → self code review before PR
  ├─ security-review  → security/content-safety audit (특히 teen 시나리오)
  ├─ explore          → codebase search
  └─ shell            → terminal operations

MCP
  └─ cursor-ide-browser → "폰 속의 폰" visual QA
```

---

## When to Use What

| Task | Tool |
|------|------|
| Terminal commands | **PowerShell** syntax (Shell tool) |
| 시나리오 그래프 노드 추가/수정 | Skill: `add-scenario-node` (+rule `scenario-graph`) |
| "폰 속의 폰" UI 컴포넌트 | Skill: `phone-ui-component` (+rule `phone-ui`) |
| Gemini/Typecast 스트리밍 API | Skill: `streaming-api-route` (+rule `api-routes`) |
| 온보딩 페르소나 매칭 | Skill: `persona-matching` |
| 10대(teen) 시나리오 작업 | Rule `content-safety-teen` + Subagent `security-review` (필수) |
| Write a commit | Skill: `writing-commit-message` |
| Create a PR | Skill: `creating-pr` + `gh` CLI |
| UI changed | Skill: `visual-qa-testing` + MCP browser |
| Self-review before PR | Subagent: `bugbot` |
| Security check | Subagent: `security-review` |

---

## Recommended Solo Flow

1. `git fetch origin; git checkout -b feature/name origin/main`
2. Implement (PowerShell commands only)
3. UI edited → stop hook → visual QA skill
4. bugbot subagent self-review
5. Commit (`git commit -m "..."`) using writing-commit-message skill
6. PR via creating-pr skill (`gh pr create --body-file ...`)
7. Squash merge on GitHub

---

## PowerShell Reminders (Critical)

```powershell
# ❌ NEVER (bash/Mac)
git fetch && git rebase origin/main
gh pr create --body "$(cat <<'EOF' ... EOF)"
export NODE_ENV=dev

# ✅ ALWAYS (PowerShell)
git fetch origin; git rebase origin/main
gh pr create --body-file .github/pr-body-template.md
$env:NODE_ENV = "dev"
```

---

## File Index

```
.cursor/hooks/     → automated guards & follow-ups
.cursor/rules/     → PowerShell/git constraints + Trust or Trap project rules
.cursor/skills/    → step-by-step workflows (프로젝트 + 워크플로)
docs/              → reference docs (index: docs/README.md)
  ├─ product-planning.md       기획 요약
  ├─ technical-architecture.md 기술 아키텍처 + 불변 원칙
  ├─ domain-glossary.md        용어/식별자 명명 기준
  └─ ai-collaboration.md       hooks/rules/skills/subagents/MCP 지도
```

> 아직 앱 코드(`src/`)와 `package.json`은 없음. 위 문서/규칙/스킬/훅은 **AI 이해용 컨텍스트**이며, 실제 구현 시 여기 정의된 경로·명명·원칙을 기준으로 삼는다.
