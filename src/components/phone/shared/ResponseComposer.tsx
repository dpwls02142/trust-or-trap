"use client";

import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { NodeOption } from "@/lib/scenario/types";

interface ResponseComposerProps {
  activeOptions: NodeOption[];
  allowFreeInput: boolean;
  /** 음성 입력(Web Speech API) 노출 여부 — teen 시나리오는 항상 false */
  voiceEnabled: boolean;
  isAwaitingResponse: boolean;
  onSelectOption: (optionLabel: string) => void;
  onSubmitFreeInput: (inputText: string) => void;
  composerTheme?: "dark" | "light";
}

/** 브라우저 SpeechRecognition 최소 타입 (표준 타입 미제공 브라우저 대응) */
interface MinimalSpeechRecognition {
  lang: string;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((resultEvent: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
}

function createSpeechRecognition(): MinimalSpeechRecognition | null {
  if (typeof window === "undefined") return null;
  const speechWindow = window as unknown as {
    SpeechRecognition?: new () => MinimalSpeechRecognition;
    webkitSpeechRecognition?: new () => MinimalSpeechRecognition;
  };
  const RecognitionConstructor =
    speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
  return RecognitionConstructor ? new RecognitionConstructor() : null;
}

/**
 * 사용자 응답 입력기 — 선택지 버튼 + 자유 텍스트 + (음성 시나리오) STT.
 * 마이크가 거부되거나 미지원이어도 텍스트 입력 대체 경로는 항상 남는다.
 */
export function ResponseComposer({
  activeOptions,
  allowFreeInput,
  voiceEnabled,
  isAwaitingResponse,
  onSelectOption,
  onSubmitFreeInput,
  composerTheme = "dark",
}: ResponseComposerProps) {
  const [freeInputText, setFreeInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<MinimalSpeechRecognition | null>(null);

  const handleMicToggle = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }
    const speechRecognition = createSpeechRecognition();
    if (!speechRecognition) return; // 미지원 → 텍스트 입력 사용

    recognitionRef.current = speechRecognition;
    speechRecognition.lang = "ko-KR";
    speechRecognition.interimResults = false;
    speechRecognition.onresult = (resultEvent) => {
      const transcriptText = resultEvent.results[0]?.[0]?.transcript ?? "";
      if (transcriptText) setFreeInputText(transcriptText);
    };
    speechRecognition.onend = () => setIsListening(false);
    speechRecognition.onerror = () => setIsListening(false);
    speechRecognition.start();
    setIsListening(true);
  }, [isListening]);

  const submitFreeInput = () => {
    const trimmedInput = freeInputText.trim();
    if (!trimmedInput || isAwaitingResponse) return;
    onSubmitFreeInput(trimmedInput);
    setFreeInputText("");
  };

  const isDarkTheme = composerTheme === "dark";

  return (
    <div className="flex flex-col gap-2 p-3">
      {activeOptions.length > 0 && (
        <div className="flex flex-col gap-2">
          {activeOptions.map((optionItem, optionIndex) => (
            <motion.button
              key={`${optionItem.label}-${optionIndex}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: optionIndex * 0.08 }}
              disabled={isAwaitingResponse}
              onClick={() => onSelectOption(optionItem.label)}
              className={`rounded-2xl border px-4 py-2.5 text-left text-sm transition disabled:opacity-40 ${
                isDarkTheme
                  ? "border-white/20 bg-white/10 text-white hover:bg-white/20"
                  : "border-black/10 bg-white text-black hover:bg-neutral-100"
              }`}
            >
              {optionItem.label}
            </motion.button>
          ))}
        </div>
      )}

      {allowFreeInput && (
        <div className="flex items-center gap-2">
          <input
            value={freeInputText}
            onChange={(changeEvent) => setFreeInputText(changeEvent.target.value)}
            onKeyDown={(keyEvent) => {
              if (keyEvent.key === "Enter" && !keyEvent.nativeEvent.isComposing) {
                submitFreeInput();
              }
            }}
            disabled={isAwaitingResponse}
            placeholder="직접 입력..."
            className={`min-w-0 flex-1 rounded-full px-4 py-2.5 text-sm outline-none disabled:opacity-40 ${
              isDarkTheme
                ? "bg-white/10 text-white placeholder:text-white/40"
                : "bg-neutral-100 text-black placeholder:text-black/40"
            }`}
          />
          {voiceEnabled && (
            <button
              onClick={handleMicToggle}
              disabled={isAwaitingResponse}
              aria-label={isListening ? "음성 입력 중지" : "음성으로 답하기"}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg transition disabled:opacity-40 ${
                isListening ? "animate-pulse bg-red-500 text-white" : isDarkTheme ? "bg-white/10" : "bg-neutral-100"
              }`}
            >
              🎤
            </button>
          )}
          <button
            onClick={submitFreeInput}
            disabled={isAwaitingResponse || !freeInputText.trim()}
            aria-label="보내기"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-500 text-white transition disabled:opacity-40"
          >
            ➤
          </button>
        </div>
      )}
    </div>
  );
}
