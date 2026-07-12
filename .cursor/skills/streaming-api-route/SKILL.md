---
name: streaming-api-route
description: Gemini SSE 대사 생성 / risk_flag 판정 / Typecast 스트리밍 TTS를 처리하는 서버리스 API Route를 구현한다. 키 보안과 스트리밍 패턴이 필요할 때 사용.
user-invocable: true
---

# 스트리밍 API Route 구현

외부 API 호출은 **서버(API Route)에서만**. `.cursor/rules/api-routes.mdc`를 따른다. 완료 후 `security-review`로 키 노출을 점검한다.

## 대상 엔드포인트

| Route | 역할 |
| --- | --- |
| `src/app/api/scenario/advance/route.ts` | 노드 스펙 + 히스토리 + 프로필 → Gemini 대사 생성(SSE) |
| `src/app/api/scenario/judge/route.ts` | 사용자 응답 → risk_flag 판정 → 다음 node_id |
| `src/app/api/tts/stream/route.ts` | 문장 텍스트 → Typecast 스트리밍 TTS 프록시 |

## 공통 절차

1. **입력 검증**: 요청 body를 Zod로 파싱. 실패 시 400.
2. **키 접근**: `process.env.GEMINI_API_KEY` / `process.env.TYPECAST_API_KEY`. 키를 응답/로그/클라이언트로 절대 내보내지 않는다.
3. **스트리밍 응답**: `ReadableStream` + SSE(`text/event-stream`)로 토큰/청크를 흘려보낸다.

## advance (Gemini 대사 생성)

- 시스템 프롬프트에 고정 주입: 현재 노드 `required_risk_signal`, `forbidden_content`, "노드 범위를 벗어난 사건 전개 금지".
- 입력: 노드 스펙 + 대화 히스토리 + 사용자 프로필(이름/관심사).
- 출력: **구조화 JSON 강제** `{ message, sender, options[], risk_flags[] }`. 자유 텍스트 금지.
- 토큰 SSE 스트리밍. 완성 문장이 생기면 프론트가 TTS로 넘길 수 있게 문장 경계를 표시.
- 응답 후처리 필터(금칙어, 개인정보 패턴) 적용.

## judge (위험도 판정)

- 사용자 선택/STT 텍스트 + 현재 노드 `required_risk_signal`을 입력.
- LLM이 `safe|caution|risky` 판정 → 그래프 `next_node_map`으로 다음 node_id 결정 후 반환.

## tts/stream (Typecast)

- `POST https://api.typecast.ai/v1/text-to-speech/stream`, `X-API-KEY` 헤더.
- body: `{ text, model: "ssfm-v30", voice_id, prompt: { emotion_type: "smart", previous_text, next_text }, output: {...} }`.
- **통화(call) 앱 전용.** 대사 생성 완료 후 문장 단위로 순차 요청·재생(동시 요청 최대 1개 — 병렬 버스트는 Typecast 429 유발).
- **teen 시나리오 요청은 TTS를 호출하지 않는다.**
- STT 원본 음성은 처리 후 즉시 폐기, 서버 저장 금지.

## 완료 후 (필수)

- [ ] 클라이언트로 키가 새지 않는지 확인
- [ ] Zod 검증 존재
- [ ] LLM 응답 JSON 스키마 검증
- [ ] `security-review` 서브에이전트 실행
