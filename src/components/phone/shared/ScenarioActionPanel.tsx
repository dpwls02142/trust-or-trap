"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { NodeOption } from "@/lib/scenario/types";

interface ScenarioActionPanelProps {
  availableOptions: NodeOption[];
  allowFreeInput: boolean;
  freeInputPlaceholder: string;
  isAwaitingResponse: boolean;
  onSelectOption: (optionLabel: string) => void;
  onSubmitFreeInput: (inputText: string) => void;
}

/**
 * 메시지 앱이 아닌 화면(브라우저·은행 등)용 응답 패널.
 * 채팅 입력창 대신 맥락에 맞는 행동 버튼·선택적 직접 입력만 제공한다.
 */
export function ScenarioActionPanel({
  availableOptions,
  allowFreeInput,
  freeInputPlaceholder,
  isAwaitingResponse,
  onSelectOption,
  onSubmitFreeInput,
}: ScenarioActionPanelProps) {
  const [freeInputText, setFreeInputText] = useState("");

  const submitFreeInput = () => {
    const trimmedInput = freeInputText.trim();
    if (!trimmedInput || isAwaitingResponse) return;
    onSubmitFreeInput(trimmedInput);
    setFreeInputText("");
  };

  return (
    <div className="flex flex-col gap-3 border-t border-black/10 bg-neutral-50 p-4">
      {availableOptions.length > 0 && (
        <div className="flex flex-col gap-2">
          {availableOptions.map((optionItem, optionIndex) => (
            <motion.button
              key={`${optionItem.label}-${optionIndex}`}
              type="button"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: optionIndex * 0.06 }}
              disabled={isAwaitingResponse}
              onClick={() => onSelectOption(optionItem.label)}
              className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-left text-sm font-medium text-black transition disabled:opacity-40"
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
            placeholder={freeInputPlaceholder}
            className="min-w-0 flex-1 rounded-full border border-black/10 bg-white px-4 py-2.5 text-sm text-black outline-none placeholder:text-black/40 disabled:opacity-40"
          />
          <button
            type="button"
            onClick={submitFreeInput}
            disabled={isAwaitingResponse || !freeInputText.trim()}
            aria-label="확인"
            className="flex h-10 shrink-0 items-center justify-center rounded-full bg-sky-500 px-4 text-sm font-semibold text-white transition disabled:opacity-40"
          >
            확인
          </button>
        </div>
      )}
    </div>
  );
}
