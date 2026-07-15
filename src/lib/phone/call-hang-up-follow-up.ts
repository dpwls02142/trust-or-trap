import type { AppType, ChatHistoryEntry } from "@/lib/scenario/types";
import type { PublicNodeView } from "@/lib/scenario/public-node";

const messageAppTypeList = ["chat", "sms", "insta"] as const;
type MessageAppType = (typeof messageAppTypeList)[number];

export interface PriorMessageChannel {
  appType: MessageAppType;
  nodeId: string;
  senderName: string;
}

export function isMessageAppType(appType: AppType): appType is MessageAppType {
  return messageAppTypeList.includes(appType as MessageAppType);
}

/** chatHistory에서 가장 최근 메시지형(scam) 연락 채널을 찾는다 */
export function resolvePriorMessageChannelFromHistory(
  chatHistory: ChatHistoryEntry[],
): Omit<PriorMessageChannel, "senderName"> | null {
  for (let entryIndex = chatHistory.length - 1; entryIndex >= 0; entryIndex--) {
    const entryItem = chatHistory[entryIndex]!;
    if (
      entryItem.speaker === "scammer" &&
      entryItem.appType &&
      isMessageAppType(entryItem.appType)
    ) {
      return { appType: entryItem.appType, nodeId: entryItem.nodeId };
    }
  }
  return null;
}

/** 통화 종료 직후 상대(스캐머)가 보내는 재연결 유도 대사 — 메시지 앱으로 전달 */
export function buildHangUpFollowUpMessage(currentNode: PublicNodeView): string {
  if (currentNode.outbound_dial_number) {
    return `통화가 끊겼네요. ${currentNode.outbound_dial_number}로 다시 연결해 주세요.`;
  }
  return "여보세요? 방금 통화가 끊겼는데, 다시 받아 주실 수 있어요?";
}

export function shouldPromptOutboundRedial(currentNode: PublicNodeView): boolean {
  return !!currentNode.outbound_dial_number;
}

/** SMS→call 등 이전 메시지 채널 — ref 우선, 없으면 chatHistory에서 추론 */
export function resolvePriorMessageChannel(
  lastMessageContact: PriorMessageChannel | null,
  chatHistory: ChatHistoryEntry[],
  fallbackSenderName: string,
): PriorMessageChannel | null {
  if (lastMessageContact) return lastMessageContact;

  const historyChannel = resolvePriorMessageChannelFromHistory(chatHistory);
  if (!historyChannel) return null;

  return { ...historyChannel, senderName: fallbackSenderName };
}
