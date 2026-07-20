# Trust or Trap — 도메인 용어집 (Single Source of Naming)

> 코드/시나리오/문서 전반에서 **동일한 식별자와 값**을 쓰기 위한 기준 문서입니다.
> 새 시나리오·컴포넌트·필드를 만들 때 여기 정의된 명칭을 그대로 사용하세요. 새 개념을 추가하면 이 문서를 먼저 갱신합니다.

---

## 1. 페르소나 코드 (`personaCode`)

`{ageBand}-{gender}` 형식. 온보딩 매칭 로직의 키.

| personaCode | 연령대 | 성별 | 기본 매칭 시나리오 ID |
| --- | --- | --- | --- |
| `teen-female` | 10대 | 여성 | `teen-female-grooming` |
| `teen-male` | 10대 | 남성 | `teen-male-gameitem` |
| `twenties-female` | 20대 | 여성 | `twenties-female-romance` |
| `twenties-male` | 20대 | 남성 | `twenties-male-voicephishing` |
| `middle-female` | 30~40대 | 여성 | `middle-invest-scam` |
| `middle-male` | 30~40대 | 남성 | `middle-invest-scam` |
| `fifties-female` | 50대 | 여성 | `fifties-loan-scam` |
| `fifties-male` | 50대 | 남성 | `fifties-loan-scam` |
| `senior-female` | 60대+ | 여성 | `senior-authority-scam` |
| `senior-male` | 60대+ | 남성 | `senior-authority-scam` |

- `ageBand` 값: `teen` | `twenties` | `middle`(30~40대) | `fifties` | `senior`(60대+)
- `gender` 값: `female` | `male`

## 2. 시나리오 ID (`scenarioId`) — 총 7종

| scenarioId | 범죄 유형 | 음성(voice) | 비고 |
| --- | --- | --- | --- |
| `teen-female-grooming` | 디지털 성범죄(온라인 그루밍) | ❌ 없음 | 텍스트/이미지 채팅형만 |
| `teen-male-gameitem` | 게임 아이템 사기 / 몸캠피싱 | ❌ 없음 | 텍스트/이미지 채팅형만 |
| `twenties-female-romance` | 로맨스 스캠 | ✅ 있음 | 실존 확인 미니 조사 분기 |
| `twenties-male-voicephishing` | 알바위장 대출빙자형 보이스피싱 | ✅ 있음 | 대포통장 형사 리스크 학습 |
| `middle-invest-scam` | 투자리딩방(주식·코인) | ✅ 있음 | 30~40대 남녀 공통 |
| `fifties-loan-scam` | 대환대출·정책자금 빙자형 보이스피싱 | ✅ 있음 | 50대 남녀 공통 |
| `senior-authority-scam` | 기관사칭형 보이스피싱 | ✅ 있음 | 60대+ 남녀 공통, 자녀 사칭 병행 |

> `teen-*`로 시작하는 시나리오는 **항상 음성 미적용 + 강화된 콘텐츠 안전 규칙** 대상.

## 3. 노드 스펙 필드 (시나리오 그래프 JSON)

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `node_id` | string | 노드 고유 ID (시나리오 내 유일) |
| `stage` | enum | 사건 단계 (아래 §4) |
| `app_type` | enum | 렌더링할 폰 앱 (아래 §5) |
| `required_risk_signal` | string | 이 노드에서 반드시 드러나야 하는 위험 신호 |
| `forbidden_content` | string[] | 생성 금지 표현 목록 |
| `options` | Option[] | 사용자 선택지 (자유 입력 허용 여부 포함) |
| `next_node_map` | Record<riskFlag, node_id> | 판정 결과별 다음 노드 |
| `voice_enabled` | boolean | TTS/STT 사용 여부 (teen은 false) |
| `is_ending` | boolean | 엔딩 노드 여부 |
| `ending_type` | enum? | 엔딩 노드일 때 `safe`/`warning`/`harm` |
| `speaker_tone` | enum? | 화자(스캐머) 말투 프리셋 (§3.1). 플레이어 나이와 무관하게 화자 기준으로 고정 |
| `ending_consequence` | object? | 엔딩 노드 필수. 플레이어 행동의 구체적 결과 (§3.2) |
| `outbound_dial_number` | string? | 플레이어가 키패드로 직접 걸어야 하는 가상 번호. SMS 노드는 LLM 대사에 포함, call 노드는 연결 전 검증 |

## 3.1 화자 말투 (`speaker_tone`)

대사 생성 시 화자(스캐머) 말투는 **플레이어 나이대가 아니라 화자 정체성**으로 결정한다.
상담원·수사관은 플레이어가 몇 살이든 항상 동일한 상담원 말투를 쓴다.

| speaker_tone | 화자 | 사용 시나리오 예 |
| --- | --- | --- |
| `professional_agent` | 금융사 상담원·기관 수사관 사칭 | voicephishing, loan-scam, authority-scam |
| `confident_expert` | 리딩방 '전문가' | invest-scam |
| `intimate_partner` | 로맨스/그루밍 — 다정하고 사근사근 | romance, grooming |
| `community_peer` | 게임 커뮤니티 또래 반말 | gameitem |
| `family_casual` | 가족(실제·사칭 모두) 일상 문자 | 자녀 사칭, 배우자 걱정 메시지 |

## 3.2 엔딩 결과 (`ending_consequence`)

엔딩 노드에 필수. "경고문"이 아니라 **행동 → 결과**를 사실적으로 보여줘 경각심을 만든다.
구체 금액은 실제 이체값이 아니어서 허구적으로 느껴지므로 **명시하지 않는다**(정성적 서술로 충격을 전달).

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `consequence_headline` | string | 결과 한 줄 (예: "'일부만' 보낸 돈은 3분 만에 인출됐습니다") |
| `consequence_details` | string[] | 무슨 일이 벌어졌는지 2~4개 항목 |

## 3.5 그래프 메타 필드 (시나리오 그래프 JSON 최상위)

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `scenario_id` | string | 시나리오 ID (§2, 파일명과 일치) |
| `crime_category` | enum | 범죄 카테고리 (§8) |
| `title` | string | 사용자에게 노출되는 시나리오 제목 |
| `synopsis` | string | 온보딩 추천 화면에 표시할 한 줄 시놉시스 |
| `voice_enabled` | boolean | 시나리오 전체 음성 사용 여부 (teen은 false) |
| `entry_node_id` | string | 스토리 시작 노드 ID |
| `nodes` | Node[] | 노드 목록 (§3) |

> **프롤로그·잠금화면 연출**은 그래프 JSON이 아니라 `src/lib/scenario/scenario-context-setup.ts`에서 시나리오별로 관리한다 (온보딩 몰입용 정적 데이터).

## 3.6 대화 히스토리 (`ChatHistoryEntry`) 보조 필드

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `contactName` | string? | 프롤로그·과거 대화 연출용 연락처 이름. `nodeId: scenario-prologue`와 함께 사용 |
| `nodeId: scenario-prologue` | string | LLM advance/judge 대상이 아닌 정적 프롤로그 메시지 마커 |

## 4. 사건 단계 (`stage`)

모든 시나리오가 공유하는 공통 골격.

| stage | 의미 |
| --- | --- |
| `approach` | 접근 (첫 컨택) |
| `trust_building` | 신뢰/친밀감 형성 |
| `risk_signal` | 위험 신호 제시 |
| `demand` | 요구(송금/사진/설치/이체 등) |
| `branch` | 사용자 판단 분기점 |
| `ending` | 결말 (safe/warning/harm) |

## 5. 폰 앱 타입 (`app_type`)

"폰 속의 폰" UI에서 노드가 렌더링될 앱 화면.

| app_type | 컴포넌트 | 용도 |
| --- | --- | --- |
| `chat` | `<ChatApp>` | 카카오톡류 메신저 대화 |
| `sms` | `<SMSApp>` | 문자 메시지 |
| `call` | `<CallScreen>` | 음성 통화 화면 |
| `insta` | `<InstaApp>` | 인스타 DM/피드 |
| `bank` | `<BankApp>` | 은행/송금 앱 |
| `browser` | `<BrowserApp>` | 가짜 사이트/역이미지 검색 |
| `home` | `<HomeScreen>` | 홈 화면(앱 아이콘) |

## 6. 위험 플래그 (`risk_flag`)

사용자 응답을 LLM이 판정한 결과. `next_node_map`의 키로 사용.

| risk_flag | 의미 | 일반적 다음 전개 |
| --- | --- | --- |
| `safe` | 위험 신호를 식별하고 회피/검증/신고 | 안전 엔딩 경로 |
| `caution` | 부분적으로 응하거나 경계가 불완전 | 경고(warning) 경로 |
| `risky` | 요구에 응해 피해로 진행 | 피해심화(harm) 경로 |

> 실제 그래프에서는 노드마다 `next_node_map`이 위 3개 플래그를 다음 노드로 매핑한다. 세부 플래그가 더 필요하면 이 표에 먼저 추가한다.

## 7. 엔딩 타입 (`ending_type`)

| ending_type | 결말 | 후속 |
| --- | --- | --- |
| `safe` | ✅ 안전 회피 | 안전 종료 |
| `warning` | ⚠️ 소액 피해 후 인지 | 신고/지원기관 절차 안내 |
| `harm` | 🚨 피해 심화 | 사후 대응·회복 절차 안내 |

## 8. 범죄 카테고리 (`crimeCategory`)

| crimeCategory | 한글명 |
| --- | --- |
| `grooming` | 온라인 그루밍(디지털 성범죄) |
| `gameitem_scam` | 게임 아이템 사기/몸캠피싱 |
| `romance_scam` | 로맨스 스캠 |
| `loan_voicephishing` | 대출빙자형 보이스피싱 |
| `invest_scam` | 투자리딩방 |
| `authority_voicephishing` | 기관사칭형 보이스피싱 |

## 9. 환경변수 이름 (`.env` — 값은 커밋 금지)

| 변수명 | 용도 |
| --- | --- |
| `GEMINI_API_KEY` | Gemini API 키 (서버 전용) |
| `TYPECAST_API_KEY` | Typecast TTS 키 (서버 전용) |
| `TYPECAST_DEFAULT_VOICE_ID` | 기본 보이스 ID |
| `GEMINI_MODEL` | (선택) Gemini 모델 ID. 미설정 시 `gemini-3.1-flash-lite`(기본, 신규 사용자 가용·저가) |
| `GEMINI_FALLBACK_MODEL` | (선택) 404/429/503 시 대체 모델. 미설정 시 `gemini-3.5-flash` |

> 실제 키 값은 `.env`(gitignore)에만. `.env.example`에는 **키 이름만** 둔다.

## 10. 명명 규칙

- 코드 식별자(변수·함수·타입)는 **의미가 드러나도록 두 단어 이상**으로 작성한다. 예: `currentNode`, `personaCode`, `riskFlagResult`, `scenarioGraph`.
- 파일: 컴포넌트 `PascalCase.tsx`, 그 외 `kebab-case.ts`, 시나리오 JSON `{scenarioId}.json`.
- 시나리오 JSON 파일명은 `scenarioId`와 **정확히 일치**해야 한다.
