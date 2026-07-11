# AI 바이브 코딩 협업 가이드

> Trust or Trap을 만들 때 **hooks · rules · skills · subagents · MCP**가 어떻게 맞물려 동작하는지 정리한 지도입니다.
> "무슨 작업을 할 때 무엇을 참조/실행해야 하는가"를 한눈에 파악하는 것이 목적입니다.

---

## 1. 레이어 개요

```
세션 시작 (sessionStart hook)
  └─ Windows/PowerShell + 워크플로 + AGENTS.md 요약 컨텍스트 주입

Rules (항상/조건부 자동 적용)
  ├─ [always] windows-development · git-workflow          (개발 환경/워크플로)
  ├─ [always] trust-or-trap-core                          (프로젝트 불변 원칙)
  ├─ [glob]   nextjs-react     → **/*.{ts,tsx}
  ├─ [glob]   scenario-graph   → src/scenarios/**
  ├─ [glob]   api-routes       → src/app/api/**
  ├─ [glob]   phone-ui         → src/components/phone/**
  └─ [glob]   content-safety-teen → src/scenarios/graphs/teen-*.json

Skills (작업이 매칭될 때 로드)
  ├─ 프로젝트: add-scenario-node · phone-ui-component · streaming-api-route · persona-matching
  └─ 워크플로: writing-commit-message · creating-pr · visual-qa-testing

Hooks (자동 실행)
  ├─ sessionStart        → session-context.js
  ├─ beforeShellExecution→ guard-git-commands.js
  ├─ afterFileEdit       → track-ui-edits.js · guard-content-safety.js
  ├─ stop                → suggest-visual-qa.js
  └─ subagentStop        → subagent-followup.js

Subagents (Task tool)
  ├─ explore          → 코드베이스 탐색
  ├─ bugbot           → PR 전 자가 코드 리뷰
  ├─ security-review  → 보안/콘텐츠 안전 감사 (특히 teen 시나리오)
  └─ shell            → 터미널 작업

MCP
  └─ cursor-ide-browser → "폰 속의 폰" UI 시각적 QA
```

## 2. 문서 읽는 순서 (신규 작업 진입 시)

1. [product-planning.md](product-planning.md) — 무엇을/왜 만드는가
2. [technical-architecture.md](technical-architecture.md) — 어떻게 만드는가 + **불변 원칙**
3. [domain-glossary.md](domain-glossary.md) — 식별자/값 명명 기준
4. 작업 영역에 해당하는 `.cursor/rules/*.mdc` (glob 자동 적용)

## 3. 작업별 참조 매핑 (What to use when)

| 작업 | 참조 Rule | 실행 Skill | 관련 Subagent/MCP |
| --- | --- | --- | --- |
| 시나리오 그래프 노드 추가/수정 | `scenario-graph`, `content-safety-teen`(teen) | `add-scenario-node` | teen이면 `security-review` |
| 온보딩 페르소나 매칭 로직 | `trust-or-trap-core`, `nextjs-react` | `persona-matching` | — |
| "폰 속의 폰" UI 컴포넌트 | `phone-ui`, `nextjs-react` | `phone-ui-component` | `cursor-ide-browser`(visual QA) |
| Claude/Typecast 스트리밍 API | `api-routes`, `trust-or-trap-core` | `streaming-api-route` | `security-review`(키 노출 점검) |
| 10대 시나리오 관련 무엇이든 | `content-safety-teen` | `add-scenario-node` | **`security-review` 필수** |
| 커밋 작성 | `git-workflow` | `writing-commit-message` | — |
| PR 생성 | `git-workflow` | `creating-pr` | `bugbot`(사전 리뷰) |
| UI 변경 후 검증 | `phone-ui` | `visual-qa-testing` | `cursor-ide-browser` |

## 4. 자동화 트리거 (Hooks가 대신 상기시켜 주는 것)

- **UI 파일(.tsx/.css 등) 편집** → 세션 종료 시 `suggest-visual-qa`가 시각 QA를 제안.
- **teen 시나리오 파일(`teen-*.json`) 편집** → `guard-content-safety`가 콘텐츠 안전 재검토 + `security-review` 실행을 상기.
- **git 명령** → `guard-git-commands`가 main force push 차단, 위험 명령 확인.
- **bugbot/security-review 종료** → `subagent-followup`이 수정→QA→PR 흐름 안내.

## 5. 권장 구현 순서 (전체 프로젝트)

> 아직 코드가 없는 상태 기준. 각 단계는 별도 feature 브랜치 + PR로 진행.

1. 프로젝트 세팅 (Next.js + Tailwind + Zustand + Zod, `.env.example`)
2. 도메인 타입 정의 (`lib/scenario/types.ts` — glossary 기준)
3. 시나리오 그래프 스키마 + 샘플 1종 (`twenties-female-romance`) → `add-scenario-node`
4. 온보딩 화면 + 페르소나 매칭 (`persona-matching`)
5. "폰 속의 폰" 프레임 + 앱 렌더러 (`phone-ui-component`) → visual QA
6. 스트리밍 API (Claude SSE, Typecast TTS, judge) (`streaming-api-route`) → security-review
7. 나머지 시나리오 6종 확장 (teen 2종은 security-review 필수)
8. 엔딩/리포트 화면 + "놓친 위험 신호" 리플레이

## 6. 안전 게이트 (절대 통과 금지 항목)

작업을 끝내기 전 아래를 반드시 자문한다.

- [ ] API 키를 클라이언트로 노출하는 코드가 없는가? (외부 호출은 API Route 안에서만)
- [ ] LLM이 노드 범위를 벗어난 사건을 지어내도록 허용하지 않았는가?
- [ ] teen 시나리오에 음성/성적 콘텐츠가 들어가지 않았는가? (`voice_enabled: false`)
- [ ] LLM 응답을 구조화 JSON 스키마로 검증하는가?
- [ ] `.env` 실제 값이 커밋에 포함되지 않았는가?
