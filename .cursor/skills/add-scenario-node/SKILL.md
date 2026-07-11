---
name: add-scenario-node
description: Trust or Trap 시나리오 그래프(JSON)에 노드를 추가하거나 수정한다. 사건 단계, 위험 신호, 분기, 엔딩을 일관되게 작성할 때 사용.
user-invocable: true
---

# 시나리오 노드 추가/수정

시나리오 그래프는 사건 전개의 진실이다. LLM은 대사만 채우므로, **노드 스펙이 정확해야 학습 품질과 안전이 보장**된다.

## 사전 확인

1. [domain-glossary.md](../../../docs/domain-glossary.md)에서 대상 `scenarioId`, `stage`, `app_type`, `risk_flag`, `ending_type` 값을 확인한다.
2. 해당 시나리오의 위험 신호 학습 포인트를 `docs/product-planning.md` §7에서 확인한다.
3. `.cursor/rules/scenario-graph.mdc`(노드 스펙)를 따른다. teen 시나리오면 `content-safety-teen.mdc`도 함께.

## 절차

1. **파일 위치**: `src/scenarios/graphs/{scenarioId}.json`. 파일명 = scenarioId.
2. **노드 작성** — 아래 필드를 모두 채운다:
   - `node_id`(시나리오 내 유일), `stage`, `app_type`
   - `required_risk_signal` — 이 단계에서 반드시 드러날 위험 신호(학습 포인트에서)
   - `forbidden_content` — 생성 금지 표현(실존 사칭, 개인정보, teen이면 성적 콘텐츠)
   - `options[]`(각 옵션에 `risk_flag`) 또는 자유 입력 허용 플래그
   - `next_node_map` — `safe`/`caution`/`risky` → 다음 node_id (분기 노드는 3개 모두)
   - `voice_enabled` — teen 시나리오는 반드시 `false`
   - 엔딩 노드면 `is_ending: true` + `ending_type: safe|warning|harm`
3. **연결 검증**:
   - 그래프에 고아 노드(진입 불가)나 막다른 노드(엔딩 아닌데 next 없음)가 없는지 확인.
   - `safe`/`warning`/`harm` **엔딩 3종에 모두 도달 가능**한지 확인.
   - `next_node_map`이 가리키는 node_id가 실제 존재하는지 확인.
4. **스키마 검증**: 타입 정의(`src/lib/scenario/types.ts`)/Zod 스키마가 있으면 통과하는지 확인.

## teen 시나리오 추가 시 (필수)

- 모든 노드 `voice_enabled: false`.
- `forbidden_content`에 성적 콘텐츠/노골적 묘사/구체적 유해 지시를 명시.
- 작성 후 **`security-review` 서브에이전트**로 콘텐츠 안전을 감사한다.

## 체크리스트

- [ ] 파일명 == scenarioId
- [ ] 모든 필수 필드 존재
- [ ] 분기 노드의 next_node_map 3종 완비
- [ ] 엔딩 3종 도달 가능
- [ ] teen이면 voice_enabled=false + security-review 완료
