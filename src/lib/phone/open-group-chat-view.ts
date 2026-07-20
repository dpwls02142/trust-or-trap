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

/** 오픈채팅 말풍선 오른쪽 읽음 수 — 카카오톡 단톡 연출 */
export const OPEN_GROUP_CHAT_READ_COUNT = 99;

export function resolveGroupChatReadCount(): number {
  return OPEN_GROUP_CHAT_READ_COUNT;
}
