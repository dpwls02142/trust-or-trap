"use client";

import { useMemo } from "react";
import { AppBackButton } from "./shared/AppBackButton";
import { BrowserSearchResultPanel } from "./shared/BrowserSearchResultPanel";
import { ScenarioActionPanel } from "./shared/ScenarioActionPanel";
import { filterChatHistoryForAppView } from "@/lib/phone/chat-history-view";
import type { PhoneAppSharedProps } from "./shared/phone-app-props";

/**
 * app_type: browser — 가짜 사이트/역이미지 검색 화면 (범용 렌더러).
 * 수상한 주소창(비공식 도메인)을 항상 노출해 위험 신호 학습을 돕는다.
 */
export function BrowserApp(sharedProps: PhoneAppSharedProps) {
  const { currentNode, chatHistory, streamingMessage } = sharedProps;

  const nodeChatHistory = useMemo(
    () => filterChatHistoryForAppView(chatHistory, currentNode),
    [chatHistory, currentNode],
  );

  return (
    <div className="flex h-full flex-col bg-white pt-10">
      <div className="flex items-center gap-1 border-b border-black/10 bg-neutral-50 px-2 py-2">
        <AppBackButton onBack={sharedProps.onExitToHome} />
        <span aria-hidden>🔓</span>
        <span className="min-w-0 flex-1 truncate rounded-full bg-neutral-200 px-3 py-1.5 text-xs text-black/70">
          http://secure-check.info-portal.xyz
        </span>
      </div>
      <div className="border-b border-black/10 bg-red-50 px-4 py-1.5 text-[11px] text-red-700">
        이 사이트는 보안 연결(HTTPS)이 아니며 공식 도메인(go.kr)이 아닙니다
      </div>

      <BrowserSearchResultPanel
        nodeChatHistory={nodeChatHistory}
        streamingMessage={streamingMessage}
        senderName={currentNode.sender_name}
        isAwaitingResponse={sharedProps.isAwaitingResponse}
      />

      <ScenarioActionPanel
        composerResetKey={currentNode.node_id}
        panelTitle="검색 결과를 보고 다음 행동을 선택하세요"
        panelHint="의심이 들면 메시지 앱에서 대화를 확인한 뒤 결정해도 됩니다."
        availableOptions={sharedProps.availableOptions}
        allowFreeInput={currentNode.allow_free_input}
        freeInputPlaceholder="직접 판단을 입력..."
        isAwaitingResponse={sharedProps.isAwaitingResponse}
        onSelectOption={sharedProps.onSelectOption}
        onSubmitFreeInput={sharedProps.onSubmitFreeInput}
      />
    </div>
  );
}
