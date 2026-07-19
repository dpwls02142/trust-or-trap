"use client";

import { useEffect, useMemo, useState } from "react";
import { AppBackButton } from "./shared/AppBackButton";
import { BankCallSubtitleBar } from "./shared/BankCallSubtitleBar";
import { BankConfirmDialog } from "./shared/BankConfirmDialog";
import { BankTransferPanel } from "./shared/BankTransferPanel";
import { findLatestSpeakerMessage } from "@/lib/phone/chat-history-view";
import {
  addTransferAmountUnit,
  defaultBankAccountBalanceLabel,
  defaultBankAccountNumberLabel,
  defaultBankBrandName,
  extractTransferAmountFromChatHistory,
  formatTransferAmountInputValue,
  parseTransferAmountWon,
  resolveBankOptionLabel,
  resolveTransferSubmitOptionLabel,
} from "@/lib/phone/bank-app-view";
import { useCallSessionActive } from "@/lib/phone/use-call-session-active";
import { useStatusBarOverride } from "@/lib/phone/status-bar-override";
import type { PhoneAppSharedProps } from "./shared/phone-app-props";

type BankConfirmMode = "refuse_transfer" | "attempt_transfer" | null;

/** app_type: bank — 은행/송금 앱 (범용 렌더러). 이체 요구 단계의 압박을 재현한다. */
export function BankApp(sharedProps: PhoneAppSharedProps) {
  const { currentNode, chatHistory, streamingMessage } = sharedProps;
  const isCallSessionActive = useCallSessionActive();
  const { setStatusBarOverride } = useStatusBarOverride();
  const [confirmMode, setConfirmMode] = useState<BankConfirmMode>(null);

  const initialTransferAmountHint = useMemo(
    () => extractTransferAmountFromChatHistory(chatHistory),
    [chatHistory],
  );
  const requestedWonHint = useMemo(
    () => parseTransferAmountWon(formatTransferAmountInputValue(initialTransferAmountHint)),
    [initialTransferAmountHint],
  );

  const [transferAmountText, setTransferAmountText] = useState(() =>
    formatTransferAmountInputValue(initialTransferAmountHint),
  );
  const [transferMemoText, setTransferMemoText] = useState("");

  useEffect(() => {
    setStatusBarOverride("light-content");
    return () => setStatusBarOverride(null);
  }, [setStatusBarOverride]);

  const bankPressureLineText = useMemo(() => {
    const nodeBankLine = findLatestSpeakerMessage(
      chatHistory.filter(
        (entryItem) => entryItem.nodeId === currentNode.node_id,
      ),
      "scammer",
    );
    return streamingMessage || nodeBankLine;
  }, [chatHistory, currentNode.node_id, streamingMessage]);

  const decisionOptionList = useMemo(() => {
    if (sharedProps.availableOptions.length > 0) {
      return sharedProps.availableOptions;
    }
    return currentNode.options;
  }, [sharedProps.availableOptions, currentNode.options]);

  const isBankTransferDecisionNode =
    !currentNode.is_ending && decisionOptionList.length > 0;

  const isDecisionLocked =
    sharedProps.isAwaitingResponse ||
    !!streamingMessage ||
    !isBankTransferDecisionNode;

  const safeExitOptionLabel = useMemo(
    () => resolveBankOptionLabel(decisionOptionList, "safe"),
    [decisionOptionList],
  );

  const showCallSubtitle =
    !!bankPressureLineText && (isCallSessionActive || !!streamingMessage);

  const canAttemptTransfer =
    parseTransferAmountWon(transferAmountText) > 0 && !isDecisionLocked;

  const handleBackPress = () => {
    if (!isBankTransferDecisionNode || isDecisionLocked) {
      sharedProps.onExitToHome();
      return;
    }
    setConfirmMode("refuse_transfer");
  };

  const handleAttemptTransfer = () => {
    if (!canAttemptTransfer) return;
    setConfirmMode("attempt_transfer");
  };

  const handleConfirmRefuseTransfer = () => {
    setConfirmMode(null);
    if (!safeExitOptionLabel) {
      sharedProps.onExitToHome();
      return;
    }
    void sharedProps.onSelectOption(safeExitOptionLabel);
  };

  const handleConfirmAttemptTransfer = () => {
    setConfirmMode(null);
    const transferSubmitLabel = resolveTransferSubmitOptionLabel(
      decisionOptionList,
      parseTransferAmountWon(transferAmountText),
      requestedWonHint,
    );
    if (!transferSubmitLabel) return;
    void sharedProps.onSelectOption(transferSubmitLabel);
  };

  return (
    <div className="relative flex h-full flex-col bg-neutral-100">
      <div className="shrink-0 bg-gradient-to-br from-blue-800 via-blue-700 to-indigo-800 pt-10 text-white">
        <div className="px-4 pb-14 pt-2">
          <div className="flex items-center gap-1">
            <AppBackButton onBack={handleBackPress} tone="dark" />
            <h2 className="text-base font-semibold tracking-tight">송금</h2>
          </div>
          <p className="mt-3 text-[11px] font-medium text-white/60">
            {defaultBankBrandName}
          </p>
        </div>
      </div>

      <div className="relative z-10 -mt-10 shrink-0 px-4">
        <div className="rounded-2xl bg-white p-4 shadow-md shadow-blue-900/10 ring-1 ring-black/5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-black/45">출금계좌</p>
              <p className="mt-0.5 truncate text-sm font-semibold text-black">
                입출금통장
              </p>
              <p className="mt-0.5 font-mono text-[11px] text-black/45">
                {defaultBankAccountNumberLabel}
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700">
              주계좌
            </span>
          </div>
          <div className="mt-4 border-t border-black/5 pt-3">
            <p className="text-[11px] text-black/45">출금 가능 금액</p>
            <p className="mt-0.5 text-xl font-bold tracking-tight text-black">
              {defaultBankAccountBalanceLabel}
            </p>
          </div>
        </div>
      </div>

      <BankTransferPanel
        key={currentNode.node_id}
        recipientName={currentNode.sender_name}
        initialTransferAmountHint={initialTransferAmountHint}
        isDecisionLocked={isDecisionLocked}
        transferAmountText={transferAmountText}
        transferMemoText={transferMemoText}
        onTransferAmountChange={setTransferAmountText}
        onTransferMemoChange={setTransferMemoText}
        onAddAmountUnit={(unitWonValue) =>
          setTransferAmountText((previousValue) =>
            addTransferAmountUnit(previousValue, unitWonValue),
          )
        }
      />

      <div className="shrink-0 bg-white">
        {isBankTransferDecisionNode && (
          <div className="border-t border-black/10 px-4 py-3">
            <button
              type="button"
              disabled={!canAttemptTransfer || sharedProps.isAwaitingResponse}
              onClick={handleAttemptTransfer}
              className="w-full rounded-2xl bg-blue-600 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-500"
            >
              이체
            </button>
          </div>
        )}

        {showCallSubtitle && (
          <BankCallSubtitleBar
            senderName={currentNode.sender_name}
            subtitleText={bankPressureLineText}
            isStreamingSubtitle={!!streamingMessage}
            isCallSessionActive={isCallSessionActive}
          />
        )}
      </div>

      {confirmMode === "refuse_transfer" && (
        <BankConfirmDialog
          promptText="이체를 안 하시겠습니까?"
          confirmLabel="네"
          dismissLabel="아니오"
          onConfirm={handleConfirmRefuseTransfer}
          onDismiss={() => setConfirmMode(null)}
        />
      )}

      {confirmMode === "attempt_transfer" && (
        <BankConfirmDialog
          promptText="정말 이체하시겠습니까?"
          confirmLabel="네"
          dismissLabel="아니오"
          onConfirm={handleConfirmAttemptTransfer}
          onDismiss={() => setConfirmMode(null)}
        />
      )}
    </div>
  );
}
