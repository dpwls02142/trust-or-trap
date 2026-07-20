"use client";

import { useState } from "react";
import { RiGlobalFill } from "@remixicon/react";
import { BrowserAddressBar } from "./shared/BrowserAddressBar";
import { BrowserPageView } from "./shared/BrowserPageView";
import {
  getHttpSecurityWarning,
  resolveBrowserNavigationUrl,
} from "@/lib/phone/browser-navigation";

interface BrowserHomeViewProps {
  onExitToHome: () => void;
}

/** 홈에서 진입한 브라우저 — 검색·URL 입력 후 iframe으로 실제 페이지를 연다. */
export function BrowserHomeView({ onExitToHome }: BrowserHomeViewProps) {
  const [addressInputValue, setAddressInputValue] = useState("");
  const [activeNavigationUrl, setActiveNavigationUrl] = useState<string | null>(
    null,
  );

  const securityWarning = activeNavigationUrl
    ? getHttpSecurityWarning(activeNavigationUrl)
    : null;

  const handleNavigate = (submittedValue: string) => {
    const resolvedUrl = resolveBrowserNavigationUrl(submittedValue);
    if (!resolvedUrl) {
      return;
    }

    setAddressInputValue(resolvedUrl);
    setActiveNavigationUrl(resolvedUrl);
  };

  return (
    <div className="flex h-full flex-col">
      <BrowserAddressBar
        addressValue={addressInputValue}
        onAddressChange={setAddressInputValue}
        onNavigate={handleNavigate}
        onBack={onExitToHome}
      />

      {securityWarning && (
        <div className="border-b border-black/10 bg-amber-50 px-4 py-1.5 text-[11px] text-amber-800">
          {securityWarning}
        </div>
      )}

      {activeNavigationUrl ? (
        <BrowserPageView pageUrl={activeNavigationUrl} />
      ) : (
        <div className="phone-scroll flex-1 overflow-y-auto p-4">
          <div className="mt-2 grid grid-cols-4 gap-4 text-center text-xs text-black/60">
            {["뉴스", "날씨", "지도", "쇼핑"].map((shortcutLabel) => (
              <div
                key={shortcutLabel}
                className="flex flex-col items-center gap-1"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-600">
                  <RiGlobalFill size={22} aria-hidden />
                </span>
                {shortcutLabel}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
