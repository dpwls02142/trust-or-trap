"use client";

import { useEffect, useRef } from "react";
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
  elapsedDaysLabel?: number | null;
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
  elapsedDaysLabel,
}: MessageThreadProps) {
  const scrollAnchorRef = useRef<HTMLDivElement>(null);

  // 첫 토큰 도착 전(thinking 구간) — 진행 중임을 알리는 "입력 중" 말풍선
  const showTypingIndicator = isAwaitingResponse && !streamingMessage;

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [chatHistory.length, streamingMessage, showTypingIndicator]);

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
