"use client";

import { MessageThread } from "./shared/MessageThread";
import { ResponseComposer } from "./shared/ResponseComposer";
import type { PhoneAppSharedProps } from "./shared/phone-app-props";

/** app_type: bank — 은행/송금 앱 (범용 렌더러). 이체 요구 단계의 압박을 재현한다. */
export function BankApp(sharedProps: PhoneAppSharedProps) {
  const { currentNode, chatHistory, streamingMessage } = sharedProps;

  return (
    <div className="flex h-full flex-col bg-neutral-100 pt-10">
      <header className="bg-blue-700 px-4 py-3 text-white">
        <h2 className="text-sm font-bold">한빛은행</h2>
        <p className="mt-1 text-[11px] text-white/70">내 계좌 잔액</p>
        <p className="text-xl font-bold">3,481,200원</p>
      </header>

      <div className="border-b border-black/10 bg-amber-50 px-4 py-2 text-[11px] text-amber-800">
        ⚠️ 전화로 이체를 요구받고 있다면 보이스피싱을 의심하세요
      </div>

      <MessageThread
        chatHistory={chatHistory}
        streamingMessage={streamingMessage}
        senderName={currentNode.sender_name}
        isAwaitingResponse={sharedProps.isAwaitingResponse}
        elapsedDaysLabel={currentNode.elapsed_days}
        bubbleTheme={{
          threadBackgroundClass: "bg-neutral-100",
          incomingBubbleClass: "bg-white text-black shadow-sm",
          outgoingBubbleClass: "bg-blue-600 text-white",
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
