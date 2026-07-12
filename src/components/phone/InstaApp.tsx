"use client";

import { MessageThread } from "./shared/MessageThread";
import { ResponseComposer } from "./shared/ResponseComposer";
import type { PhoneAppSharedProps } from "./shared/phone-app-props";

/** app_type: insta — SNS DM (범용 렌더러) */
export function InstaApp(sharedProps: PhoneAppSharedProps) {
  const { currentNode, chatHistory, streamingMessage } = sharedProps;

  return (
    <div className="flex h-full flex-col bg-white pt-10">
      <header className="flex items-center gap-3 border-b border-black/10 px-4 py-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 text-lg text-white">
          👤
        </span>
        <div>
          <h2 className="text-sm font-semibold text-black">{currentNode.sender_name}</h2>
          <p className="text-[11px] text-black/40">팔로워 342 · 팔로잉 1,208</p>
        </div>
      </header>

      <MessageThread
        chatHistory={chatHistory}
        streamingMessage={streamingMessage}
        senderName={currentNode.sender_name}
        isAwaitingResponse={sharedProps.isAwaitingResponse}
        elapsedDaysLabel={currentNode.elapsed_days}
        bubbleTheme={{
          threadBackgroundClass: "bg-white",
          incomingBubbleClass: "bg-neutral-100 text-black",
          outgoingBubbleClass: "bg-gradient-to-tr from-purple-500 to-pink-500 text-white",
        }}
      />

      <div className="bg-white">
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
