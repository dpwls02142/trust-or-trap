"use client";

import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { MessageThread } from "./shared/MessageThread";
import { MessagingResponseArea } from "./shared/MessagingResponseArea";
import { SenderAvatar } from "./shared/SenderAvatar";
import { AppBackButton } from "./shared/AppBackButton";
import { InstaProfileFeed } from "./shared/InstaProfileFeed";
import { buildSenderProfileView } from "@/lib/scenario/sender-profile";
import { filterChatHistoryForAppView } from "@/lib/phone/chat-history-view";
import { useMessageAttachmentLightbox } from "./shared/use-message-attachment-lightbox";
import type { PhoneAppSharedProps } from "./shared/phone-app-props";

/** app_type: insta — SNS DM (범용 렌더러) */
export function InstaApp(sharedProps: PhoneAppSharedProps) {
  const { activeScenarioId, currentNode, chatHistory, streamingMessage } = sharedProps;
  const [isProfileFeedVisible, setIsProfileFeedVisible] = useState(false);

  const senderProfileView = useMemo(
    () => buildSenderProfileView(activeScenarioId, currentNode.sender_name),
    [activeScenarioId, currentNode.sender_name],
  );

  const threadChatHistory = useMemo(
    () => filterChatHistoryForAppView(chatHistory, currentNode),
    [chatHistory, currentNode],
  );

  const { openAttachmentLightbox, attachmentLightboxOverlay } =
    useMessageAttachmentLightbox();

  return (
    <div className="relative flex h-full flex-col bg-white pt-10">
      <header className="flex items-center gap-2 border-b border-black/10 px-3 py-2.5">
        <AppBackButton onBack={sharedProps.onExitToHome} />
        <button
          type="button"
          onClick={() => setIsProfileFeedVisible(true)}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-lg text-left transition hover:bg-black/5"
          aria-label={`${currentNode.sender_name} 프로필 보기`}
        >
          <SenderAvatar
            scenarioId={activeScenarioId}
            senderName={currentNode.sender_name}
          />
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-black">{currentNode.sender_name}</h2>
            <p className="text-[11px] text-black/40">
              팔로워 {senderProfileView.followerCount.toLocaleString()} · 팔로잉{" "}
              {senderProfileView.followingCount.toLocaleString()}
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
        onOpenAttachmentLightbox={openAttachmentLightbox}
        bubbleTheme={{
          threadBackgroundClass: "bg-white",
          incomingBubbleClass: "bg-neutral-100 text-black",
          outgoingBubbleClass: "bg-gradient-to-tr from-purple-500 to-pink-500 text-white",
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
        {isProfileFeedVisible && (
          <InstaProfileFeed
            profileView={senderProfileView}
            onCloseProfile={() => setIsProfileFeedVisible(false)}
          />
        )}
      </AnimatePresence>

      {attachmentLightboxOverlay}
    </div>
  );
}
