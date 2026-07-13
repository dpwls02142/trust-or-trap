"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import type { ChatHistoryEntry } from "@/lib/scenario/types";
import { TypingIndicator } from "./TypingIndicator";

interface BrowserSearchResultPanelProps {
  nodeChatHistory: ChatHistoryEntry[];
  streamingMessage: string;
  senderName: string;
  isAwaitingResponse: boolean;
}

/**
 * browser 앱 전용 — 역이미지 검색 결과 페이지 연출.
 * 채팅 말풍선 대신 웹 페이지 본문으로 현재 노드 대사만 표시한다.
 */
export function BrowserSearchResultPanel({
  nodeChatHistory,
  streamingMessage,
  senderName,
  isAwaitingResponse,
}: BrowserSearchResultPanelProps) {
  const pageBodyText =
    streamingMessage ||
    [...nodeChatHistory]
      .reverse()
      .find((entryItem) => entryItem.speaker === "scammer")?.messageText ||
    "";

  const showPagePending = isAwaitingResponse && !streamingMessage;

  return (
    <div className="phone-scroll flex-1 overflow-y-auto bg-white px-4 py-5">
      <div className="rounded-2xl border border-black/10 bg-neutral-50 p-4">
        <p className="text-xs font-semibold text-black/50">역이미지 검색</p>
        <h3 className="mt-1 text-sm font-bold text-black">프로필 사진 일치 결과</h3>

        <div className="mt-4 flex gap-3">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 text-2xl">
            🖼️
          </div>
          <div className="min-w-0 flex-1 text-xs leading-relaxed text-black/70">
            <p className="font-semibold text-amber-700">유사 이미지 다수 발견</p>
            <p className="mt-1">· 커뮤니티 게시글에 동일 사진</p>
            <p>· 해외 스톡/모델 사진 DB</p>
            <p>· 다른 SNS 계정 프로필</p>
          </div>
        </div>
      </div>

      {(pageBodyText || showPagePending) && (
        <div className="mt-4 rounded-2xl border border-sky-100 bg-sky-50 p-4">
          <p className="text-[11px] font-semibold text-sky-800">검색 분석 요약</p>
          {showPagePending ? (
            <div className="mt-2 flex items-center gap-2 text-xs text-black/50">
              <TypingIndicator />
              결과를 불러오는 중...
            </div>
          ) : (
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-black">
              <span className="mb-1 block text-[11px] text-black/40">{senderName}</span>
              {pageBodyText}
              {streamingMessage && (
                <motion.span
                  animate={{ opacity: [1, 0.2, 1] }}
                  transition={{ repeat: Infinity, duration: 0.9 }}
                  aria-hidden
                >
                  ▍
                </motion.span>
              )}
            </p>
          )}
        </div>
      )}

      <p className="mt-6 text-center text-[11px] text-black/35">
        이 페이지는 공식 사이트가 아닙니다
      </p>
    </div>
  );
}
