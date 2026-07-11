# trust-or-trap — Agent Guide

This file orchestrates how Cursor agents, hooks, skills, subagents, and MCP tools work together in this project.

## Quick Context

- **Platform:** Windows 11 (15.6 GB RAM, ~4 GB free) — see [docs/windows-development-environment.md](docs/windows-development-environment.md)
- **Git:** main → feature/fix → PR → review → squash merge — see [docs/git-branch-workflow.md](docs/git-branch-workflow.md)

---

## Architecture

```
Session Start (hook)
  └─ inject context from this file + docs

Rules (always on)
  ├─ .cursor/rules/windows-development.mdc
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
  ├─ explore          → codebase search
  ├─ shell            → terminal operations
  ├─ bugbot           → code review (after changes)
  ├─ security-review  → security audit (after changes)
  └─ generalPurpose   → complex multi-step tasks

MCP
  └─ cursor-ide-browser → visual QA (screenshots, console, network)
```

---

## When to Use What

| Task | Tool |
|------|------|
| Write a commit | Skill: `writing-commit-message` |
| Create a PR | Skill: `creating-pr` + `gh` CLI |
| UI changed | Skill: `visual-qa-testing` + MCP browser |
| Review local diff | Subagent: `bugbot` |
| Security check | Subagent: `security-review` |
| Find code | Subagent: `explore` |
| Run commands | Shell tool or subagent: `shell` |

---

## Skill vs Hook vs Rule

| Mechanism | Purpose | Trigger |
|-----------|---------|---------|
| **Rule** | Persistent constraints | Every session / matching files |
| **Skill** | Step-by-step workflow | Agent reads when task matches |
| **Hook** | Automated enforcement & follow-ups | Cursor events (shell, edit, stop) |
| **Subagent** | Isolated deep work | Agent launches via Task tool |
| **MCP** | External tool integration | Agent calls MCP tools directly |

Skills are **not** replaced by hooks — they complement each other:
- Hooks **enforce** (block force push) and **chain** (suggest visual QA after UI edit)
- Skills **guide** the agent through detailed workflows

---

## Recommended Agent Flow

### Feature development

1. `git fetch origin && git checkout -b feature/name origin/main`
2. Implement changes (rules apply automatically)
3. UI files edited → `stop` hook suggests visual QA
4. Run visual-qa-testing skill (MCP browser)
5. Commit using writing-commit-message skill
6. Launch bugbot subagent for self-review
7. Create PR using creating-pr skill

### Bug fix

Same flow with `fix/` branch prefix.

---

## Windows Reminders for Agents

- No bash HEREDOC — use `git commit --trailer "Co-authored-by: Cursor <cursoragent@cursor.com>" -m "..."` or `--body-file`
- No macOS-only commands (`open`, `pbcopy`, `sed -i ''`)
- Memory-conscious: one dev server at a time
- LF line endings (`.gitattributes`)

---

## File Index

```
.cursor/
  hooks.json
  hooks/
    session-context.js
    guard-git-commands.js
    track-ui-edits.js
    suggest-visual-qa.js
    subagent-followup.js
  rules/
    windows-development.mdc
    git-workflow.mdc
  skills/
    writing-commit-message/SKILL.md
    creating-pr/SKILL.md
    visual-qa-testing/SKILL.md
docs/
  windows-development-environment.md
  git-branch-workflow.md
```
