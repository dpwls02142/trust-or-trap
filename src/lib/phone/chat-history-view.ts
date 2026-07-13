import type { AppType, ChatHistoryEntry } from "@/lib/scenario/types";

const isolatedAppTypeList: AppType[] = ["call", "browser", "bank"];

interface NodeContextSlice {
  node_id: string;
  app_type: AppType;
}

/**
 * 앱 UI에 표시할 대화만 걸러낸다.
 * - call/browser/bank: 현재 노드 메시지만 (이전 채팅앱 대화 노출 방지)
 * - chat/sms/insta: 동일 app_type 스레드만
 */
export function filterChatHistoryForAppView(
  chatHistory: ChatHistoryEntry[],
  currentNode: NodeContextSlice,
): ChatHistoryEntry[] {
  if (isolatedAppTypeList.includes(currentNode.app_type)) {
    return chatHistory.filter(
      (entryItem) => entryItem.nodeId === currentNode.node_id,
    );
  }

  const hasTypedEntries = chatHistory.some((entryItem) => entryItem.appType);

  return chatHistory.filter((entryItem) => {
    if (entryItem.appType) {
      return entryItem.appType === currentNode.app_type;
    }
    // appType 도입 이전 저장본: 스레드 앱에서는 기존처럼 전체 표시
    if (!hasTypedEntries) return true;
    return false;
  });
}

export function findLatestSpeakerMessage(
  chatHistory: ChatHistoryEntry[],
  speaker: ChatHistoryEntry["speaker"],
): string {
  return (
    [...chatHistory]
      .reverse()
      .find((entryItem) => entryItem.speaker === speaker)?.messageText ?? ""
  );
}

/** 메시지 앱 대화 목록 — 동일 app_type 스레드 전체 */
export function filterChatHistoryByAppType(
  chatHistory: ChatHistoryEntry[],
  appType: AppType,
): ChatHistoryEntry[] {
  const hasTypedEntries = chatHistory.some((entryItem) => entryItem.appType);

  return chatHistory.filter((entryItem) => {
    if (entryItem.speaker === "system") return false;
    if (entryItem.appType) return entryItem.appType === appType;
    if (!hasTypedEntries) return true;
    return false;
  });
}
