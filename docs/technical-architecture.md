# Trust or Trap — 기술 아키텍처 (AI 참조용 요약)

> 원본 기술안을 **AI 에이전트가 구현 판단에 바로 쓰도록** 압축한 참조본입니다.
> 코드 규칙은 `.cursor/rules/`, 작업 절차는 `.cursor/skills/`, 용어는 [domain-glossary.md](domain-glossary.md) 참조.

---

## 1. 핵심 설계 원칙 (절대 불변 · Invariants)

이 원칙들은 모든 구현 결정보다 우선한다. 어길 경우 안전/품질이 무너진다.

1. **시나리오 그래프 = 진실의 원천(Source of Truth).** 사건 전개는 서버에 미리 정의된 정적 상태 그래프(State Machine)로만 결정된다. LLM이 사건을 새로 지어내지 않는다.
2. **LLM = 표현(대사) 생성기.** LLM은 "이번 노드에서 일어나야 하는 사건"을 받아 사용자 이름·이전 답변에 맞춰 자연스러운 대사로만 바꾼다. **노드 범위를 벗어나는 전개 생성 금지.**
3. **API 키는 서버 전용.** Gemini / Typecast 키는 서버리스 함수(API Route) 환경변수에만 둔다. **클라이언트에서 외부 API 직접 호출 절대 금지.**
4. **텍스트는 스트리밍, 음성은 생성 완료 후 문장 단위 재생.** 대사는 SSE 토큰 스트리밍(생성 중에는 대기 인디케이터 표시), TTS는 대사 생성 완료 후 문장 단위로 순차 요청·재생한다(동시 요청 1개 — Typecast 429 방지). **TTS/STT는 통화(call) 앱에서만 사용.**
5. **10대 시나리오는 음성 미적용.** 미성년자 음성 데이터 수집 리스크 회피. 텍스트/이미지 채팅형만.
6. **엔딩은 3갈래.** safe / warning / harm. 모든 시나리오 공통.

## 2. 전체 아키텍처

```
사용자 브라우저(SPA)
  └─ 프론트엔드 (Next.js / React)
       ├─(현재 노드 + 사용자 응답)→ API Route (서버리스 함수)
       │     ├─ 시나리오 그래프 조회 (정적 JSON)
       │     ├─(노드 컨텍스트, 스트리밍 요청)→ Gemini API  ──토큰 스트림──┐
       │     └────────────────────────────────────────────────────────┘
       │           └─(텍스트 스트림)→ 프론트
       ├─ 문장 완성 시마다 → Typecast TTS(streaming) → 오디오 청크 → 순차 재생
       └─ 진행 상태 저장 → localStorage
```

## 3. 시나리오 그래프 구조

- 페르소나 7종 = 각각 하나의 유한 상태 그래프.
- **노드 = 반드시 등장해야 하는 사건 단계.** 예: `접근 → 신뢰형성 → 위험신호제시 → 요구 → 분기(안전/경고/피해)`.
- 노드 고정 스펙 필드:

| 필드 | 의미 |
| --- | --- |
| `node_id` | 노드 고유 ID |
| `app_type` | 렌더링할 폰 앱 (chat/sms/call/bank/insta 등) |
| `required_risk_signal` | 이 단계에서 반드시 드러나야 하는 위험 신호 |
| `forbidden_content` | 생성 금지 표현(실제 성적 콘텐츠, 실존 인물 사칭 등) |
| `options[]` | 사용자 선택지(또는 자유 입력 허용) |
| `next_node_map` | 사용자 응답의 risk_flag 판정 결과 → 다음 노드 |
| `voice_enabled` | TTS/STT 사용 여부 (10대 시나리오는 항상 `false`) |

- LLM은 (노드 스펙 + 대화 히스토리 + 사용자 프로필)을 받아 **해당 노드 범위 안에서만** 대사를 생성한다.
- 장점: 반복 플레이 시 대사는 매번 달라지되, 핵심 위험 신호 학습 포인트와 안전선은 항상 보장.
- 그래프 JSON은 **정적 자산으로 버전 관리.** 콘텐츠 수정 시 그래프만 교체 가능하도록 구성.

## 4. 프론트엔드 스택

| 영역 | 선택 | 이유 |
| --- | --- | --- |
| 프레임워크 | **Next.js (App Router)** | API Routes로 서버리스 함수를 같은 프로젝트에서 관리 → 별도 백엔드 불필요 |
| 스타일링 | **Tailwind CSS** | "폰 속의 폰" UI 픽셀 재현 유리 |
| 상태관리 | **Zustand** | 현재 노드, 히스토리, risk_flag 누적 관리 |
| 애니메이션 | **Framer Motion** | 메시지 수신, 타이머 압박 연출 |
| 폼 검증 | **Zod + React Hook Form** | 온보딩 입력값 검증 |
| 오디오 재생 | **Web Audio API / `<audio>`** | TTS 스트리밍 청크 재생 |

### "폰 속의 폰" 컴포넌트 구조

```
<PhoneFrame>
  └─ <HomeScreen>  (카카오톡/문자/인스타/전화/은행앱 아이콘)
       ├─ <ChatApp>    ┐
       ├─ <SMSApp>     │ 각 앱은 "현재 노드 + LLM 스트리밍 응답"을 받아
       ├─ <CallScreen> │ 렌더링하는 범용 렌더러. 페르소나 7종이 공유.
       └─ <BankApp>    ┘
```

## 5. LLM (Gemini API) — 노드 기반 표현 생성

| 항목 | 내용 |
| --- | --- |
| 호출 위치 | **서버리스 함수(API Route) 내부에서만.** 클라이언트 직접 호출 금지 |
| 입력 | 현재 노드 스펙(`required_risk_signal`, `forbidden_content`) + 대화 히스토리 + 사용자 프로필 |
| 생성 범위 | 해당 노드 범위 내 대사·말투만. 사건 전개 생성 금지 |
| 응답 형식 | **구조화 JSON 강제**: `{ message, sender, options[], risk_flags[] }`. 자유 텍스트 금지 |
| 스트리밍 | 토큰 단위 SSE. 프론트에서 타이핑 효과로 즉시 렌더링 |
| 응답 판정 | 사용자 선택/STT 텍스트를 LLM에 넘겨 risk_flag 판정 → 그래프 `next_node_map`으로 다음 노드 결정 |
| 안전장치 | 노드별 `forbidden_content`를 시스템 프롬프트에 고정 주입 + 응답 후처리 필터(금칙어, 개인정보 패턴 감지) 별도 레이어 |

## 6. 음성 — TTS(Typecast) & STT

### TTS: Typecast API (스트리밍)

- **통화(call) 앱 전용.** 메시지형 앱(chat/sms/insta/bank/browser)은 TTS를 사용하지 않는다.
- 대사 생성이 완료된 뒤 문장 단위로 Typecast 스트리밍 엔드포인트에 순차 요청해 재생한다. 생성 중에는 대기 인디케이터가 표시되므로 TTS를 호출하지 않는다.
- **동시 요청은 최대 1개**(재생 중 다음 문장 prefetch만 허용) — 병렬 버스트는 Typecast 429를 유발한다.
- 인증: `X-API-KEY` 헤더. **반드시 서버리스 함수 경유.**
- 예시 호출 형태(서버 내부):

```js
const ttsRes = await fetch("https://api.typecast.ai/v1/text-to-speech/stream", {
  method: "POST",
  headers: { "X-API-KEY": process.env.TYPECAST_API_KEY, "Content-Type": "application/json" },
  body: JSON.stringify({
    text: sentenceChunk,
    model: "ssfm-v30",
    voice_id: personaVoiceId,
    prompt: { emotion_type: "smart", previous_text: prevSentence, next_text: "" },
    output: { audio_format: "mp3", target_lufs: -14.0 },
  }),
});
```

- **페르소나별 보이스 매핑**: `/v2/voices`에서 성별/연령대/사용사례로 필터링해 사전 지정.

| 페르소나 | 보이스 특성 | 감정 프리셋 |
| --- | --- | --- |
| 20대 남성 — 대출빙자 상담원 | 사무적 톤 | `normal` → `toneup`(재촉) |
| 50대 — 정책자금 안내원 | 친절한 여성 톤 | `normal` → `whisper`(은밀) |
| 60대+ — 검찰/금감원 사칭 | 낮고 권위적인 남성 톤 | `angry`/`tonedown` |

- `emotion_type: "smart"`를 기본값으로 사용(문맥 기반 자동 감정 조절).
- 자막이 필요하면 `POST /v1/text-to-speech/with-timestamps`로 단어 단위 타임스탬프 활용.
- 캐싱: 매번 표현이 달라져 완전 캐싱 불가. 공통 인트로 대사만 부분 캐싱 가능.

### STT

| 옵션 | 비용 | 한국어 정확도 | 비고 |
| --- | --- | --- | --- |
| **Web Speech API** | 무료 | 준수 | 키·서버 불필요. **1차 구현 채택** |
| Naver Clova Speech | 유료 | 매우 높음 | 다급한 구어체 강점. 품질 개선 시 전환 후보 |
| OpenAI Whisper API | 유료 | 높음 | 업로드 방식 → 실시간성 다소 낮음 |

- 흐름: 마이크 발화 → Web Speech API 실시간 변환 → 서버리스 함수 → LLM이 `required_risk_signal` 기준 위험도 판정 → `next_node_map` 분기.
- **통화(call) 앱에서만 노출.** 메시지형 앱은 텍스트 입력만 제공한다.
- **10대 시나리오는 STT 미적용.**

## 7. 구현 유의사항 (체크리스트)

- [ ] Typecast·LLM API 키는 서버 환경변수(`.env`, `.env.example`에만 키 이름 기재). 클라이언트 직접 호출 금지.
- [ ] 시나리오 그래프 JSON은 정적 자산으로 버전 관리. 콘텐츠 수정 시 배포 없이 교체 가능하도록 분리 검토.
- [ ] STT 원본 음성 파일은 변환 즉시 폐기. **서버 저장 금지.**
- [ ] 마이크 권한 거부 시 **텍스트 입력 대체 경로 항상 제공.**
- [ ] 텍스트가 음성보다 먼저 도착할 수 있음 → 프론트에서 **텍스트-음성 동기화 버퍼링** 로직 필요.
- [ ] LLM 응답은 구조화 JSON 스키마(Zod)로 검증 후 사용.
- [ ] 10대 시나리오 파일은 `voice_enabled: false` + 강화된 `forbidden_content` 필수.

## 8. 권장 디렉터리 구조 (구현 시 참고, 아직 미생성)

```
src/
├── app/
│   ├── (온보딩/시나리오/리포트 라우트)
│   └── api/                # 서버리스 함수 (Gemini/Typecast 호출)
│       ├── scenario/advance/   # 노드 대사 생성 (Gemini SSE)
│       ├── scenario/judge/     # 사용자 응답 risk_flag 판정
│       └── tts/stream/         # Typecast 스트리밍 프록시
├── components/phone/       # PhoneFrame, HomeScreen, ChatApp, ...
├── lib/
│   ├── scenario/           # 그래프 로더, 페르소나 매칭, 타입
│   └── stores/             # Zustand 스토어
└── scenarios/graphs/       # 시나리오 그래프 JSON (정적 자산)
```

> 위 구조는 **아직 생성되지 않았다.** 프로젝트 세팅/코드 구현 시 이 구조와 `.cursor/rules/`의 glob 경로를 기준으로 삼는다.
