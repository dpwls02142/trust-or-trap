"use client";

import { useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { TypingIndicator } from "./TypingIndicator";
import type { ChatHistoryEntry } from "@/lib/scenario/types";

interface MessageThreadProps {
  chatHistory: ChatHistoryEntry[];
  streamingMessage: string;
  senderName: string;
  /** 대사 생성/판정 대기 중 여부 — 첫 토큰 도착 전 "입력 중..." 말풍선 표시 */
  isAwaitingResponse?: boolean;
  /** 말풍선 색상 테마 (앱별 차별화) */
  bubbleTheme: {
    incomingBubbleClass: string;
    outgoingBubbleClass: string;
    threadBackgroundClass: string;
  };
  /** 현재 노드 경과일 — 스트리밍/입력 중 말풍선 앞 구분선용 */
  currentElapsedDays?: number | null;
}

type ThreadRenderItem =
  | { kind: "day-separator"; elapsedDays: number; itemKey: string }
  | { kind: "message"; entry: ChatHistoryEntry; entryIndex: number };

function ElapsedDaysSeparator({ elapsedDays }: { elapsedDays: number }) {
  return (
    <p className="py-1 text-center text-[11px] text-black/40">
      — 대화 {elapsedDays}일째 —
    </p>
  );
}

function buildThreadRenderItems(chatHistory: ChatHistoryEntry[]): {
  renderItems: ThreadRenderItem[];
  lastShownElapsedDays: number | null;
} {
  const renderItems: ThreadRenderItem[] = [];
  let lastShownElapsedDays: number | null = null;

  chatHistory.forEach((entryItem, entryIndex) => {
    const entryElapsedDays = entryItem.elapsedDays;
    if (
      typeof entryElapsedDays === "number" &&
      entryElapsedDays > 0 &&
      entryElapsedDays !== lastShownElapsedDays
    ) {
      lastShownElapsedDays = entryElapsedDays;
      renderItems.push({
        kind: "day-separator",
        elapsedDays: entryElapsedDays,
        itemKey: `day-${entryElapsedDays}-${entryIndex}`,
      });
    }
    renderItems.push({ kind: "message", entry: entryItem, entryIndex });
  });

  return { renderItems, lastShownElapsedDays };
}

/**
 * 메시지 스레드 — chat/sms/insta/bank가 공유하는 대화 렌더러.
 * 스트리밍 텍스트는 도착 즉시 타이핑 효과처럼 늘어나고,
 * 텍스트가 아직 없을 때는 "입력 중..." 인디케이터로 생성 진행을 알린다.
 */
export function MessageThread({
  chatHistory,
  streamingMessage,
  senderName,
  isAwaitingResponse = false,
  bubbleTheme,
  currentElapsedDays,
}: MessageThreadProps) {
  const scrollAnchorRef = useRef<HTMLDivElement>(null);

  const { renderItems, lastShownElapsedDays } = useMemo(
    () => buildThreadRenderItems(chatHistory),
    [chatHistory],
  );

  const showTypingIndicator = isAwaitingResponse && !streamingMessage;

  const shouldShowCurrentDaySeparator =
    typeof currentElapsedDays === "number" &&
    currentElapsedDays > 0 &&
    currentElapsedDays !== lastShownElapsedDays &&
    (showTypingIndicator || !!streamingMessage);

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [chatHistory.length, streamingMessage, showTypingIndicator]);

  return (
    <div
      className={`phone-scroll flex-1 space-y-2.5 overflow-y-auto px-3 py-3 ${bubbleTheme.threadBackgroundClass}`}
    >
      {renderItems.map((renderItem) => {
        if (renderItem.kind === "day-separator") {
          return (
            <ElapsedDaysSeparator
              key={renderItem.itemKey}
              elapsedDays={renderItem.elapsedDays}
            />
          );
        }

        const entryItem = renderItem.entry;
        const entryIndex = renderItem.entryIndex;

        if (entryItem.speaker === "system") {
          return (
            <p key={entryIndex} className="py-1 text-center text-[11px] text-black/40">
              {entryItem.messageText}
            </p>
          );
        }
        const isIncoming = entryItem.speaker === "scammer";
        return (
          <motion.div
            key={entryIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${isIncoming ? "justify-start" : "justify-end"}`}
          >
            <div className="max-w-[78%]">
              {isIncoming && (
                <span className="mb-0.5 block pl-1 text-[11px] text-black/50">
                  {senderName}
                </span>
              )}
              <p
                className={`whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                  isIncoming
                    ? bubbleTheme.incomingBubbleClass
                    : bubbleTheme.outgoingBubbleClass
                }`}
              >
                {entryItem.messageText}
              </p>
            </div>
          </motion.div>
        );
      })}

      {shouldShowCurrentDaySeparator && currentElapsedDays != null && (
        <ElapsedDaysSeparator elapsedDays={currentElapsedDays} />
      )}

      {streamingMessage && (
        <div className="flex justify-start">
          <div className="max-w-[78%]">
            <span className="mb-0.5 block pl-1 text-[11px] text-black/50">{senderName}</span>
            <p
              className={`whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${bubbleTheme.incomingBubbleClass}`}
            >
              {streamingMessage}
              <motion.span
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ repeat: Infinity, duration: 0.9 }}
                aria-hidden
              >
                ▍
              </motion.span>
            </p>
          </div>
        </div>
      )}

      {showTypingIndicator && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-start"
        >
          <div className="max-w-[78%]">
            <span className="mb-0.5 block pl-1 text-[11px] text-black/50">{senderName}</span>
            <div
              className={`inline-flex rounded-2xl px-3.5 py-2 ${bubbleTheme.incomingBubbleClass}`}
            >
              <TypingIndicator />
            </div>
          </div>
        </motion.div>
      )}

      <div ref={scrollAnchorRef} />
    </div>
  );
}
