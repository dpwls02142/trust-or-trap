import "server-only";

import { GoogleGenAI, ThinkingLevel, type ThinkingConfig } from "@google/genai";
import { resolveAgeBand } from "@/lib/scenario/persona-matching";
import type { AppType, ChatHistoryEntry, ScenarioId, ScenarioNode, UserProfile } from "@/lib/scenario/types";

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
 * 앱·페르소나별 단답형 말투 가이드.
 * 실제 카톡/DM처럼 짧게 끊어 말하도록 LLM에 고정 주입한다.
 */
function buildDialogueStyleGuide(currentNode: ScenarioNode, userProfile: UserProfile): string {
  const ageBand = resolveAgeBand(userProfile.userAge);
  const isTeenPersona = ageBand === "teen";
  const isSeniorPersona = ageBand === "fifties" || ageBand === "senior";
  const isMaleUser = userProfile.gender === "male";

  const appChannelGuide: Record<Exclude<AppType, "home">, string> = {
    chat: "메시지앱 1:1 채팅. 한 번에 보내는 말풍선 1개, 15~50자. 줄바꿈·장문·설명체 금지. 카카오톡·텔레그램 등 실제 앱명 언급 금지.",
    sms: "문자 메시지. 10~35자. 딱딱하거나 급한 톤. 한 줄.",
    insta: "인스타 DM/댓글 톤. 10~40자. 가볍고 짧게. 이모지 0~1개만(과다 금지).",
    call: "통화 자막. 구어체 단편 10~45자. '어 그게', '지금요?'처럼 끊어 말함.",
    bank: "은행/송금 앱 알림·상담. 15~45자. 짧은 안내·재촉. 공문체 장문 금지.",
    browser: "가짜 사이트 팝업/안내. 15~40자. 짧고 긴박하게.",
  };

  const appType = currentNode.app_type === "home" ? "chat" : currentNode.app_type;
  const channelLine = appChannelGuide[appType];

  let communityToneLine: string;
  if (isTeenPersona) {
    communityToneLine =
      "10대 메신저 단답(ㅋㅋ, ㅇㅇ, 진짜?, ㄹㅇ). 성인 커뮤니티 비속어·선정 표현 금지.";
  } else if (isSeniorPersona) {
    communityToneLine =
      "50·60대가 실제 받는 문자/전화 톤. '여보세요', '지금 가능하세요?'처럼 짧고 단호. 인터넷 밈·ㅋㅋ 남용 금지.";
  } else if (isMaleUser) {
    communityToneLine =
      "상대(스캐머) 말투는 디시인사이드식 남성 채팅 참고: ㅋㅋ, ㅇㅇ, ㄹㅇ, 야/형, 짧게 밀어붙임. 욕설·혐오·성적 비하 금지.";
  } else {
    communityToneLine =
      "상대(스캐머) 말투는 쭉빵·인스타 댓글/DM 참고: 헐, 진짜?, ㅠㅠ, 알겠어, 짧은 감탄·재촉. 과한 이모지·선정 표현 금지.";
  }

  return [
    "## 말투·길이 (필수 — 현실감의 핵심)",
    `- 채널: ${channelLine}`,
    `- 톤: ${communityToneLine}`,
    "- message는 반드시 1개 말풍선 분량. 60자를 넘기지 않는다(공백 포함).",
    "- 한 메시지에 문장 2개 이상, 쉼표로 이어 붙인 장문, '안녕하세요 저는 ~' 같은 인사+설명 패턴 금지.",
    "- 위험 신호는 짧은 말 안에 자연스럽게 녹인다. 뜬금없는 장문 해설 금지.",
    "- options[].label도 카톡에서 탭할 법한 짧은 문장(8~25자). 긴 설명형 선택지 금지.",
  ].join("\n");
}

/**
 * advance용 시스템 프롬프트 — 노드 범위 밖 전개 생성 금지 + forbidden_content 고정 주입.
 */
export function buildAdvanceSystemPrompt(
  currentNode: ScenarioNode,
  userProfile: UserProfile,
): string {
  return [
    "당신은 피싱/디지털 스캠 '예방 교육 시뮬레이션'의 대사 생성기다.",
    "역할: 아래 노드 스펙의 사건을 **실제 한국인이 메시지앱·DM·문자로 주고받는 것처럼** 짧은 한국어 대사 1개로 표현.",
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
    "## 출력 JSON 형식",
    `{"message":"${currentNode.sender_name}의 단답 대사(60자 이내). '${userProfile.displayName}' 이름은 자연스럽게 0~1회만","sender":"${currentNode.sender_name}","options":[{"label":"8~25자 짧은 선택지","risk_flag":"safe|caution|risky"}],"risk_flags":["위험 신호 한 줄 요약"]}`,
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

export function buildAdvanceUserPrompt(
  scenarioId: ScenarioId,
  currentNode: ScenarioNode,
  chatHistory: ChatHistoryEntry[],
  userProfile: UserProfile,
): string {
  const historyText =
    chatHistory.length === 0
      ? "(첫 대화 — 상대가 먼저 말을 건다)"
      : chatHistory
          .map((entryItem) => `[${entryItem.speaker}] ${entryItem.messageText}`)
          .join("\n");

  const usesEmailContact =
    currentNode.app_type === "sms" && scenarioId === "teen-female-grooming";
  const emailContactNote = usesEmailContact
    ? "연락처 맥락: 상대는 휴대전화 번호가 없고 이메일로만 연락한다. '메시지앱'으로 옮기자고 하되 텔레그램·카카오톡 등 실제 앱명은 쓰지 않는다."
    : null;

  return [
    `사용자: ${userProfile.displayName}, ${userProfile.userAge}, ${userProfile.gender}`,
    `앱: ${currentNode.app_type}, 상대: ${currentNode.sender_name}`,
    ...(emailContactNote ? [emailContactNote] : []),
    "",
    "지금까지 대화:",
    historyText,
    "",
    "위 노드에 맞는 **다음 말풍선 1개**를 JSON으로 생성. 60자 이내 단답만.",
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
