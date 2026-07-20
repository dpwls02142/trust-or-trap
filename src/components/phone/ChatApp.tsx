"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { MessageThread } from "./shared/MessageThread";
import { MessagingResponseArea } from "./shared/MessagingResponseArea";
import { SenderAvatar } from "./shared/SenderAvatar";
import { AppBackButton } from "./shared/AppBackButton";
import { ChatProfileDetail } from "./shared/ChatProfileDetail";
import { buildSenderProfileView } from "@/lib/scenario/sender-profile";
import { filterChatHistoryForAppView } from "@/lib/phone/chat-history-view";
import { resolveOpenGroupChatHeader } from "@/lib/phone/open-group-chat-view";
import { useStatusBarOverride } from "@/lib/phone/status-bar-override";
import { useMessageAttachmentLightbox } from "./shared/use-message-attachment-lightbox";
import type { PhoneAppSharedProps } from "./shared/phone-app-props";

/** app_type: chat — 카카오톡류 메신저 (범용 렌더러, 페르소나 7종 공유) */
export function ChatApp(sharedProps: PhoneAppSharedProps) {
  const { activeScenarioId, currentNode, chatHistory, streamingMessage } =
    sharedProps;
  const [isProfileDetailVisible, setIsProfileDetailVisible] = useState(false);
  const { setStatusBarOverride } = useStatusBarOverride();

  useEffect(() => {
    if (!isProfileDetailVisible) {
      return;
    }

    setStatusBarOverride("light-content");
    return () => setStatusBarOverride(null);
  }, [isProfileDetailVisible, setStatusBarOverride]);

  const senderProfileView = useMemo(
    () => buildSenderProfileView(activeScenarioId, currentNode.sender_name),
    [activeScenarioId, currentNode.sender_name],
  );

  const threadChatHistory = useMemo(
    () => filterChatHistoryForAppView(chatHistory, currentNode),
    [chatHistory, currentNode],
  );

  const openGroupHeaderView = useMemo(
    () => resolveOpenGroupChatHeader(currentNode.sender_name, currentNode.chat_room_kind),
    [currentNode.sender_name, currentNode.chat_room_kind],
  );

  const { openAttachmentLightbox, attachmentLightboxOverlay } =
    useMessageAttachmentLightbox();

  return (
    <div className="relative flex h-full flex-col bg-[#bacee0] pt-10">
      <header className="flex items-center gap-2 border-b border-black/10 bg-[#bacee0] px-3 py-2.5">
        <AppBackButton onBack={sharedProps.onExitToHome} />
        <button
          type="button"
          onClick={() => setIsProfileDetailVisible(true)}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-lg text-left transition"
          aria-label={`${currentNode.sender_name} 프로필 상세보기`}
        >
          <SenderAvatar
            scenarioId={activeScenarioId}
            senderName={currentNode.sender_name}
          />
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-1.5">
              <h2 className="truncate text-sm font-semibold text-black">
                {openGroupHeaderView?.roomTitle ?? currentNode.sender_name}
              </h2>
              {openGroupHeaderView && (
                <span className="shrink-0 rounded bg-black/10 px-1.5 py-0.5 text-[10px] font-semibold text-black/55">
                  {openGroupHeaderView.memberCountLabel}
                </span>
              )}
            </div>
            <p className="truncate text-[11px] text-black/50">
              {openGroupHeaderView?.subtitleText ?? senderProfileView.statusMessage}
            </p>
          </div>
        </button>
      </header>

      <MessageThread
        chatHistory={threadChatHistory}
        streamingMessage={streamingMessage}
        senderName={currentNode.sender_name}
        isAwaitingResponse={sharedProps.isAwaitingResponse}
        currentElapsedDays={currentNode.elapsed_days}
        chatRoomKind={currentNode.chat_room_kind}
        onOpenAttachmentLightbox={openAttachmentLightbox}
        shouldSplitLinkBubbles
        bubbleTheme={{
          threadBackgroundClass: "bg-[#bacee0]",
          incomingBubbleClass: "bg-white text-black",
          outgoingBubbleClass: "bg-yellow-300 text-black",
        }}
      />

      <MessagingResponseArea
        nodeId={currentNode.node_id}
        chatHistory={chatHistory}
        availableOptions={sharedProps.availableOptions}
        allowFreeInput={currentNode.allow_free_input}
        voiceEnabled={false}
        isAwaitingResponse={sharedProps.isAwaitingResponse}
        streamingMessage={streamingMessage}
        onSelectOption={sharedProps.onSelectOption}
        onSubmitFreeInput={sharedProps.onSubmitFreeInput}
        onPhotoSendSubmit={sharedProps.onPhotoSendSubmit}
        inputTutorialMode={sharedProps.inputTutorialMode}
        isInputTutorialVisible={sharedProps.isInputTutorialVisible}
        onDismissInputTutorial={sharedProps.onDismissInputTutorial}
        composerTheme="light"
        composerBackgroundClass="bg-white"
      />

      <AnimatePresence>
        {isProfileDetailVisible && (
          <ChatProfileDetail
            profileView={senderProfileView}
            onCloseProfile={() => setIsProfileDetailVisible(false)}
          />
        )}
      </AnimatePresence>

      {attachmentLightboxOverlay}
    </div>
  );
}
