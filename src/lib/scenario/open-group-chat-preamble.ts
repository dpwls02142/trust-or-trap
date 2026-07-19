import type { AppType, ChatHistoryEntry, ScenarioId } from "@/lib/scenario/types";

const openGroupPreambleMarker = "open-group-preamble";

/** 오픈채팅방 입장 직후 단톡 분위기를 보여주는 고정 연출 메시지 */
export function buildOpenGroupChatPreambleEntries(
  scenarioId: ScenarioId,
  targetNodeId: string,
  appType: AppType,
): ChatHistoryEntry[] {
  if (scenarioId !== "middle-invest-scam" || targetNodeId !== "trust-profit-proof") {
    return [];
  }

  return [
    {
      speaker: "system",
      messageText: "VIP투자연구소 💰 오픈채팅방에 들어왔습니다.",
      nodeId: openGroupPreambleMarker,
      appType,
    },
    {
      speaker: "system",
      messageText: "VIP투자연구소: 어서오세요~ 무료 VIP 리딩방입니다",
      nodeId: openGroupPreambleMarker,
      appType,
    },
    {
      speaker: "system",
      messageText: "회원147: 어제 +18% 인증합니다 ㄷㄷ",
      nodeId: openGroupPreambleMarker,
      appType,
    },
    {
      speaker: "system",
      messageText: "회원032: 저도 따라 들어왔어요",
      nodeId: openGroupPreambleMarker,
      appType,
    },
  ];
}

export function hasOpenGroupChatPreamble(chatHistory: ChatHistoryEntry[]): boolean {
  return chatHistory.some(
    (entryItem) => entryItem.nodeId === openGroupPreambleMarker,
  );
}
