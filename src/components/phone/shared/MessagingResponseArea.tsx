"use client";

import { useEffect, useMemo, useState } from "react";
import { ResponseComposer } from "./ResponseComposer";
import { PhotoSendActionPanel } from "./PhotoSendActionPanel";
import { resolvePhotoSendActionConfig } from "@/lib/phone/messaging-scenario-action";
import type { InputTutorialMode } from "./InputTutorialBanner";
import type { ChatHistoryEntry, NodeOption } from "@/lib/scenario/types";

interface MessagingResponseAreaProps {
  nodeId: string;
  chatHistory: ChatHistoryEntry[];
  availableOptions: NodeOption[];
  allowFreeInput: boolean;
  voiceEnabled: boolean;
  isAwaitingResponse: boolean;
  streamingMessage: string;
  composerTheme?: "dark" | "light";
  composerBackgroundClass?: string;
  inputTutorialMode?: InputTutorialMode | null;
  isInputTutorialVisible?: boolean;
  onDismissInputTutorial?: () => void;
  onSelectOption: (optionLabel: string) => void;
  onSubmitFreeInput: (inputText: string) => void;
  onPhotoSendSubmit: (imagePath: string, optionLabel: string) => void;
}

/**
 * chat/sms/insta 공통 하단 응답 영역 — 사진 요구 노드면 yes/no 컨펌을 붙인다.
 */
export function MessagingResponseArea({
  nodeId,
  chatHistory,
  availableOptions,
  allowFreeInput,
  voiceEnabled,
  isAwaitingResponse,
  streamingMessage,
  composerTheme = "light",
  composerBackgroundClass = "bg-white",
  inputTutorialMode = null,
  isInputTutorialVisible = false,
  onDismissInputTutorial,
  onSelectOption,
  onSubmitFreeInput,
  onPhotoSendSubmit,
}: MessagingResponseAreaProps) {
  const photoSendActionConfig = useMemo(
    () => resolvePhotoSendActionConfig(nodeId),
    [nodeId],
  );

  const hasSentPhotoThisNode = useMemo(
    () =>
      chatHistory.some(
        (entryItem) =>
          entryItem.nodeId === nodeId &&
          entryItem.speaker === "player" &&
          !!entryItem.attachmentImagePath,
      ),
    [chatHistory, nodeId],
  );

  const [isPhotoPromptDismissed, setIsPhotoPromptDismissed] = useState(false);

  useEffect(() => {
    setIsPhotoPromptDismissed(false);
  }, [nodeId]);

  const isPhotoActionReady =
    !!photoSendActionConfig &&
    !hasSentPhotoThisNode &&
    !isPhotoPromptDismissed &&
    !isAwaitingResponse &&
    !streamingMessage &&
    availableOptions.length > 0;

  return (
    <>
      {photoSendActionConfig && (
        <PhotoSendActionPanel
          actionConfig={photoSendActionConfig}
          composerResetKey={nodeId}
          isInteractionEnabled={isPhotoActionReady}
          onDismissPrompt={() => setIsPhotoPromptDismissed(true)}
          onPhotoSendSubmit={onPhotoSendSubmit}
        />
      )}

      <div className={composerBackgroundClass}>
        <ResponseComposer
        composerResetKey={nodeId}
        availableOptions={availableOptions}
        allowFreeInput={allowFreeInput}
        voiceEnabled={voiceEnabled}
        isAwaitingResponse={isAwaitingResponse}
        onSelectOption={onSelectOption}
        onSubmitFreeInput={onSubmitFreeInput}
        composerTheme={composerTheme}
        inputTutorialMode={inputTutorialMode}
        isInputTutorialVisible={isInputTutorialVisible}
        onDismissInputTutorial={onDismissInputTutorial}
      />
      </div>
    </>
  );
}
