"use client";

import { MessageThread } from "./shared/MessageThread";
import { ResponseComposer } from "./shared/ResponseComposer";
import { SenderAvatar } from "./shared/SenderAvatar";
import { AppBackButton } from "./shared/AppBackButton";
import type { PhoneAppSharedProps } from "./shared/phone-app-props";

/** app_type: chat — 카카오톡류 메신저 (범용 렌더러, 페르소나 7종 공유) */
export function ChatApp(sharedProps: PhoneAppSharedProps) {
  const { activeScenarioId, currentNode, chatHistory, streamingMessage } = sharedProps;

  return (
    <div className="flex h-full flex-col bg-[#bacee0] pt-10">
      <header className="flex items-center gap-2 border-b border-black/10 bg-[#bacee0] px-3 py-2.5">
        <AppBackButton onBack={sharedProps.onExitToHome} />
        <SenderAvatar
          scenarioId={activeScenarioId}
          senderName={currentNode.sender_name}
        />
        <div>
          <h2 className="text-sm font-semibold text-black">{currentNode.sender_name}</h2>
          <p className="text-[11px] text-black/50">보통 몇 분 내 응답</p>
        </div>
      </header>

      <MessageThread
        chatHistory={chatHistory}
        streamingMessage={streamingMessage}
        senderName={currentNode.sender_name}
        isAwaitingResponse={sharedProps.isAwaitingResponse}
        elapsedDaysLabel={currentNode.elapsed_days}
        bubbleTheme={{
          threadBackgroundClass: "bg-[#bacee0]",
          incomingBubbleClass: "bg-white text-black",
          outgoingBubbleClass: "bg-yellow-300 text-black",
        }}
      />

      <div className="bg-white">
        <ResponseComposer
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
