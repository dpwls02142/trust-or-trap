import type { AppType, ChatHistoryEntry } from "@/lib/scenario/types";
import { filterChatHistoryByAppType } from "@/lib/phone/chat-history-view";

export interface MessageThreadSummary {
  senderName: string;
  previewText: string;
  threadHistory: ChatHistoryEntry[];
}

/**
 * 시나리오 상대와의 메시지 앱 대화 스레드 요약.
 * 홈에서 메시지 앱을 열었을 때 대화 목록·스레드 열람에 사용한다.
 */
export function buildScenarioMessageThread(
  chatHistory: ChatHistoryEntry[],
  appType: AppType,
  scenarioSenderName: string,
): MessageThreadSummary | null {
  const threadHistory = filterChatHistoryByAppType(chatHistory, appType);
  if (threadHistory.length === 0) return null;

  const latestEntry = threadHistory[threadHistory.length - 1]!;

  return {
    senderName: scenarioSenderName,
    previewText: latestEntry.messageText,
    threadHistory,
  };
}
