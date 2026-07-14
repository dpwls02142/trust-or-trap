"use client";

import { motion } from "framer-motion";
import { resolveAppLabel } from "@/lib/phone/app-display";
import type { AppType } from "@/lib/scenario/types";

interface AppTransitionConfirmProps {
  targetAppType: AppType;
  promptText: string;
  onConfirmOpen: () => void;
  onDismiss: () => void;
}

/**
 * 스텝(노드) 전환 시 app_type이 바뀌면 홈에서 띄우는 주인공 시점 컨펌.
 */
export function AppTransitionConfirm({
  targetAppType,
  promptText,
  onConfirmOpen,
  onDismiss,
}: AppTransitionConfirmProps) {
  const targetAppLabel = resolveAppLabel(targetAppType);

  return (
    <div
      className="absolute inset-0 z-40 flex items-center justify-center bg-black/45 px-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="app-transition-prompt"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 26, stiffness: 380 }}
        className="w-full max-w-[300px] overflow-hidden rounded-2xl bg-white text-center shadow-2xl"
      >
        <div className="px-5 pb-4 pt-5">
          <p className="text-xs font-medium text-black/45">{targetAppLabel}</p>
          <p
            id="app-transition-prompt"
            className="mt-2 text-base font-semibold leading-snug text-black"
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
            아니오
          </button>
          <button
            type="button"
            onClick={onConfirmOpen}
            className="flex-1 border-l border-black/10 py-3.5 text-sm font-semibold text-sky-600 transition-colors hover:bg-sky-50"
          >
            네
          </button>
        </div>
      </motion.div>
    </div>
  );
}
