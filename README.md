# Trust or Trap

실제 스마트폰 환경("폰 속의 폰" UI)을 재현한 **몰입형 인터랙티브 피싱/디지털 스캠 예방 시뮬레이션**. 사용자가 정답을 외우는 대신, 현실과 유사한 상황에서 위험 신호를 스스로 식별하고 판단하도록 훈련한다.

## 핵심 아이디어

- **페르소나 매칭**: 나이·성별로 발생 확률이 가장 높은 범죄 스토리(7종)를 추천.
- **시나리오 그래프**: 사건 전개는 정적 상태 그래프가 결정. LLM은 노드 범위 내 대사만 생성.
- **스트리밍 몰입**: Gemini 대사(SSE) + Typecast 음성(TTS)을 실시간 스트리밍.
- **엔딩 3갈래**: 안전 회피 / 소액 피해 후 대응 / 피해 심화 + "놓친 위험 신호" 리플레이 리포트.

## 문서 (먼저 읽기)

- [docs/README.md](docs/README.md) — 문서 인덱스
- [docs/product-planning.md](docs/product-planning.md) — 기획 요약
- [docs/technical-architecture.md](docs/technical-architecture.md) — 기술 아키텍처 & 불변 원칙
- [docs/domain-glossary.md](docs/domain-glossary.md) — 용어/식별자 명명 기준
- [docs/ai-collaboration.md](docs/ai-collaboration.md) — AI 바이브 코딩 협업 지도

## 개발 환경

Windows 11 / PowerShell 1인 개발. [AGENTS.md](AGENTS.md), [docs/windows-development-environment.md](docs/windows-development-environment.md), [docs/git-branch-workflow.md](docs/git-branch-workflow.md) 참조.

## 시작하기

```powershell
pnpm install
Copy-Item .env.example .env.local   # 키 값 채우기
pnpm dev
```

`.env.local` 필수 값 (모두 **서버 전용** — 클라이언트 노출 금지):

| 변수 | 용도 |
| --- | --- |
| `GEMINI_API_KEY` | Gemini 대사 생성/판정 |
| `TYPECAST_API_KEY` | Typecast 스트리밍 TTS |
| `TYPECAST_DEFAULT_VOICE_ID` | 기본 보이스 ID |

## Vercel 배포

1. GitHub 저장소를 Vercel에 연결 (Next.js 자동 감지, 별도 설정 불필요).
2. Vercel → Project Settings → Environment Variables에 위 3개 키 등록.
3. `main` 브랜치 머지 시 자동 배포.

## 구조

```
src/
├── app/                      # App Router (온보딩/게임 단일 페이지)
│   └── api/                  # 서버리스 함수 (키는 여기서만 사용)
│       ├── scenario/entry/   # 시작 노드 조회
│       ├── scenario/advance/ # Gemini 대사 생성 (SSE 스트리밍)
│       ├── scenario/judge/   # 사용자 응답 risk_flag 판정 → 분기
│       └── tts/stream/       # Typecast TTS 프록시 (teen 차단)
├── components/
│   ├── onboarding/           # 이름/나이/성별 입력 + 시나리오 추천
│   ├── phone/                # "폰 속의 폰" — PhoneFrame, HomeScreen, 앱 6종
│   └── game/                 # GameController(오케스트레이터), EndingReport
├── lib/
│   ├── scenario/             # 타입·Zod 스키마·그래프 로더·페르소나 매칭
│   ├── stores/               # Zustand 게임 스토어 (localStorage persist)
│   ├── client/               # SSE 소비 유틸, 문장 단위 TTS 재생 큐
│   └── server/               # Gemini 클라이언트·프롬프트 빌더 (서버 전용)
└── scenarios/graphs/         # 시나리오 그래프 JSON 7종 (진실의 원천)
```

## 기술 스택

Next.js (App Router) · Tailwind CSS · Zustand · Framer Motion · Zod + React Hook Form · Gemini API · Typecast TTS · Web Speech API (STT)
