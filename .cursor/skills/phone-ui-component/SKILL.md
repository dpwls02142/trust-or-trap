---
name: phone-ui-component
description: "폰 속의 폰" UI 앱/화면 컴포넌트를 만들거나 수정한다. PhoneFrame 계층, 범용 렌더러, 스트리밍 UX를 일관되게 구현할 때 사용.
user-invocable: true
---

# "폰 속의 폰" 컴포넌트 만들기

실제 스마트폰과 동일한 인터페이스를 재현한다. `.cursor/rules/phone-ui.mdc`를 따른다.

## 원칙

- 앱 컴포넌트는 **범용 렌더러**다. "현재 노드 + LLM 스트리밍 응답"을 props로 받아 렌더링하고, **페르소나 7종이 공유**한다. 페르소나별 복제 금지.
- 노드의 `app_type`(glossary §5)이 어떤 앱을 띄울지 결정한다.

## 절차

1. **위치**: `src/components/phone/`. 파일명 `PascalCase.tsx`.
2. **계층 확인**: `PhoneFrame → HomeScreen → {ChatApp|SMSApp|CallScreen|InstaApp|BankApp|BrowserApp}`. 새 화면은 이 계층 안에 둔다.
3. **props 설계** (공통):
   - `currentNode`(노드 스펙), `streamingMessage`(진행 중 텍스트), `onSelectOption`/`onSubmitInput`(사용자 응답 → judge 호출).
   - 페르소나별 분기는 데이터로 처리(props/노드), 컴포넌트 분기로 처리하지 않는다.
4. **스타일**: Tailwind. 모바일 뷰포트(예: 390×844) 기준. 프레임 안에서만 스크롤.
5. **연출**: Framer Motion으로 메시지 수신/타이핑/타이머 압박. 텍스트는 스트리밍 즉시 타이핑 효과로 표시.
6. **음성 동기화**: 텍스트가 음성보다 먼저 도착할 수 있음 → 버퍼링 고려. teen 시나리오는 음성 없음.
7. **대체 경로**: 마이크 입력 UI에는 항상 텍스트 입력 대체를 둔다.

## 완료 후 검증 (필수)

`visual-qa-testing` 스킬로 `cursor-ide-browser` MCP를 사용해:
- 스크린샷으로 레이아웃 확인
- 콘솔 에러 확인(hydration mismatch 등)
- 필요 시 `browser_resize`로 반응형 확인

> UI 파일 편집 후 stop 훅이 시각 QA를 자동 제안한다.

## 체크리스트

- [ ] 범용 렌더러(페르소나 공유), 복제 없음
- [ ] app_type ↔ 컴포넌트 매핑 일치
- [ ] 스트리밍 타이핑 + (음성 시나리오면) 동기화 고려
- [ ] 마이크 대체 입력 제공
- [ ] visual QA 통과
