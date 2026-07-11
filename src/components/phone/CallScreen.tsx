"use client";

import { motion } from "framer-motion";
import { ResponseComposer } from "./shared/ResponseComposer";
import type { PhoneAppSharedProps } from "./shared/phone-app-props";

/**
 * app_type: call — 음성 통화 화면 (범용 렌더러).
 * 상대 대사는 자막처럼 표시되고 (TTS가 음성 재생), 사용자는 말하거나(STT) 선택지로 답한다.
 */
export function CallScreen(sharedProps: PhoneAppSharedProps) {
  const { currentNode, chatHistory, streamingMessage } = sharedProps;

  const latestScammerLine =
    streamingMessage ||
    [...chatHistory].reverse().find((entryItem) => entryItem.speaker === "scammer")
      ?.messageText ||
    "";
  const latestPlayerLine =
    [...chatHistory].reverse().find((entryItem) => entryItem.speaker === "player")
      ?.messageText ?? "";

  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-slate-800 to-slate-950 pt-14 text-white">
      <div className="flex flex-col items-center gap-2 px-6">
        <motion.span
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-600 text-4xl"
        >
          👤
        </motion.span>
        <h2 className="text-xl font-semibold">{currentNode.sender_name}</h2>
        <p className="text-xs text-white/50">통화 중...</p>
      </div>

      {/* 자막 영역 */}
      <div className="phone-scroll mt-4 flex-1 space-y-3 overflow-y-auto px-6 py-2">
        {latestScammerLine && (
          <div className="rounded-2xl bg-white/10 p-4 text-sm leading-relaxed backdrop-blur">
            <span className="mb-1 block text-[11px] text-white/50">
              {currentNode.sender_name}
            </span>
            {latestScammerLine}
            {streamingMessage && (
              <motion.span
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ repeat: Infinity, duration: 0.9 }}
                aria-hidden
              >
                ▍
              </motion.span>
            )}
          </div>
        )}
        {latestPlayerLine && (
          <div className="ml-6 rounded-2xl bg-sky-500/25 p-4 text-sm leading-relaxed">
            <span className="mb-1 block text-[11px] text-white/50">나</span>
            {latestPlayerLine}
          </div>
        )}
      </div>

      <div className="bg-black/40 pb-4 backdrop-blur">
        <ResponseComposer
          activeOptions={sharedProps.activeOptions}
          allowFreeInput={currentNode.allow_free_input}
          voiceEnabled={currentNode.voice_enabled}
          isAwaitingResponse={sharedProps.isAwaitingResponse}
          onSelectOption={sharedProps.onSelectOption}
          onSubmitFreeInput={sharedProps.onSubmitFreeInput}
          composerTheme="dark"
        />
        <p className="text-center text-[11px] text-white/40">
          마이크를 쓸 수 없으면 텍스트로 답해도 됩니다
        </p>
      </div>
    </div>
  );
}
