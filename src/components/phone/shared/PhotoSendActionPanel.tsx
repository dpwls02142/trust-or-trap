"use client";

import { useCallback, useState } from "react";
import { RiCameraFill } from "@remixicon/react";
import { motion } from "framer-motion";
import type { PhotoSendActionConfig } from "@/lib/phone/messaging-scenario-action";

interface PhotoSendActionPanelProps {
  actionConfig: PhotoSendActionConfig;
  composerResetKey: string;
  isInteractionEnabled: boolean;
  onDismissPrompt: () => void;
  onPhotoSendSubmit: (imagePath: string, optionLabel: string) => void;
}

/**
 * 사진 요구 노드 — "사진 보낼까?" yes/no 컨펌. 네면 고정 사진 1장을 전송한다.
 */
export function PhotoSendActionPanel({
  actionConfig,
  composerResetKey,
  isInteractionEnabled,
  onDismissPrompt,
  onPhotoSendSubmit,
}: PhotoSendActionPanelProps) {
  const [hiddenPromptKey, setHiddenPromptKey] = useState<string | null>(null);
  const isPromptHidden = hiddenPromptKey === composerResetKey;

  const handleConfirmSend = useCallback(() => {
    setHiddenPromptKey(composerResetKey);
    onPhotoSendSubmit(
      actionConfig.attachmentImagePath,
      actionConfig.sendOptionLabel,
    );
  }, [
    actionConfig.attachmentImagePath,
    actionConfig.sendOptionLabel,
    composerResetKey,
    onPhotoSendSubmit,
  ]);

  const handleDismiss = useCallback(() => {
    setHiddenPromptKey(composerResetKey);
    onDismissPrompt();
  }, [composerResetKey, onDismissPrompt]);

  if (!isInteractionEnabled || isPromptHidden) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-3 mb-2 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-md"
      role="dialog"
      aria-labelledby="photo-send-prompt"
    >
      <div className="px-4 py-3.5 text-center">
        <p className="flex items-center justify-center gap-1 text-xs font-medium text-black/45">
          <RiCameraFill size={14} aria-hidden />
          사진
        </p>
        <p
          id="photo-send-prompt"
          className="mt-1.5 text-sm font-semibold leading-snug text-black"
        >
          {actionConfig.transitionPrompt}
        </p>
      </div>
      <div className="flex border-t border-black/10">
        <button
          type="button"
          onClick={handleDismiss}
          className="flex-1 py-3 text-sm font-medium text-black/55 transition-colors hover:bg-black/5"
        >
          아니오
        </button>
        <button
          type="button"
          onClick={handleConfirmSend}
          className="flex-1 border-l border-black/10 py-3 text-sm font-semibold text-sky-600 transition-colors hover:bg-sky-50"
        >
          네
        </button>
      </div>
    </motion.div>
  );
}
