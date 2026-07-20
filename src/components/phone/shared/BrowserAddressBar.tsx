"use client";

import { type FormEvent, type KeyboardEvent } from "react";
import { RiLockFill, RiLockUnlockFill } from "@remixicon/react";
import { AppBackButton } from "./AppBackButton";
import { isSecureBrowserUrl } from "@/lib/phone/browser-navigation";

interface BrowserAddressBarProps {
  addressValue: string;
  placeholder?: string;
  onAddressChange: (nextValue: string) => void;
  onNavigate: (submittedValue: string) => void;
  onBack: () => void;
}

export function BrowserAddressBar({
  addressValue,
  placeholder = "검색 또는 URL 입력",
  onAddressChange,
  onNavigate,
  onBack,
}: BrowserAddressBarProps) {
  const isSecureConnection = isSecureBrowserUrl(addressValue.trim());

  const submitNavigation = () => {
    onNavigate(addressValue.trim());
  };

  const handleFormSubmit = (formEvent: FormEvent<HTMLFormElement>) => {
    formEvent.preventDefault();
    submitNavigation();
  };

  const handleInputKeyDown = (keyboardEvent: KeyboardEvent<HTMLInputElement>) => {
    if (keyboardEvent.key === "Enter") {
      keyboardEvent.preventDefault();
      submitNavigation();
    }
  };

  return (
    <form
      className="flex items-center gap-1 border-b border-black/10 bg-neutral-50 px-2 py-2"
      onSubmit={handleFormSubmit}
    >
      <AppBackButton onBack={onBack} />
      <span aria-hidden>
        {isSecureConnection ? (
          <RiLockFill size={14} className="text-emerald-600" />
        ) : (
          <RiLockUnlockFill size={14} className="text-black/45" />
        )}
      </span>
      <input
        type="text"
        inputMode="url"
        enterKeyHint="go"
        autoComplete="off"
        spellCheck={false}
        value={addressValue}
        placeholder={placeholder}
        aria-label="주소창"
        onChange={(changeEvent) => onAddressChange(changeEvent.target.value)}
        onKeyDown={handleInputKeyDown}
        className="min-w-0 flex-1 truncate rounded-full bg-neutral-200 px-3 py-1.5 text-xs text-black outline-none ring-sky-500 focus:ring-2"
      />
      <button
        type="submit"
        className="shrink-0 rounded-full bg-sky-600 px-2.5 py-1 text-[11px] font-semibold text-white"
      >
        이동
      </button>
    </form>
  );
}
