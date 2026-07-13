"use client";

import { MessageThread } from "./shared/MessageThread";
import { ResponseComposer } from "./shared/ResponseComposer";
import { SenderAvatar } from "./shared/SenderAvatar";
import { AppBackButton } from "./shared/AppBackButton";
import type { PhoneAppSharedProps } from "./shared/phone-app-props";

/** app_type: sms — 문자 메시지 (범용 렌더러) */
export function SMSApp(sharedProps: PhoneAppSharedProps) {
  const { activeScenarioId, currentNode, chatHistory, streamingMessage } = sharedProps;

  return (
    <div className="flex h-full flex-col bg-white pt-10">
      <header className="relative flex flex-col items-center gap-1.5 border-b border-black/10 bg-neutral-50 px-4 py-2.5">
        <div className="absolute left-2 top-1/2 -translate-y-1/2">
          <AppBackButton onBack={sharedProps.onExitToHome} />
        </div>
        <SenderAvatar
          scenarioId={activeScenarioId}
          senderName={currentNode.sender_name}
        />
        <h2 className="text-sm font-semibold text-black">{currentNode.sender_name}</h2>
        <p className="text-[11px] text-black/40">휴대전화</p>
      </header>

      <MessageThread
        chatHistory={chatHistory}
        streamingMessage={streamingMessage}
        senderName={currentNode.sender_name}
        isAwaitingResponse={sharedProps.isAwaitingResponse}
        elapsedDaysLabel={currentNode.elapsed_days}
        bubbleTheme={{
          threadBackgroundClass: "bg-white",
          incomingBubbleClass: "bg-neutral-200 text-black",
          outgoingBubbleClass: "bg-blue-500 text-white",
        }}
      />

      <div className="bg-neutral-50">
        <ResponseComposer
          composerResetKey={currentNode.node_id}
          availableOptions={sharedProps.availableOptions}
          allowFreeInput={currentNode.allow_free_input}
          voiceEnabled={false}
          isAwaitingResponse={sharedProps.isAwaitingResponse}
          onSelectOption={sharedProps.onSelectOption}
          onSubmitFreeInput={sharedProps.onSubmitFreeInput}
          inputTutorialMode={sharedProps.inputTutorialMode}
          isInputTutorialVisible={sharedProps.isInputTutorialVisible}
          onDismissInputTutorial={sharedProps.onDismissInputTutorial}
          composerTheme="light"
        />
      </div>
    </div>
  );
}
