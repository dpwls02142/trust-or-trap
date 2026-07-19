"use client";

import { motion } from "framer-motion";

interface BankConfirmDialogProps {
  promptText: string;
  confirmLabel?: string;
  dismissLabel?: string;
  onConfirm: () => void;
  onDismiss: () => void;
}

/** bank 앱 전용 2버튼 컨펌 — 이체 시도·이체 거절(탈출) 등 */
export function BankConfirmDialog({
  promptText,
  confirmLabel = "네",
  dismissLabel = "아니오",
  onConfirm,
  onDismiss,
}: BankConfirmDialogProps) {
  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/45 px-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bank-confirm-prompt"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 26, stiffness: 380 }}
        className="w-full max-w-[300px] overflow-hidden rounded-2xl bg-white text-center shadow-2xl"
      >
        <div className="px-5 pb-4 pt-5">
          <p
            id="bank-confirm-prompt"
            className="text-base font-semibold leading-snug text-black"
          >
            {promptText}
          </p>
        </div>
        <div className="flex border-t border-black/10">
          <button
            type="button"
            onClick={onDismiss}
            className="flex-1 py-3.5 text-sm font-medium text-black/55 transition-colors hover:bg-black/5"
          >
            {dismissLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 border-l border-black/10 py-3.5 text-sm font-semibold text-sky-600 transition-colors hover:bg-sky-50"
          >
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
