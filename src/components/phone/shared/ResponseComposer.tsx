"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { NodeOption } from "@/lib/scenario/types";
import {
  InputTutorialBanner,
  type InputTutorialMode,
} from "@/components/phone/shared/InputTutorialBanner";

interface ResponseComposerProps {
  /** 현재 노드에서 선택 가능한 답안 (UI는 기본 숨김, 토글로 공개) */
  availableOptions: NodeOption[];
  allowFreeInput: boolean;
  /** 음성 입력(Web Speech API) 노출 여부 — teen 시나리오는 항상 false */
  voiceEnabled: boolean;
  isAwaitingResponse: boolean;
  onSelectOption: (optionLabel: string) => void;
  onSubmitFreeInput: (inputText: string) => void;
  composerTheme?: "dark" | "light";
  inputTutorialMode?: InputTutorialMode | null;
  isInputTutorialVisible?: boolean;
  onDismissInputTutorial?: () => void;
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

async function requestMicrophoneAccess(): Promise<void> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) return;
  try {
    const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaStream.getTracks().forEach((trackItem) => trackItem.stop());
  } catch {
    // 거부·미지원 — 텍스트 입력 대체 경로 유지
  }
}

/**
 * 사용자 응답 입력기 — 자유 텍스트/음성 우선, 예시 답변은 선택적 공개.
 * 마이크가 거부되거나 미지원이어도 텍스트 입력 대체 경로는 항상 남는다.
 */
export function ResponseComposer({
  availableOptions,
  allowFreeInput,
  voiceEnabled,
  isAwaitingResponse,
  onSelectOption,
  onSubmitFreeInput,
  composerTheme = "dark",
  inputTutorialMode = null,
  isInputTutorialVisible = false,
  onDismissInputTutorial,
}: ResponseComposerProps) {
  const [freeInputText, setFreeInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const availableOptionsKey = useMemo(
    () => availableOptions.map((optionItem) => optionItem.label).join("\0"),
    [availableOptions],
  );
  const [optionsPanelOpenKey, setOptionsPanelOpenKey] = useState<string | null>(null);
  const isOptionsPanelVisible = optionsPanelOpenKey === availableOptionsKey;
  const recognitionRef = useRef<MinimalSpeechRecognition | null>(null);
  const micPromptAttemptedRef = useRef(false);

  const showTutorialBanner =
    isInputTutorialVisible && inputTutorialMode !== null && inputTutorialMode !== undefined;

  // 통화 튜토리얼 — 브라우저 마이크 권한 프롬프트를 미리 띄움 (1회)
  useEffect(() => {
    if (!showTutorialBanner || inputTutorialMode !== "call" || micPromptAttemptedRef.current) {
      return;
    }
    micPromptAttemptedRef.current = true;
    void requestMicrophoneAccess();
  }, [showTutorialBanner, inputTutorialMode]);

  const dismissTutorialIfNeeded = useCallback(() => {
    if (showTutorialBanner) onDismissInputTutorial?.();
  }, [showTutorialBanner, onDismissInputTutorial]);

  const handleMicToggle = useCallback(() => {
    dismissTutorialIfNeeded();
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }
    const speechRecognition = createSpeechRecognition();
    if (!speechRecognition) return;

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
  }, [isListening, dismissTutorialIfNeeded]);

  const submitFreeInput = () => {
    const trimmedInput = freeInputText.trim();
    if (!trimmedInput || isAwaitingResponse) return;
    dismissTutorialIfNeeded();
    onSubmitFreeInput(trimmedInput);
    setFreeInputText("");
  };

  const handleSelectOption = (optionLabel: string) => {
    dismissTutorialIfNeeded();
    setFreeInputText("");
    setIsListening(false);
    recognitionRef.current?.stop();
    onSelectOption(optionLabel);
  };

  const isDarkTheme = composerTheme === "dark";
  const hasAvailableOptions = availableOptions.length > 0;
  const inputPlaceholder =
    inputTutorialMode === "call" ? "말하거나 직접 입력..." : "메시지를 입력하세요...";

  return (
    <div className="flex flex-col gap-2 p-3">
      {showTutorialBanner && inputTutorialMode && (
        <InputTutorialBanner
          tutorialMode={inputTutorialMode}
          composerTheme={composerTheme}
          onDismissTutorial={() => onDismissInputTutorial?.()}
        />
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
            placeholder={inputPlaceholder}
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
                isListening
                  ? "animate-pulse bg-red-500 text-white"
                  : isDarkTheme
                    ? "bg-white/10"
                    : "bg-neutral-100"
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

      {hasAvailableOptions && (
        <button
          type="button"
          disabled={isAwaitingResponse}
          onClick={() =>
            setOptionsPanelOpenKey((previousKey) =>
              previousKey === availableOptionsKey ? null : availableOptionsKey,
            )
          }
          className={`self-start rounded-full px-3 py-1 text-xs transition disabled:opacity-40 ${
            isDarkTheme
              ? "text-white/60 hover:bg-white/10 hover:text-white/90"
              : "text-black/50 hover:bg-neutral-100 hover:text-black/80"
          }`}
        >
          {isOptionsPanelVisible ? "예시 답변 닫기" : "예시 답변 보기"}
        </button>
      )}

      {isOptionsPanelVisible && hasAvailableOptions && (
        <div className="flex flex-col gap-2">
          {availableOptions.map((optionItem, optionIndex) => (
            <motion.button
              key={`${optionItem.label}-${optionIndex}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: optionIndex * 0.08 }}
              disabled={isAwaitingResponse}
              onClick={() => handleSelectOption(optionItem.label)}
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
    </div>
  );
}
