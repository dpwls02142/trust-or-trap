import type { ChatRoomKind } from "@/lib/scenario/types";

export interface OpenGroupChatHeaderView {
  roomTitle: string;
  memberCountLabel: string;
  subtitleText: string;
}

/** 오픈채팅(단톡) 헤더 — 카카오톡 오픈채팅 연출 */
export function resolveOpenGroupChatHeader(
  senderName: string,
  chatRoomKind: ChatRoomKind | null | undefined,
): OpenGroupChatHeaderView | null {
  if (chatRoomKind !== "open_group") {
    return null;
  }

  return {
    roomTitle: senderName,
    memberCountLabel: "248",
    subtitleText: "오픈채팅 · 248명",
  };
}

/**
 * 단톡방 플레이어 말풍선 읽음 수 — 카카오톡처럼 99·87 등으로 표시.
 * entryIndex 기반 결정적 값(O(1)).
 */
export function resolveGroupChatReadCount(entryIndex: number): number {
  const readCountPool = [99, 87, 64, 41, 28, 15, 9, 4, 2, 1];
  return readCountPool[entryIndex % readCountPool.length] ?? 1;
}
