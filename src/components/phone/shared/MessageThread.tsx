"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import type { ChatHistoryEntry } from "@/lib/scenario/types";

interface MessageThreadProps {
  chatHistory: ChatHistoryEntry[];
  streamingMessage: string;
  senderName: string;
  /** 말풍선 색상 테마 (앱별 차별화) */
  bubbleTheme: {
    incomingBubbleClass: string;
    outgoingBubbleClass: string;
    threadBackgroundClass: string;
  };
  elapsedDaysLabel?: number | null;
}

/**
 * 메시지 스레드 — chat/sms/insta/bank가 공유하는 대화 렌더러.
 * 스트리밍 텍스트는 도착 즉시 타이핑 효과처럼 늘어난다.
 */
export function MessageThread({
  chatHistory,
  streamingMessage,
  senderName,
  bubbleTheme,
  elapsedDaysLabel,
}: MessageThreadProps) {
  const scrollAnchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [chatHistory.length, streamingMessage]);

  return (
    <div
      className={`phone-scroll flex-1 space-y-2.5 overflow-y-auto px-3 py-3 ${bubbleTheme.threadBackgroundClass}`}
    >
      {typeof elapsedDaysLabel === "number" && elapsedDaysLabel > 0 && (
        <p className="py-1 text-center text-[11px] text-black/40">
          — 대화 {elapsedDaysLabel}일째 —
        </p>
      )}

      {chatHistory.map((entryItem, entryIndex) => {
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

      <div ref={scrollAnchorRef} />
    </div>
  );
}
