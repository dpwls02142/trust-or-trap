"use client";

import { MessageThread } from "./shared/MessageThread";
import { ResponseComposer } from "./shared/ResponseComposer";
import type { PhoneAppSharedProps } from "./shared/phone-app-props";

/** app_type: sms — 문자 메시지 (범용 렌더러) */
export function SMSApp(sharedProps: PhoneAppSharedProps) {
  const { currentNode, chatHistory, streamingMessage } = sharedProps;

  return (
    <div className="flex h-full flex-col bg-white pt-10">
      <header className="border-b border-black/10 bg-neutral-50 px-4 py-2.5 text-center">
        <h2 className="text-sm font-semibold text-black">{currentNode.sender_name}</h2>
        <p className="text-[11px] text-black/40">휴대전화</p>
      </header>

      <MessageThread
        chatHistory={chatHistory}
        streamingMessage={streamingMessage}
        senderName={currentNode.sender_name}
        elapsedDaysLabel={currentNode.elapsed_days}
        bubbleTheme={{
          threadBackgroundClass: "bg-white",
          incomingBubbleClass: "bg-neutral-200 text-black",
          outgoingBubbleClass: "bg-blue-500 text-white",
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
