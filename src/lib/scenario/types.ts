/**
 * Trust or Trap 도메인 타입 — docs/domain-glossary.md 명칭과 1:1 일치.
 * 외부에서 들어오는 데이터(그래프 JSON, LLM 응답, 요청 body)는
 * schemas.ts의 Zod 스키마로 파싱한 뒤 이 타입으로 사용한다.
 */

export type AgeBand = "teen" | "twenties" | "middle" | "fifties" | "senior";

export type GenderValue = "female" | "male";

/** `{ageBand}-{gender}` — 온보딩 매칭 로직의 키 (glossary §1) */
export type PersonaCode = `${AgeBand}-${GenderValue}`;

/** 시나리오 ID 7종 (glossary §2) */
export type ScenarioId =
  | "teen-female-grooming"
  | "teen-male-gameitem"
  | "twenties-female-romance"
  | "twenties-male-voicephishing"
  | "middle-invest-scam"
  | "fifties-loan-scam"
  | "senior-authority-scam";

/** 범죄 카테고리 (glossary §8) */
export type CrimeCategory =
  | "grooming"
  | "gameitem_scam"
  | "romance_scam"
  | "loan_voicephishing"
  | "invest_scam"
  | "authority_voicephishing";

/** 사건 단계 — 모든 시나리오 공통 골격 (glossary §4) */
export type StageValue =
  | "approach"
  | "trust_building"
  | "risk_signal"
  | "demand"
  | "branch"
  | "ending";

/** "폰 속의 폰"에서 노드가 렌더링될 앱 (glossary §5) */
export type AppType = "chat" | "sms" | "call" | "insta" | "bank" | "browser" | "home";

/** 사용자 응답 위험도 판정 결과 (glossary §6) */
export type RiskFlag = "safe" | "caution" | "risky";

/** 엔딩 3갈래 (glossary §7) */
export type EndingType = "safe" | "warning" | "harm";

/**
 * 화자(스캐머) 말투 프리셋 (glossary §3.1).
 * 플레이어 나이대가 아니라 화자 정체성으로 말투를 고정한다.
 * 상담원/수사관은 플레이어가 몇 살이든 항상 professional_agent.
 */
export type SpeakerTone =
  | "professional_agent"
  | "confident_expert"
  | "intimate_partner"
  | "community_peer"
  | "family_casual";

/**
 * 엔딩 결과 (glossary §3.2) — "경고문"이 아니라 행동→결과를 구체적으로 보여준다.
 * 경각심을 만드는 것이 목적이므로 무슨 일이 벌어졌는지 사실적으로 제시한다.
 * (구체 금액은 실제 이체값이 아니어서 허구적으로 느껴지므로 제외한다.)
 */
export interface EndingConsequence {
  consequence_headline: string;
  consequence_details: string[];
}

/** 노드 선택지 */
export interface NodeOption {
  label: string;
  risk_flag: RiskFlag;
}

/** 시나리오 그래프 노드 (glossary §3) */
export interface ScenarioNode {
  node_id: string;
  stage: StageValue;
  app_type: AppType;
  /** 이 노드에서 반드시 드러나야 하는 위험 신호 (LLM 대사 생성 기준) */
  required_risk_signal: string;
  /** 생성 금지 표현 목록 — 시스템 프롬프트에 고정 주입 */
  forbidden_content: string[];
  options: NodeOption[];
  /** 자유 텍스트/음성 입력 허용 여부 */
  allow_free_input: boolean;
  /** 판정 결과별 다음 노드. 엔딩 노드는 null */
  next_node_map: Record<RiskFlag, string> | null;
  /** TTS/STT 사용 여부 — teen 시나리오는 항상 false */
  voice_enabled: boolean;
  is_ending: boolean;
  ending_type: EndingType | null;
  /** 엔딩 노드의 구체적 결과 — is_ending일 때만 사용 */
  ending_consequence?: EndingConsequence;
  /** 화자 말투 프리셋 — 플레이어 나이와 무관하게 화자 기준으로 고정 */
  speaker_tone?: SpeakerTone;
  /** 상대(스캐머) 표시 이름 — 앱 UI 헤더/발신자 라벨 */
  sender_name: string;
  /** 연출 힌트: 경과일 표시(teen 장기 그루밍 체감), 응답 제한시간(초) 등 */
  elapsed_days?: number;
  timer_seconds?: number;
  /**
   * 플레이어가 키패드로 직접 걸어야 하는 가상 번호.
   * SMS 노드: LLM 대사에 포함할 상담 번호. call 노드: 연결 전 검증 대상.
   */
  outbound_dial_number?: string;
}

/** 시나리오 그래프 (그래프 메타 필드, glossary §3.5) */
export interface ScenarioGraph {
  scenario_id: ScenarioId;
  crime_category: CrimeCategory;
  title: string;
  synopsis: string;
  voice_enabled: boolean;
  entry_node_id: string;
  nodes: ScenarioNode[];
}

/** 온보딩에서 수집하는 사용자 프로필 (표시용, 저장 최소화) */
export interface UserProfile {
  displayName: string;
  userAge: number;
  gender: GenderValue;
}

/** 페르소나 매칭 결과 */
export interface PersonaMatchResult {
  personaCode: PersonaCode;
  primaryScenarioId: ScenarioId;
  alternativeScenarioIds: ScenarioId[];
}

/** 대화 히스토리 한 줄 */
export interface ChatHistoryEntry {
  speaker: "scammer" | "player" | "system";
  messageText: string;
  nodeId: string;
  /** 노드 연출 힌트 — 메시지 스레드에서 경과일 구분선 표시용 */
  elapsedDays?: number;
  /** 메시지가 생성된 앱 — 앱 전환 시 스레드 분리용 */
  appType?: AppType;
}

/** LLM 대사 생성 결과 — 구조화 JSON 강제 (자유 텍스트 금지) */
export interface AdvancePayload {
  message: string;
  sender: string;
  options: NodeOption[];
  risk_flags: string[];
}

/** judge API 응답 */
export interface JudgeResult {
  riskFlag: RiskFlag;
  nextNodeId: string;
  judgeReason: string;
}

/** 리플레이 리포트용 — 사용자가 지나온 노드에서 놓친/식별한 위험 신호 */
export interface RiskSignalRecord {
  nodeId: string;
  requiredRiskSignal: string;
  userRiskFlag: RiskFlag;
}
