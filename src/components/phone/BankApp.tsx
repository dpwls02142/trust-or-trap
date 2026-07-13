"use client";

import { useMemo } from "react";
import { AppBackButton } from "./shared/AppBackButton";
import { BankTransferPanel } from "./shared/BankTransferPanel";
import { findLatestSpeakerMessage } from "@/lib/phone/chat-history-view";
import type { PhoneAppSharedProps } from "./shared/phone-app-props";

/** app_type: bank — 은행/송금 앱 (범용 렌더러). 이체 요구 단계의 압박을 재현한다. */
export function BankApp(sharedProps: PhoneAppSharedProps) {
  const { currentNode, chatHistory, streamingMessage } = sharedProps;

  const transferMemoText = useMemo(() => {
    const nodeScammerLine = findLatestSpeakerMessage(
      chatHistory.filter((entryItem) => entryItem.nodeId === currentNode.node_id),
      "scammer",
    );
    return streamingMessage || nodeScammerLine;
  }, [chatHistory, currentNode.node_id, streamingMessage]);

  const isAwaitingOptionChoice =
    sharedProps.isAwaitingResponse || !!streamingMessage;

  return (
    <div className="flex h-full flex-col bg-neutral-100 pt-10">
      <header className="bg-blue-700 px-3 py-3 text-white">
        <div className="mb-2">
          <AppBackButton onBack={sharedProps.onExitToHome} tone="dark" />
        </div>
        <h2 className="text-sm font-bold">한빛은행</h2>
        <p className="mt-1 text-[11px] text-white/70">내 계좌 잔액</p>
        <p className="text-xl font-bold">3,481,200원</p>
      </header>

      <BankTransferPanel
        recipientName={currentNode.sender_name}
        transferMemoText={transferMemoText}
        isAwaitingResponse={sharedProps.isAwaitingResponse}
        availableOptions={sharedProps.availableOptions}
        isAwaitingOptionChoice={isAwaitingOptionChoice}
        onSelectTransferAction={sharedProps.onSelectOption}
      />
    </div>
  );
}
