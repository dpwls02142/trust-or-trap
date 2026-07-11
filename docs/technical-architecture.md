# Trust or Trap — 기술안 (에이전트 참조용)

## 아키텍처

```
Browser(SPA) → Next.js Frontend
  → Serverless API Routes (Vercel)
    → Scenario Graph (static JSON)
    → Claude API (expression only, SSE)
    → Typecast API (streaming TTS, server-only)
  → localStorage (progress)
```

**핵심 원칙:** LLM은 사건을 **지어내지 않음**. 노드 스펙 범위 내 **대사·표현만** 생성.

## 스택

| 영역 | 선택 |
|------|------|
| Framework | Next.js (App Router) + React + TypeScript |
| Styling | Tailwind CSS |
| State | Zustand |
| Animation | Framer Motion |
| Forms | Zod + React Hook Form |
| Audio | Web Audio API / `<audio>` |

## 디렉터리 규칙

```
src/
├── app/                    # Next.js routes
│   └── api/                # Serverless only — API keys here
├── components/phone/       # PhoneFrame, HomeScreen, *App
├── lib/
│   ├── scenario/           # graph loader, persona matching, types
│   ├── llm/                # Claude prompts, structured output
│   ├── tts/                # Typecast streaming
│   └── stores/             # Zustand
└── scenarios/graphs/       # *.json — version-controlled static assets
```

## 시나리오 노드 스펙 (JSON)

```typescript
interface ScenarioNode {
  node_id: string;
  app_type: "chat" | "sms" | "call" | "bank" | "instagram" | "dating";
  required_risk_signal: string;
  forbidden_content: string[];
  next_node_map: Record<RiskFlag, string>;
  timer_seconds?: number;
  voice_enabled?: boolean; // false for teen scenarios
}
```

## LLM API 규칙

- **서버에서만** Claude 호출 — 클라이언트 직접 호출 금지
- 입력: 노드 스펙 + 대화 히스토리 + 사용자 프로필
- 출력: 구조화 JSON 강제 — `{ message, sender, options[], risk_flags[] }`
- SSE 스트리밍 → 프론트 타이핑 효과
- 사용자 응답 → risk_flag 판정 → `next_node_map`으로 다음 노드

## TTS (Typecast)

- 서버리스 경유, `X-API-KEY`는 env only
- LLM 문장 스트림 → 즉시 Typecast `/v1/text-to-speech/stream`
- `emotion_type: "smart"`, `previous_text`/`next_text` 문맥
- 10대 시나리오: TTS 비활성

## STT

- 1차: Web Speech API (클라이언트, 무료)
- 마이크 거부 시 텍스트 입력 fallback 필수
- 원본 음성 파일 서버 저장 금지

## 보안·프라이버시

- `ANTHROPIC_API_KEY`, `TYPECAST_API_KEY` → `.env.local` only
- STT 원본 즉시 폐기
- 노드별 `forbidden_content` + 후처리 필터
- 미성년 시나리오: 엄격한 금지 콘텐츠 목록

## 스트리밍 UX

- 텍스트가 음성보다 먼저 도착 가능 → 텍스트-음성 동기화 버퍼 필요
- 문장 단위 TTS (완성 대사 통째 재생 X)

## 환경 변수

See `.env.example`
