import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import type { ChatHistoryEntry, ScenarioNode, UserProfile } from "@/lib/scenario/types";

/**
 * Claude API 클라이언트 (서버 전용).
 * 키는 process.env.ANTHROPIC_API_KEY 로만 접근하며 절대 클라이언트로 내보내지 않는다.
 */

let cachedAnthropicClient: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!cachedAnthropicClient) {
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicApiKey) {
      throw new Error("ANTHROPIC_API_KEY 환경변수가 설정되지 않음");
    }
    cachedAnthropicClient = new Anthropic({ apiKey: anthropicApiKey });
  }
  return cachedAnthropicClient;
}

export function resolveClaudeModel(): string {
  return process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-5";
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
    "당신의 역할은 아래 노드 스펙이 정의한 사건을 자연스러운 한국어 대사로 표현하는 것뿐이다.",
    "",
    "## 절대 규칙",
    "1. 노드 스펙 범위를 벗어난 새로운 사건 전개를 만들지 않는다.",
    `2. 이 노드에서 반드시 드러나야 하는 위험 신호: "${currentNode.required_risk_signal}"`,
    "3. 아래 내용은 어떤 경우에도 생성 금지:",
    ...currentNode.forbidden_content.map((forbiddenItem) => `   - ${forbiddenItem}`),
    "4. 응답은 반드시 아래 JSON 형식만 출력한다. JSON 외 텍스트(마크다운, 설명) 금지.",
    "",
    "## 출력 JSON 형식",
    `{"message":"상대방(${currentNode.sender_name})의 대사. 사용자 이름 '${userProfile.displayName}'을 자연스럽게 활용","sender":"${currentNode.sender_name}","options":[{"label":"선택지 문구","risk_flag":"safe|caution|risky"}],"risk_flags":["이 대사에 포함된 위험 신호 요약"]}`,
    "",
    "## options 규칙",
    "- 아래에 주어진 기본 선택지의 risk_flag 구성(safe/caution/risky)을 유지하되, 대화 흐름에 맞게 문구만 다듬을 수 있다.",
    `- 기본 선택지: ${JSON.stringify(currentNode.options)}`,
    "",
    "이것은 예방 교육이다. 위험 '구조'를 체감시키되 실제 유해 콘텐츠를 재현하지 않는다.",
  ].join("\n");
}

export function buildAdvanceUserPrompt(
  chatHistory: ChatHistoryEntry[],
  userProfile: UserProfile,
): string {
  const historyText =
    chatHistory.length === 0
      ? "(첫 대화 — 상대가 먼저 말을 건다)"
      : chatHistory
          .map((entryItem) => `[${entryItem.speaker}] ${entryItem.messageText}`)
          .join("\n");

  return [
    `사용자 프로필: 이름 ${userProfile.displayName}, 나이 ${userProfile.userAge}, 성별 ${userProfile.gender}`,
    "",
    "지금까지의 대화:",
    historyText,
    "",
    "위 노드 스펙에 맞춰 다음 대사를 JSON으로 생성하라.",
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
