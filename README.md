# Trust or Trap

실제 스마트폰 환경("폰 속의 폰" UI)을 재현한 **몰입형 인터랙티브 피싱/디지털 스캠 예방 시뮬레이션**. 사용자가 정답을 외우는 대신, 현실과 유사한 상황에서 위험 신호를 스스로 식별하고 판단하도록 훈련한다.

## 핵심 아이디어

- **페르소나 매칭**: 나이·성별로 발생 확률이 가장 높은 범죄 스토리(7종)를 추천.
- **시나리오 그래프**: 사건 전개는 정적 상태 그래프가 결정. LLM은 노드 범위 내 대사만 생성.
- **스트리밍 몰입**: Claude 대사(SSE) + Typecast 음성(TTS)을 실시간 스트리밍.
- **엔딩 3갈래**: 안전 회피 / 소액 피해 후 대응 / 피해 심화 + "놓친 위험 신호" 리플레이 리포트.

## 문서 (먼저 읽기)

- [docs/README.md](docs/README.md) — 문서 인덱스
- [docs/product-planning.md](docs/product-planning.md) — 기획 요약
- [docs/technical-architecture.md](docs/technical-architecture.md) — 기술 아키텍처 & 불변 원칙
- [docs/domain-glossary.md](docs/domain-glossary.md) — 용어/식별자 명명 기준
- [docs/ai-collaboration.md](docs/ai-collaboration.md) — AI 바이브 코딩 협업 지도

## 개발 환경

Windows 11 / PowerShell 1인 개발. [AGENTS.md](AGENTS.md), [docs/windows-development-environment.md](docs/windows-development-environment.md), [docs/git-branch-workflow.md](docs/git-branch-workflow.md) 참조.

> 현재 저장소는 **문서 · Cursor 설정(rules/skills/hooks) 중심**이며 앱 코드(`src/`)는 아직 없다. 구현 시 위 문서와 `.cursor/rules/`의 경로·명명·원칙을 기준으로 삼는다.

## 기술 스택 (예정)

Next.js (App Router) · Tailwind CSS · Zustand · Framer Motion · Zod + React Hook Form · Claude API · Typecast TTS · Web Speech API (STT)
