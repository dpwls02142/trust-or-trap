"use client";

import { motion } from "framer-motion";

interface BankCallSubtitleBarProps {
  senderName: string;
  subtitleText: string;
  isStreamingSubtitle: boolean;
  isCallSessionActive: boolean;
}

/** bank 앱 하단 통화 자막 — CallScreen 자막과 같은 위치·연출 */
export function BankCallSubtitleBar({
  senderName,
  subtitleText,
  isStreamingSubtitle,
  isCallSessionActive,
}: BankCallSubtitleBarProps) {
  if (!subtitleText) return null;

  return (
    <div
      className={`border-t px-4 py-3 ${
        isCallSessionActive
          ? "border-white/10 bg-slate-950/95 text-white"
          : "border-black/10 bg-neutral-900/90 text-white"
      }`}
      role="status"
      aria-live="polite"
    >
      <p className="text-[11px] font-medium text-white/50">
        {isCallSessionActive ? `${senderName} · 통화 중` : `${senderName}`}
      </p>
      <p className="mt-1 text-sm leading-relaxed text-white/90">
        {subtitleText}
        {isStreamingSubtitle && (
          <motion.span
            animate={{ opacity: [1, 0.2, 1] }}
            transition={{ repeat: Infinity, duration: 0.9 }}
            aria-hidden
          >
            ▍
          </motion.span>
        )}
      </p>
    </div>
  );
}
