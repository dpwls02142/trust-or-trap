---
name: persona-matching
description: 온보딩 입력(이름/나이/성별)을 페르소나 코드로 변환하고 기본 시나리오 + 대체 선택지를 매칭한다. 온보딩 로직 구현 시 사용.
user-invocable: true
---

# 페르소나 매칭 로직

온보딩 입력을 받아 "발생 확률이 가장 높은" 시나리오를 추천하고, 항상 대체 선택지를 함께 노출한다.

## 절차

1. **입력 검증**: 이름(가명 허용), 나이(정수), 성별(`female`/`male`)을 Zod로 검증.
2. **연령대(ageBand) 산출**:
   - `teen`(10~19), `twenties`(20~29), `middle`(30~49), `fifties`(50~59), `senior`(60+).
3. **personaCode 생성**: `{ageBand}-{gender}` ([domain-glossary.md](../../../docs/domain-glossary.md) §1).
4. **기본 매칭 + 대체 선택지** (glossary §1, `docs/product-planning.md` §6):

| personaCode | 기본 scenarioId | 대체 선택지 |
| --- | --- | --- |
| `teen-female` | `teen-female-grooming` | `teen-male-gameitem` |
| `teen-male` | `teen-male-gameitem` | `teen-female-grooming` |
| `twenties-female` | `twenties-female-romance` | `twenties-male-voicephishing` |
| `twenties-male` | `twenties-male-voicephishing` | `middle-invest-scam` |
| `middle-*` | `middle-invest-scam` | 여: `twenties-female-romance` / 남: `fifties-loan-scam` |
| `fifties-*` | `fifties-loan-scam` | `middle-invest-scam` |
| `senior-*` | `senior-authority-scam` | 여: `twenties-female-romance` / 남: `middle-invest-scam` |

5. **항상 노출**: 투자리딩방(`middle-invest-scam`)은 전 연령·성별 대상이므로 대체 선택지에 항상 포함 가능.
6. **추천 문구**: "OO님, 최근 당신 또래·성별에서 가장 많은 사건은 [기본 매칭]입니다. 이 이야기로 시작할까요?" → [바로 시작] / [다른 사건 선택하기].

## 구현 위치

- 로직: `src/lib/scenario/persona-matching.ts` (순수 함수, 테스트 가능하게).
- 화면: 온보딩 라우트(App Router) + React Hook Form + Zod.

## 체크리스트

- [ ] ageBand 경계값(19/20, 29/30, 49/50, 59/60) 정확
- [ ] 모든 personaCode가 유효한 scenarioId로 매핑
- [ ] 기본 매칭 + 대체 선택지 항상 제공
- [ ] 이름은 표시용으로만 사용(개인정보 저장/전송 최소화)
