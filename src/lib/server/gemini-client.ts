import "server-only";

import { GoogleGenAI, ThinkingLevel, type ThinkingConfig } from "@google/genai";
import { resolveAgeBand } from "@/lib/scenario/persona-matching";
import {
  resolveBrowserPageConfig,
  shouldShowBrowserPageNotice,
} from "@/lib/phone/browser-scenario-page";
import type {
  AppType,
  ChatHistoryEntry,
  RiskFlag,
  ScenarioId,
  ScenarioNode,
  SpeakerTone,
  UserProfile,
} from "@/lib/scenario/types";

/**
 * Gemini API 클라이언트 (서버 전용).
 * 키는 process.env.GEMINI_API_KEY 로만 접근하며 절대 클라이언트로 내보내지 않는다.
 */

let cachedGeminiClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (!cachedGeminiClient) {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      throw new Error("GEMINI_API_KEY 환경변수가 설정되지 않음");
    }
    cachedGeminiClient = new GoogleGenAI({ apiKey: geminiApiKey });
  }
  return cachedGeminiClient;
}

export function resolveGeminiModel(): string {
  // 2.5-flash-lite는 신규 사용자에게 404 — 3.1-flash-lite가 현재 최저가·가용 모델
  return process.env.GEMINI_MODEL ?? "gemini-3.1-flash-lite";
}

/**
 * 기본 모델이 쿼터 초과(429)/과부하(503)/미제공(404)일 때 재시도할 대체 모델.
 * 무료 티어 쿼터는 모델별로 따로 집계되므로 별도 모델로 폴백하면 계속 플레이할 수 있다.
 */
export function resolveGeminiFallbackModel(): string {
  return process.env.GEMINI_FALLBACK_MODEL ?? "gemini-3.5-flash";
}

/**
 * 404(모델 미제공)/429(쿼터 초과)/503(일시 과부하) — 대체 모델로 즉시 재시도할 가치가 있는 오류.
 */
export function isQuotaOrOverloadError(unknownError: unknown): boolean {
  const errorStatus = (unknownError as { status?: number } | null)?.status;
  return errorStatus === 404 || errorStatus === 429 || errorStatus === 503;
}

/**
 * 대사 생성/판정은 저지연이 중요하므로 thinking을 최소화한다.
 * Gemini 3.x는 thinking 토큰이 maxOutputTokens에 포함되므로,
 * thinking이 길어지면 정작 JSON 응답이 잘려 파싱 실패가 난다 → MINIMAL로 억제.
 * - flash 계열: MINIMAL (사실상 no thinking, 첫 토큰 지연 최소화)
 * - pro 계열: MINIMAL 미지원 → LOW
 * - 2.5 계열(구형 오버라이드 대비): thinkingBudget: 0 (thinkingLevel과 동시 사용 시 400)
 */
export function resolveThinkingConfig(modelName: string): ThinkingConfig {
  if (modelName.includes("2.5")) return { thinkingBudget: 0 };
  if (modelName.includes("pro")) return { thinkingLevel: ThinkingLevel.LOW };
  return { thinkingLevel: ThinkingLevel.MINIMAL };
}

/**
 * 화자(스캐머) 말투 프리셋별 톤 가이드.
 * 핵심: 상담원·수사관은 **플레이어 나이와 무관하게** 항상 동일한 사무적 상담원 말투를 쓴다.
 * speaker_tone이 없는 노드만 예외적으로 플레이어 프로필 기반 폴백을 쓴다.
 */
const speakerToneGuideMap: Record<SpeakerTone, string> = {
  professional_agent:
    "실제 금융사 상담원/기관 직원처럼 시종일관 정중한 존댓말. '고객님', '~도와드리겠습니다', '본인 확인 절차입니다' 같은 사무적 표현. 침착하고 또박또박, 급할 때도 예의는 유지. ㅋㅋ·ㅇㅇ·이모지·반말·인터넷 밈 절대 금지. 종결어미는 '~습니다/~세요/~요'만 — '~해/~야' 반말로 바꾸지 않는다. 플레이어가 몇 살이든 말투는 동일하게 유지한다.",
  confident_expert:
    "리딩방 '전문가' 톤. 자신감 있고 단정적인 존댓말. '지금 안 들어가시면 후회하십니다', '제 말만 믿으세요'처럼 확신에 찬 부추김. 이모지·반말 금지. 종결어미는 '~습니다/~세요/~십니다'만 — 반말로 내려가지 않는다.",
  intimate_partner:
    "다정하고 사근사근한 톤. 부드러운 말투로 친밀감을 표현. 감정에 호소('나 믿지?', '보고 싶었어'). 과한 이모지·선정적 표현 금지. 친밀한 반말('~해/~야')로 통일 — 존댓말과 반말을 섞지 않는다.",
  community_peer:
    "게임 커뮤니티 또래 반말. ㅋㅋ, ㅇㅇ, ㄹㅇ, 짧게 밀어붙임. 욕설·혐오·성적 비하 금지. 반말만 — 존댓말('~요/~습니다')로 바꾸지 않는다.",
  family_casual:
    "가족끼리 주고받는 일상 문자 톤. '엄마 나야', '아빠 잠깐만'처럼 짧고 급하게. 이모지 0~1개. 반말·해체로 통일 — 존댓말과 섞지 않는다.",
};

type ScammerSpeechLevel = "formal" | "informal";

const formalEndingPattern = /(?:습니다|세요|십니다|요|니다)(?:[.?!…]|$)/;
const informalEndingPattern = /(?:[가-힣]+(?:야|해|지|니|거든|잖아)|[가-힣]{1,3})(?:[.?!…]|$)/;

/** 화자 말투 프리셋별 고정 존댓말/반말 — 대화 내내 바꾸면 안 되는 수준 */
const fixedSpeechLevelByTone: Partial<Record<SpeakerTone, ScammerSpeechLevel>> = {
  professional_agent: "formal",
  confident_expert: "formal",
  intimate_partner: "informal",
  community_peer: "informal",
  family_casual: "informal",
};

const speechLevelGuideMap: Record<ScammerSpeechLevel, string> = {
  formal:
    "존댓말 고정: '~습니다/~세요/~요' 종결만. 반말('~해/~야')·해체로 내려가지 않는다.",
  informal:
    "반말 고정: '~해/~야/~지' 종결만. 존댓말('~요/~습니다')로 올리지 않는다.",
};

function inferScammerSpeechLevel(
  chatHistory: ChatHistoryEntry[],
): ScammerSpeechLevel | null {
  for (const entryItem of chatHistory) {
    if (entryItem.speaker !== "scammer") continue;
    const trimmedText = entryItem.messageText.trim();
    if (!trimmedText) continue;
    if (formalEndingPattern.test(trimmedText)) return "formal";
    if (informalEndingPattern.test(trimmedText)) return "informal";
  }
  return null;
}

function buildSpeechLevelConsistencyRule(
  currentNode: ScenarioNode,
  chatHistory: ChatHistoryEntry[],
): string {
  const presetSpeechLevel = currentNode.speaker_tone
    ? fixedSpeechLevelByTone[currentNode.speaker_tone]
    : null;
  const historySpeechLevel = inferScammerSpeechLevel(chatHistory);
  const lockedSpeechLevel = historySpeechLevel ?? presetSpeechLevel;

  if (!lockedSpeechLevel) {
    return "- 존댓말/반말 수준은 대화 내내 고정. 한 번 정해진 종결어미를 노드·응답마다 바꾸지 않는다.";
  }

  return `- ${speechLevelGuideMap[lockedSpeechLevel]} 이전 말풍선과 존댓말/반말 수준이 달라지면 안 된다.`;
}

/**
 * 앱·페르소나별 단답형 말투 가이드.
 * 실제 카톡/DM처럼 짧게 끊어 말하도록 LLM에 고정 주입한다.
 */
function buildDialogueStyleGuide(currentNode: ScenarioNode, userProfile: UserProfile): string {
  const appChannelGuide: Record<Exclude<AppType, "home">, string> = {
    chat: "메시지앱 1:1 채팅. 한 번에 보내는 말풍선 1개, 15~50자. 줄바꿈·장문·설명체 금지. 카카오톡·텔레그램 등 실제 앱명 언급 금지.",
    sms: "문자 메시지. 10~35자. 딱딱하거나 급한 톤. 한 줄.",
    insta: "인스타 DM/댓글 톤. 10~40자. 가볍고 짧게. 이모지 0~1개만(과다 금지).",
    call: "통화 자막. 구어체 단편 10~45자. '어 그게', '지금요?'처럼 끊어 말함.",
    bank: "은행/송금 앱 알림·상담. 15~45자. 송금·입금 재촉만 짧게. 통화 대사처럼 쓰지 않는다.",
    browser: "가짜 웹페이지 본문·팝업·배너 문구. 대화체·말풍선·'~님이' 형태 금지. 20~50자. 사이트 UI에 들어갈 짧은 유도·경고 문구.",
  };

  const appType = currentNode.app_type === "home" ? "chat" : currentNode.app_type;
  const openGroupChatLine =
    "메시지앱 오픈채팅(단톡). 방장·전문가가 방 전체에게 말하는 공지/대화. '회원님들', '방 안', '248명' 등 단체 맥락. 15~50자.";
  const channelLine =
    appType === "chat" && currentNode.chat_room_kind === "open_group"
      ? openGroupChatLine
      : appChannelGuide[appType];

  let toneLine: string;
  if (currentNode.speaker_tone) {
    // 화자 정체성 기준 — 플레이어 나이·성별과 무관하게 고정
    toneLine = speakerToneGuideMap[currentNode.speaker_tone];
  } else {
    // 폴백: speaker_tone 미지정 노드만 플레이어 프로필로 추정
    const ageBand = resolveAgeBand(userProfile.userAge);
    if (ageBand === "teen") {
      toneLine = "10대 메신저 단답(ㅋㅋ, ㅇㅇ, 진짜?, ㄹㅇ). 성인 커뮤니티 비속어·선정 표현 금지.";
    } else if (ageBand === "fifties" || ageBand === "senior") {
      toneLine =
        "실제 받는 문자/전화 톤. '여보세요', '지금 가능하세요?'처럼 짧고 단호. 인터넷 밈·ㅋㅋ 남용 금지.";
    } else {
      toneLine = "짧은 구어체 단답. 과한 이모지·선정 표현 금지.";
    }
  }

  return [
    "## 말투·길이 (필수 — 현실감의 핵심)",
    `- 채널: ${channelLine}`,
    `- 화자 말투: ${toneLine}`,
    "- message는 반드시 1개 말풍선 분량. 60자를 넘기지 않는다(공백 포함).",
    "- 한 메시지에 문장 2개 이상, 쉼표로 이어 붙인 장문, '안녕하세요 저는 ~' 같은 인사+설명 패턴 금지.",
    "- 위험 신호는 짧은 말 안에 자연스럽게 녹인다. 뜬금없는 장문 해설 금지.",
    "- options[].label도 카톡에서 탭할 법한 짧은 문장(8~25자). 긴 설명형 선택지 금지.",
    buildSpeechLevelConsistencyRule(currentNode, []),
  ].join("\n");
}

/**
 * advance용 시스템 프롬프트 — 노드 범위 밖 전개 생성 금지 + forbidden_content 고정 주입.
 */
export function buildAdvanceSystemPrompt(
  currentNode: ScenarioNode,
  userProfile: UserProfile,
): string {
  const isBrowserNode = currentNode.app_type === "browser";
  const browserPageConfig = isBrowserNode
    ? resolveBrowserPageConfig(currentNode.node_id)
    : null;
  const showBrowserPageNotice =
    browserPageConfig &&
    shouldShowBrowserPageNotice(browserPageConfig.pageVariant);

  const roleLine = isBrowserNode
    ? "역할: 아래 노드 스펙의 사건을 **가짜 웹페이지 안내 문구** 1개로 표현. 상대방 대화·말풍선이 아니다."
    : "역할: 아래 노드 스펙의 사건을 **실제 한국인이 메시지앱·DM·문자로 주고받는 것처럼** 짧은 한국어 대사 1개로 표현.";

  const reactionSection = isBrowserNode
    ? [
        "## 페이지 문구 규칙",
        "- message는 웹사이트 팝업·배너·안내 박스에 들어갈 문구다. 1인칭 대화·상대 이름 호칭 금지.",
        "- 플레이어 직전 반응을 반영하되, 사이트가 보여주는 유도·압박 문구 형태로 쓴다.",
        ...(showBrowserPageNotice
          ? []
          : [
              "- 이 노드는 역이미지 검색 결과 화면이다. message는 짧은 검색 요약(20자 내외)으로만 쓰고, 대화체는 쓰지 않는다.",
            ]),
      ]
    : [
        "## 직전 반응 규칙 (대화가 살아있게 — 중요)",
        "- 히스토리의 마지막 '플레이어' 말과 그 태도에 **먼저 짧게 반응**한 뒤, 이 노드의 위험 신호를 이어간다.",
        "- 플레이어가 거절/의심/따지면: 화내지 말고 회유·안심·서운함·부드러운 압박으로 되받으며 설득한다.",
        "- 플레이어가 적극적/호의적이면: 신뢰를 확인하듯 한 발 더 밀어붙인다.",
        "- 플레이어가 미온적/짧게 답하면: 관심을 끌어 자연스럽게 대화를 잇는다.",
        "- 같은 노드라도 플레이어 말에 따라 **표현·어휘·감정 반응은 매번 달라져야** 한다. 스크립트를 읽듯 똑같이 말하지 않는다.",
        "- 단, 존댓말/반말 수준(종결어미)은 절대 바꾸지 않는다. 존댓말 화자가 반말로, 반말 화자가 존댓말로 섞어 쓰지 않는다.",
        "- 단, 반응이 달라져도 위 위험 신호(사건 자체)는 반드시 드러낸다 — 전개 순서는 바뀌지 않는다.",
      ];

  const messageFormatLine = isBrowserNode
    ? `{"message":"웹페이지 안내 문구(50자 이내). 대화체 금지","sender":"${currentNode.sender_name}","options":[{"label":"8~25자 짧은 선택지","risk_flag":"safe|caution|risky"}],"risk_flags":["위험 신호 한 줄 요약"]}`
    : `{"message":"${currentNode.sender_name}의 단답 대사(60자 이내). '${userProfile.displayName}' 이름은 자연스럽게 0~1회만","sender":"${currentNode.sender_name}","options":[{"label":"8~25자 짧은 선택지","risk_flag":"safe|caution|risky"}],"risk_flags":["위험 신호 한 줄 요약"]}`;

  return [
    "당신은 피싱/디지털 스캠 '예방 교육 시뮬레이션'의 대사 생성기다.",
    roleLine,
    "",
    buildDialogueStyleGuide(currentNode, userProfile),
    "",
    "## 절대 규칙",
    "1. 노드 스펙 범위를 벗어난 새로운 사건 전개를 만들지 않는다.",
    `2. 이 노드에서 반드시 드러나야 하는 위험 신호: "${currentNode.required_risk_signal}"`,
    "3. 아래 내용은 어떤 경우에도 생성 금지:",
    ...currentNode.forbidden_content.map((forbiddenItem) => `   - ${forbiddenItem}`),
    "4. 응답은 반드시 아래 JSON 형식만 출력한다. JSON 외 텍스트(마크다운, 설명) 금지.",
    "",
    ...reactionSection,
    "",
    "## 출력 JSON 형식",
    messageFormatLine,
    "",
    "## options 규칙",
    "- 아래 기본 선택지의 risk_flag(safe/caution/risky) 구성은 유지. label만 대화 흐름에 맞게 **짧게** 다듬는다.",
    `- 기본 선택지: ${JSON.stringify(currentNode.options)}`,
    "",
    ...(currentNode.outbound_dial_number
      ? [
          "## 발신 번호 (필수)",
          `- message 본문에 상담 문의 전화번호 "${currentNode.outbound_dial_number}"를 반드시 그대로 포함한다.`,
          "- 번호 형식(하이픈 포함 여부)은 위 값과 동일하게 쓴다.",
          "",
        ]
      : []),
    "## 좋은 message 예시 (이 정도 길이)",
    '- "야 ㅋㅋ 지금 통장 확인 가능?"',
    '- "진짜?? ㅠㅠ 나 급한데 도와줄 수 있어?"',
    '- "형 잠깐만 전화 받아봐"',
    "",
    "## 나쁜 message 예시 (절대 금지)",
    '- "안녕하세요. 저는 ○○은행 직원입니다. 고객님의 계좌에서 이상 거래가 감지되어 확인이 필요합니다. 아래 링크를..."',
    "",
    "예방 교육용이다. 위험 '구조'만 체감시키고 실제 유해 콘텐츠·장문 설교는 하지 않는다.",
  ].join("\n");
}

/** judge가 낸 risk_flag를 화자 반응 지침으로 번역 */
const playerStanceGuideMap: Record<RiskFlag, string> = {
  safe: "경계하거나 거절/의심하는 태도 → 화내지 말고 회유·안심·서운함으로 되받아 설득한다",
  caution: "망설이거나 미온적인 태도 → 부드럽게 밀어붙이며 결정을 유도한다",
  risky: "호의적이거나 적극적으로 응하는 태도 → 신뢰를 확인하듯 한 발 더 밀어붙인다",
};

export function buildAdvanceUserPrompt(
  scenarioId: ScenarioId,
  currentNode: ScenarioNode,
  chatHistory: ChatHistoryEntry[],
  userProfile: UserProfile,
  lastPlayerRiskFlag?: RiskFlag,
): string {
  const historyText =
    chatHistory.length === 0
      ? "(첫 대화 — 상대가 먼저 말을 건다)"
      : chatHistory
          .map((entryItem) => `[${entryItem.speaker}] ${entryItem.messageText}`)
          .join("\n");

  const lastPlayerEntry = [...chatHistory]
    .reverse()
    .find((entryItem) => entryItem.speaker === "player");

  const reactionNote =
    lastPlayerEntry && lastPlayerRiskFlag
      ? `플레이어 직전 반응: "${lastPlayerEntry.messageText}" → ${playerStanceGuideMap[lastPlayerRiskFlag]}`
      : lastPlayerEntry
        ? `플레이어 직전 반응: "${lastPlayerEntry.messageText}" → 이 말에 먼저 반응한 뒤 위험 신호를 이어간다`
        : null;

  const usesEmailContact =
    currentNode.app_type === "sms" && scenarioId === "teen-female-grooming";
  const emailContactNote = usesEmailContact
    ? "연락처 맥락: 상대는 휴대전화 번호가 없고 이메일로만 연락한다. '메시지앱'으로 옮기자고 하되 텔레그램·카카오톡 등 실제 앱명은 쓰지 않는다."
    : null;

  const browserEntryNote =
    currentNode.app_type === "browser"
      ? `맥락: ${resolveBrowserPageConfig(currentNode.node_id).entryContextText}`
      : null;

  const inviteSmsNote =
    currentNode.node_id === "approach-invite-sms"
      ? "초대 문자: message 본문에 'open-room.vip-invest.link/join' URL을 반드시 포함한다. 링크를 누르면 토크 오픈채팅방으로 바로 연결되는 맥락이다."
      : null;

  const fakeHtsChatNote =
    currentNode.node_id === "risk-fake-hts"
      ? "단톡방 맥락: message 본문에 공식 앱스토어가 아닌 가짜 HTS 설치 URL(secure-check.info-portal.xyz 등)을 반드시 포함한다. 링크를 누르면 브라우저 설치 페이지로 연결된다."
      : null;

  const openGroupChatNote =
    currentNode.chat_room_kind === "open_group"
      ? "오픈채팅(단톡) 맥락: 1:1이 아니라 방 전체에게 말한다. 방장·전문가 톤으로 단체 공지처럼 쓴다."
      : null;

  const bankChatPressureNote =
    currentNode.app_type === "bank"
      ? "은행 앱 맥락: 플레이어는 송금 화면에 있다. 같은 재촉은 토크(오픈채팅) 알림으로도 전달된다. 통화 중이 아니므로 전화 통화 대사처럼 쓰지 않는다."
      : null;

  return [
    `사용자: ${userProfile.displayName}, ${userProfile.userAge}, ${userProfile.gender}`,
    `앱: ${currentNode.app_type}, 상대: ${currentNode.sender_name}`,
    ...(emailContactNote ? [emailContactNote] : []),
    ...(inviteSmsNote ? [inviteSmsNote] : []),
    ...(fakeHtsChatNote ? [fakeHtsChatNote] : []),
    ...(openGroupChatNote ? [openGroupChatNote] : []),
    ...(bankChatPressureNote ? [bankChatPressureNote] : []),
    ...(browserEntryNote ? [browserEntryNote] : []),
    "",
    buildSpeechLevelConsistencyRule(currentNode, chatHistory),
    "",
    "지금까지 대화:",
    historyText,
    ...(reactionNote ? ["", reactionNote] : []),
    "",
    currentNode.app_type === "browser"
      ? "플레이어가 열어본 가짜 웹페이지에 표시할 **안내 문구 1개**를 JSON으로 생성. 대화체·말풍선 금지. 50자 이내."
      : "플레이어의 직전 반응에 먼저 반응한 뒤, 위 노드의 위험 신호를 담은 **다음 말풍선 1개**를 JSON으로 생성. 60자 이내 단답만.",
  ].join("\n");
}

/**
 * judge용 시스템 프롬프트 — 사용자 응답의 위험도 판정.
 */
export function buildJudgeSystemPrompt(currentNode: ScenarioNode): string {
  return [
    "당신은 피싱 예방 시뮬레이션의 위험도 판정기다.",
    `현재 상황의 위험 신호: "${currentNode.required_risk_signal}"`,
    "",
    "사용자의 응답을 다음 기준으로 판정한다:",
    "- safe: 위험 신호를 식별하고 회피/검증/신고하는 응답",
    "- caution: 부분적으로 응하거나 경계가 불완전한 응답",
    "- risky: 요구에 응해 피해로 진행되는 응답",
    "",
    '반드시 다음 JSON만 출력: {"risk_flag":"safe|caution|risky","reason":"판정 근거 한 문장"}',
  ].join("\n");
}
