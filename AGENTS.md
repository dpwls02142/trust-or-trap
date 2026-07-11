# trust-or-trap — Agent Guide

Solo Windows 11 developer · **Trust or Trap** phishing/scam simulation game · PowerShell terminal.

## Project Docs (read first)

| Doc | When |
|-----|------|
| [docs/product-planning.md](docs/product-planning.md) | Story, personas, flow, endings |
| [docs/technical-architecture.md](docs/technical-architecture.md) | Stack, LLM/TTS, API patterns |
| [docs/domain-glossary.md](docs/domain-glossary.md) | Scenario IDs, risk flags |

## Architecture Summary

```
User → Next.js (phone UI) → API Routes → Scenario JSON + Claude (SSE) + Typecast TTS
```

- **Graph = truth** · **LLM = dialogue only** · **Teen = no voice**

## Cursor Setup

```
Rules (always on)
  ├─ trust-or-trap-core.mdc     → project non-negotiables
  ├─ windows-development.mdc    → PowerShell, not bash
  └─ git-workflow.mdc

Rules (file-scoped)
  ├─ nextjs-react.mdc           → **/*.{ts,tsx}
  ├─ scenario-graph.mdc         → src/scenarios/**
  ├─ api-routes.mdc             → src/app/api/**
  ├─ phone-ui.mdc               → src/components/phone/**
  └─ content-safety-teen.mdc    → teen-*.json

Skills
  ├─ add-scenario-node          → new graph nodes
  ├─ phone-ui-component         → PhoneFrame, apps
  ├─ streaming-api-route        → Claude SSE, Typecast
  ├─ visual-qa-testing          → browser QA
  ├─ writing-commit-message
  └─ creating-pr

Hooks → git guard, visual QA chain, session context
Subagents → bugbot (self-review), security-review (teen content)
MCP → cursor-ide-browser
```

## Implementation Order (suggested)

1. Onboarding form (name/age/gender) + persona matching
2. PhoneFrame + HomeScreen + one app (ChatApp)
3. Scenario graph loader + sample graph
4. `/api/scenario/advance` SSE route
5. `/api/scenario/judge` risk routing
6. Report screen (missed signals replay)
7. TTS streaming (non-teen scenarios)
8. Remaining 6 scenario graphs

## PowerShell

```powershell
npm run dev          # one dev server only (low RAM)
npm run typecheck
git commit -m "feat: ..."
gh pr create --body-file .github/pr-body-template.md
```

## Key Paths

```
src/scenarios/graphs/     → *.json state machines
src/components/phone/     → phone-in-phone UI
src/lib/scenario/         → types, persona matching
src/app/api/              → server-only AI routes
src/lib/stores/           → Zustand game state
```
