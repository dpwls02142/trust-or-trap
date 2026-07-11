"use client";

import { MessageThread } from "./shared/MessageThread";
import { ResponseComposer } from "./shared/ResponseComposer";
import type { PhoneAppSharedProps } from "./shared/phone-app-props";

/**
 * app_type: browser — 가짜 사이트/역이미지 검색 화면 (범용 렌더러).
 * 수상한 주소창(비공식 도메인)을 항상 노출해 위험 신호 학습을 돕는다.
 */
export function BrowserApp(sharedProps: PhoneAppSharedProps) {
  const { currentNode, chatHistory, streamingMessage } = sharedProps;

  return (
    <div className="flex h-full flex-col bg-white pt-10">
      <div className="flex items-center gap-2 border-b border-black/10 bg-neutral-50 px-3 py-2">
        <span aria-hidden>🔓</span>
        <span className="min-w-0 flex-1 truncate rounded-full bg-neutral-200 px-3 py-1.5 text-xs text-black/70">
          http://secure-check.info-portal.xyz
        </span>
      </div>
      <div className="border-b border-black/10 bg-red-50 px-4 py-1.5 text-[11px] text-red-700">
        이 사이트는 보안 연결(HTTPS)이 아니며 공식 도메인(go.kr)이 아닙니다
      </div>

      <MessageThread
        chatHistory={chatHistory}
        streamingMessage={streamingMessage}
        senderName={currentNode.sender_name}
        elapsedDaysLabel={currentNode.elapsed_days}
        bubbleTheme={{
          threadBackgroundClass: "bg-white",
          incomingBubbleClass: "bg-neutral-100 text-black",
          outgoingBubbleClass: "bg-sky-500 text-white",
        }}
      />

      <div className="bg-neutral-50">
        <ResponseComposer
          activeOptions={sharedProps.activeOptions}
          allowFreeInput={currentNode.allow_free_input}
          voiceEnabled={currentNode.voice_enabled}
          isAwaitingResponse={sharedProps.isAwaitingResponse}
          onSelectOption={sharedProps.onSelectOption}
          onSubmitFreeInput={sharedProps.onSubmitFreeInput}
          composerTheme="light"
        />
      </div>
    </div>
  );
}
