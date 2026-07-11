---
name: add-scenario-node
description: Add or edit a node in a scenario graph JSON file. Use when implementing story flow, branching, or new scenario steps for Trust or Trap.
---

# Add Scenario Node

Use when adding story steps to `src/scenarios/graphs/{scenario-id}.json`.

## Before Starting

1. Read `docs/product-planning.md` — synops for the scenario
2. Read `docs/domain-glossary.md` — scenario ID and risk flags
3. Open existing graph or create from template

## Steps

1. **Identify position** in flow: `approach → trust → risk_signal → demand → branch`

2. **Create node** with all required fields:

```json
{
  "node_id": "unique-kebab-id",
  "app_type": "chat",
  "required_risk_signal": "이 단계에서 학습할 위험 신호 (한국어)",
  "forbidden_content": ["금지 표현 1", "금지 표현 2"],
  "next_node_map": {
    "safe": "next-safe-node-id",
    "warn": "next-warn-node-id",
    "danger": "next-danger-node-id",
    "neutral": "next-neutral-node-id"
  },
  "timer_seconds": 30,
  "voice_enabled": true
}
```

3. **Wire edges** — update previous node's `next_node_map` to point to new node

4. **Teen scenarios** (`teen-*`): set `voice_enabled: false` on every node

5. **Validate** — every `next_node_map` target must exist as `node_id` in same file

6. **Ending nodes** — use `ending_type: "safe" | "warn" | "danger"` + `report_signals[]` for replay

## Checklist

- [ ] `required_risk_signal` matches planning doc learning points
- [ ] `forbidden_content` includes safety blocks (teen: no sexual content)
- [ ] All 3 ending paths reachable from branch node
- [ ] `app_type` matches UI app (chat/sms/call/bank/instagram/dating)

## Do Not

- Let LLM define graph structure — JSON is source of truth
- Skip `neutral` path if mid-flow node needs continue-without-judgment
