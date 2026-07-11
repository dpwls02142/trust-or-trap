---
name: streaming-api-route
description: Implement Next.js API routes for Claude SSE streaming, risk judgment, and Typecast TTS. Use for scenario advance, user response judging, or audio streaming.
---

# Streaming API Route

Implement serverless routes in `src/app/api/` per `docs/technical-architecture.md`.

## Routes

| Route | Purpose |
|-------|---------|
| `POST /api/scenario/advance` | Stream LLM dialogue for current node |
| `POST /api/scenario/judge` | Evaluate user input → risk_flag + next node |
| `POST /api/tts/stream` | Typecast streaming audio for sentence |

## Advance Route Pattern

1. Validate body with Zod: `{ scenarioId, nodeId, profile, history }`
2. Load node spec from `src/scenarios/graphs/{scenarioId}.json`
3. Build system prompt:
   - Node scope only — do not invent new events
   - Inject `required_risk_signal`, `forbidden_content`
4. Call Claude with SSE, stream tokens to client
5. Parse/emit structured JSON chunks: `{ message, sender, options[], risk_flags[] }`

## Judge Route Pattern

1. Input: `{ scenarioId, nodeId, userResponse, history }`
2. LLM classifies → `safe | warn | danger | neutral`
3. Lookup `next_node_map[riskFlag]` → return `{ nextNodeId, riskFlag }`

## TTS Route Pattern

1. Reject if scenario is `teen-*` or node has `voice_enabled: false`
2. `POST https://api.typecast.ai/v1/text-to-speech/stream`
3. Headers: `X-API-KEY: process.env.TYPECAST_API_KEY`
4. Stream audio chunks to client

## Security Checklist

- [ ] No API keys in client bundle
- [ ] Zod validation on all inputs
- [ ] `forbidden_content` in system prompt
- [ ] Post-filter LLM output
- [ ] No audio file storage

## Client Integration

Frontend consumes SSE via `fetch` + `ReadableStream` or EventSource pattern.
Buffer text-ahead-of-audio sync on client.

## Rule Reference

`.cursor/rules/api-routes.mdc`
