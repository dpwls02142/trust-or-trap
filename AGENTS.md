# trust-or-trap — Agent Guide

Solo Windows 11 developer using Cursor for vibe coding. Agents must use **PowerShell**, not Mac/bash defaults.

## Quick Context

- **Platform:** Windows 11, PowerShell — [docs/windows-development-environment.md](docs/windows-development-environment.md)
- **Git:** main → feature/fix → PR → squash merge — [docs/git-branch-workflow.md](docs/git-branch-workflow.md)
- **Team size:** 1 — self-review via bugbot subagent before PR

---

## Architecture

```
Session Start (hook)
  └─ inject Windows/PowerShell + workflow context

Rules (always on)
  ├─ .cursor/rules/windows-development.mdc  → PowerShell, no bash
  └─ .cursor/rules/git-workflow.mdc

Skills (load when task matches)
  ├─ writing-commit-message  → commits
  ├─ creating-pr             → pull requests
  └─ visual-qa-testing       → UI verification via MCP browser

Hooks (automated)
  ├─ sessionStart            → session-context.js
  ├─ beforeShellExecution    → guard-git-commands.js
  ├─ afterFileEdit           → track-ui-edits.js
  ├─ stop                    → suggest-visual-qa.js
  └─ subagentStop            → subagent-followup.js

Subagents (Task tool)
  ├─ bugbot           → self code review before PR
  ├─ security-review  → security audit
  ├─ explore          → codebase search
  └─ shell            → terminal operations

MCP
  └─ cursor-ide-browser → visual QA
```

---

## When to Use What

| Task | Tool |
|------|------|
| Terminal commands | **PowerShell** syntax (Shell tool) |
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
.cursor/rules/     → always-on PowerShell + git constraints
.cursor/skills/    → step-by-step workflows
docs/              → detailed reference docs
```
