"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { ResponseComposer } from "./shared/ResponseComposer";
import { SenderAvatar } from "./shared/SenderAvatar";
import { AppBackButton } from "./shared/AppBackButton";
import { TypingIndicator } from "./shared/TypingIndicator";
import {
  filterChatHistoryForAppView,
  findLatestSpeakerMessage,
} from "@/lib/phone/chat-history-view";
import type { PhoneAppSharedProps } from "./shared/phone-app-props";

/**
 * app_type: call — 음성 통화 화면 (범용 렌더러).
 * 상대 대사는 자막처럼 표시되고 (TTS가 음성 재생), 사용자는 말하거나(STT) 선택지로 답한다.
 */
export function CallScreen(sharedProps: PhoneAppSharedProps) {
  const { activeScenarioId, currentNode, chatHistory, streamingMessage, isAwaitingResponse } =
    sharedProps;

  const nodeChatHistory = useMemo(
    () => filterChatHistoryForAppView(chatHistory, currentNode),
    [chatHistory, currentNode],
  );

  // 첫 자막 토큰 도착 전 — 상대가 말을 고르는 중임을 표시
  const showSpeechPending = isAwaitingResponse && !streamingMessage;

  const latestScammerLine =
    streamingMessage || findLatestSpeakerMessage(nodeChatHistory, "scammer");
  const latestPlayerLine = findLatestSpeakerMessage(nodeChatHistory, "player");

  return (
    <div className="relative flex h-full flex-col bg-gradient-to-b from-slate-800 to-slate-950 pt-14 text-white">
      <div className="absolute left-2 top-12 z-10">
        <AppBackButton onBack={sharedProps.onExitToHome} tone="dark" />
      </div>
      <div className="flex flex-col items-center gap-2 px-6">
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <SenderAvatar
            scenarioId={activeScenarioId}
            senderName={currentNode.sender_name}
            sizeClass="h-20 w-20"
            fallbackSurfaceClass="bg-slate-600 text-4xl text-white"
          />
        </motion.div>
        <h2 className="text-xl font-semibold">{currentNode.sender_name}</h2>
        <p className="text-xs text-white/50">통화 중...</p>
      </div>

      {showSpeechPending && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 flex items-center justify-center gap-2 text-xs text-white/60"
          role="status"
        >
          <TypingIndicator dotColorClass="bg-white/60" />
          상대방이 말하려고 합니다
        </motion.div>
      )}

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
        <div className="flex justify-center py-3">
          <button
            type="button"
            onClick={sharedProps.onHangUpCall}
            aria-label="통화 끊기"
            className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500 text-white transition-colors hover:bg-red-600 active:bg-red-700"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-7 w-7 rotate-[135deg]"
              fill="currentColor"
              aria-hidden
            >
              <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V21a1 1 0 01-1 1C10.07 22 2 13.93 2 3a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.46.57 3.58a1 1 0 01-.25 1.01l-2.2 2.2z" />
            </svg>
          </button>
        </div>

        <ResponseComposer
          key={currentNode.node_id}
          availableOptions={sharedProps.availableOptions}
          allowFreeInput={currentNode.allow_free_input}
          voiceEnabled={currentNode.voice_enabled}
          isAwaitingResponse={sharedProps.isAwaitingResponse}
          onSelectOption={sharedProps.onSelectOption}
          onSubmitFreeInput={sharedProps.onSubmitFreeInput}
          inputTutorialMode={sharedProps.inputTutorialMode}
          isInputTutorialVisible={sharedProps.isInputTutorialVisible}
          onDismissInputTutorial={sharedProps.onDismissInputTutorial}
          composerTheme="dark"
        />
        <p className="text-center text-[11px] text-white/40">
          마이크를 쓸 수 없으면 텍스트로 답해도 됩니다
        </p>
      </div>
    </div>
  );
}
