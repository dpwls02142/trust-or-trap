import type { AppType } from "@/lib/scenario/types";

/**
 * 앱 전환 컨펌 문구 — 주인공(플레이어) 1인칭 시점.
 * 시스템 안내("이 앱으로 이동하시겠습니까?")가 아닌 내적 독백/고민 형태.
 */
const appTransitionPromptMap: Partial<Record<AppType, string>> = {
  chat: "토크로 답하는 게 좋을까?",
  sms: "문자로 답하는 게 좋을까?",
  call: "전화하는 게 좋을까?",
  insta: "DM을 확인해볼까?",
  bank: "은행 앱을 열어볼까?",
  browser: "링크를 눌러볼까?",
};

export function resolveAppTransitionPrompt(targetAppType: AppType): string {
  return appTransitionPromptMap[targetAppType] ?? "이 앱을 열어볼까?";
}

/** SMS 등에서 안내된 번호로 직접 걸어야 할 때 */
export function resolveOutboundDialTransitionPrompt(): string {
  return "문자에 적힌 번호로 전화해볼까?";
}

/** 통화를 끊은 뒤 같은 번호로 다시 걸어야 할 때 */
export function resolveOutboundRedialTransitionPrompt(): string {
  return "통화가 끊겼는데, 다시 걸어볼까?";
}
