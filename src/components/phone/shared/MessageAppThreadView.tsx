"use client";

import { MessageThread } from "./MessageThread";
import { AppBackButton } from "./AppBackButton";
import type { AppType, ChatHistoryEntry } from "@/lib/scenario/types";

interface MessageAppThreadViewProps {
  appType: AppType;
  senderName: string;
  threadHistory: ChatHistoryEntry[];
  onBackToList: () => void;
}

const bubbleThemeByApp: Record<
  Extract<AppType, "chat" | "sms" | "insta">,
  {
    threadBackgroundClass: string;
    incomingBubbleClass: string;
    outgoingBubbleClass: string;
  }
> = {
  chat: {
    threadBackgroundClass: "bg-[#bacee0]",
    incomingBubbleClass: "bg-white text-black",
    outgoingBubbleClass: "bg-yellow-300 text-black",
  },
  sms: {
    threadBackgroundClass: "bg-white",
    incomingBubbleClass: "bg-neutral-200 text-black",
    outgoingBubbleClass: "bg-blue-500 text-white",
  },
  insta: {
    threadBackgroundClass: "bg-white",
    incomingBubbleClass: "bg-neutral-100 text-black",
    outgoingBubbleClass: "bg-gradient-to-tr from-purple-500 to-pink-500 text-white",
  },
};

/**
 * 메시지 앱 셸 — 저장된 대화 스레드를 읽기 전용으로 표시한다.
 */
export function MessageAppThreadView({
  appType,
  senderName,
  threadHistory,
  onBackToList,
}: MessageAppThreadViewProps) {
  const bubbleTheme =
    appType === "chat" || appType === "sms" || appType === "insta"
      ? bubbleThemeByApp[appType]
      : bubbleThemeByApp.chat;

  return (
    <div className="flex h-full flex-col bg-white">
      <header className="flex items-center gap-2 border-b border-black/10 px-3 py-2.5">
        <AppBackButton onBack={onBackToList} />
        <h2 className="truncate text-sm font-semibold text-black">{senderName}</h2>
      </header>

      <MessageThread
        chatHistory={threadHistory}
        streamingMessage=""
        senderName={senderName}
        isAwaitingResponse={false}
        bubbleTheme={bubbleTheme}
      />

      <p className="border-t border-black/5 bg-neutral-50 px-4 py-2 text-center text-[11px] text-black/40">
        이전 대화 기록입니다
      </p>
    </div>
  );
}
