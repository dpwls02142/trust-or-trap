import { scenarioPrologueNodeId } from "@/lib/scenario/scenario-context-setup";
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
function filterThreadHistoryForContact(
  chatHistory: ChatHistoryEntry[],
  appType: AppType,
  contactName: string,
  includeScenarioMessages: boolean,
): ChatHistoryEntry[] {
  return filterChatHistoryByAppType(chatHistory, appType).filter((entryItem) => {
    if (entryItem.nodeId === scenarioPrologueNodeId) {
      return entryItem.contactName === contactName;
    }
    return includeScenarioMessages && !entryItem.contactName;
  });
}

export function buildScenarioMessageThread(
  chatHistory: ChatHistoryEntry[],
  appType: AppType,
  scenarioSenderName: string,
): MessageThreadSummary | null {
  const threadHistory = filterThreadHistoryForContact(
    chatHistory,
    appType,
    scenarioSenderName,
    true,
  );
  if (threadHistory.length === 0) return null;

  const latestEntry = threadHistory[threadHistory.length - 1]!;

  return {
    senderName: scenarioSenderName,
    previewText: latestEntry.messageText,
    threadHistory,
  };
}

/** 홈 탐색용 — 프롤로그 연락처 스레드 (시나리오 entry 발신자와 다를 수 있음) */
export function buildPrologueMessageThread(
  chatHistory: ChatHistoryEntry[],
  appType: AppType,
  contactName: string,
): MessageThreadSummary | null {
  const threadHistory = filterThreadHistoryForContact(
    chatHistory,
    appType,
    contactName,
    false,
  );
  if (threadHistory.length === 0) return null;

  const latestEntry = threadHistory[threadHistory.length - 1]!;

  return {
    senderName: contactName,
    previewText: latestEntry.messageText,
    threadHistory,
  };
}
