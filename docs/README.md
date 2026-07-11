# docs — 문서 인덱스

Trust or Trap 프로젝트의 참조 문서 모음입니다. **AI 에이전트는 신규 작업 진입 시 아래 순서로 읽으세요.**

## 프로젝트 이해 (먼저)

| 문서 | 내용 |
| --- | --- |
| [product-planning.md](product-planning.md) | 기획안 요약 — 무엇을/왜, 페르소나 7종, 플로우, 엔딩 3갈래 |
| [technical-architecture.md](technical-architecture.md) | 기술 아키텍처 — **불변 원칙**, 시나리오 그래프, 스택, LLM/TTS/STT, 보안 |
| [domain-glossary.md](domain-glossary.md) | 도메인 용어집 — 페르소나 코드, 시나리오 ID, 노드 필드, risk_flag 등 명명 기준 |
| [ai-collaboration.md](ai-collaboration.md) | AI 바이브 코딩 협업 지도 — hooks/rules/skills/subagents/MCP 연결 관계 |

## 개발 환경 & 워크플로

| 문서 | 내용 |
| --- | --- |
| [windows-development-environment.md](windows-development-environment.md) | Windows 11 / PowerShell 1인 개발 환경 |
| [git-branch-workflow.md](git-branch-workflow.md) | main → feature/fix → PR → squash merge |

## 설정 위치

- 항상/조건부 규칙: `.cursor/rules/*.mdc`
- 작업 절차 스킬: `.cursor/skills/*/SKILL.md`
- 자동화 훅: `.cursor/hooks/` + `.cursor/hooks.json`
- 에이전트 가이드: [`../AGENTS.md`](../AGENTS.md)
