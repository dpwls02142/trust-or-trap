"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BrowserHomeView } from "./BrowserHomeView";
import { AppBackButton } from "./shared/AppBackButton";
import { MessageAppThreadView } from "./shared/MessageAppThreadView";
import { playDialKeyTone } from "@/lib/client/dial-key-tone";
import { dialNumbersMatch, formatDialDisplayNumber, resolveDialDigitLimit } from "@/lib/phone/dial-number";
import { resolveAppLabel } from "@/lib/phone/app-display";
import { buildScenarioMessageThread } from "@/lib/phone/message-thread-summary";
import type { AppType, ChatHistoryEntry } from "@/lib/scenario/types";

interface HomeAppShellProps {
  appType: AppType;
  onExitToHome: () => void;
  chatHistory?: ChatHistoryEntry[];
  scenarioSenderName?: string | null;
  /** 시나리오에서 키패드로 직접 걸어야 하는 가상 번호 */
  pendingOutboundDialNumber?: string | null;
  onOutboundDialConnect?: () => void;
}

type MessageShellAppType = Extract<AppType, "chat" | "sms" | "insta">;

/**
 * 시나리오와 무관하게 홈에서 진입한 앱의 기본 탐색 화면.
 * 메시지형 앱은 저장된 대화 목록·스레드 열람을 지원한다.
 */
export function HomeAppShell({
  appType,
  onExitToHome,
  chatHistory = [],
  scenarioSenderName = null,
  pendingOutboundDialNumber = null,
  onOutboundDialConnect,
}: HomeAppShellProps) {
  const shellTitle = appType === "home" ? "앱" : resolveAppLabel(appType);
  const [openThreadSender, setOpenThreadSender] = useState<string | null>(null);

  const scenarioThread = useMemo(() => {
    if (!scenarioSenderName) return null;
    if (appType !== "chat" && appType !== "sms" && appType !== "insta")
      return null;
    return buildScenarioMessageThread(chatHistory, appType, scenarioSenderName);
  }, [chatHistory, appType, scenarioSenderName]);

  const openThreadSummary =
    openThreadSender && scenarioThread?.senderName === openThreadSender
      ? scenarioThread
      : null;

  if (openThreadSummary && isMessageShellApp(appType)) {
    return (
      <div className="flex h-full flex-col pt-10">
        <MessageAppThreadView
          appType={appType}
          senderName={openThreadSummary.senderName}
          threadHistory={openThreadSummary.threadHistory}
          onBackToList={() => setOpenThreadSender(null)}
        />
      </div>
    );
  }

  if (appType === "browser") {
    return (
      <div className="flex h-full flex-col bg-white pt-10">
        <BrowserHomeView onExitToHome={onExitToHome} />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-white pt-10">
      <header className="flex items-center gap-2 border-b border-black/10 px-3 py-2.5">
        <AppBackButton onBack={onExitToHome} />
        <h2 className="text-sm font-semibold text-black">{shellTitle}</h2>
      </header>

      <div className="phone-scroll flex-1 overflow-y-auto">
        {appType === "chat" && (
          <ChatShellContent
            scenarioThread={scenarioThread}
            onOpenThread={setOpenThreadSender}
          />
        )}
        {appType === "sms" && (
          <SmsShellContent
            scenarioThread={scenarioThread}
            onOpenThread={setOpenThreadSender}
          />
        )}
        {appType === "insta" && (
          <InstaShellContent
            scenarioThread={scenarioThread}
            onOpenThread={setOpenThreadSender}
          />
        )}
        {appType === "call" && (
          <CallShellContent
            key={pendingOutboundDialNumber ?? "call-shell-idle"}
            pendingOutboundDialNumber={pendingOutboundDialNumber}
            onOutboundDialConnect={onOutboundDialConnect}
          />
        )}
        {appType === "bank" && <BankShellContent />}
      </div>
    </div>
  );
}

function isMessageShellApp(appType: AppType): appType is MessageShellAppType {
  return appType === "chat" || appType === "sms" || appType === "insta";
}

interface MessageShellContentProps {
  scenarioThread: ReturnType<typeof buildScenarioMessageThread>;
  onOpenThread: (senderName: string) => void;
}

function ChatShellContent({
  scenarioThread,
  onOpenThread,
}: MessageShellContentProps) {
  const decoyRows = [
    { name: "베프", preview: "주말에 만날래?", time: "오후 2:30", unread: 0 },
  ];

  return (
    <ul className="divide-y divide-black/5">
      {scenarioThread && (
        <li>
          <button
            type="button"
            onClick={() => onOpenThread(scenarioThread.senderName)}
            className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-neutral-50"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-300 text-xl">
              💬
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-black">
                {scenarioThread.senderName}
              </p>
              <p className="truncate text-xs text-black/50">
                {scenarioThread.previewText}
              </p>
            </div>
          </button>
        </li>
      )}
      {decoyRows.map((rowItem) => (
        <li
          key={rowItem.name}
          className="flex items-center gap-3 px-4 py-3 opacity-60"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-300 text-xl">
            💬
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <p className="truncate text-sm font-semibold text-black">
                {rowItem.name}
              </p>
              <span className="shrink-0 text-[11px] text-black/40">
                {rowItem.time}
              </span>
            </div>
            <p className="truncate text-xs text-black/50">{rowItem.preview}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function SmsShellContent({
  scenarioThread,
  onOpenThread,
}: MessageShellContentProps) {
  return (
    <ul className="divide-y divide-black/5">
      {scenarioThread && (
        <li>
          <button
            type="button"
            onClick={() => onOpenThread(scenarioThread.senderName)}
            className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-neutral-50"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-lg">
              ✉️
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-black">
                {scenarioThread.senderName}
              </p>
              <p className="truncate text-xs text-black/50">
                {scenarioThread.previewText}
              </p>
            </div>
          </button>
        </li>
      )}
      {["1588-0000", "택배"].map((senderLabel) => (
        <li
          key={senderLabel}
          className="flex items-center gap-3 px-4 py-3 opacity-60"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-lg">
            ✉️
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-black">{senderLabel}</p>
            <p className="truncate text-xs text-black/50">
              최근 메시지가 없습니다
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function InstaShellContent({
  scenarioThread,
  onOpenThread,
}: MessageShellContentProps) {
  return (
    <div>
      {scenarioThread && (
        <button
          type="button"
          onClick={() => onOpenThread(scenarioThread.senderName)}
          className="flex w-full items-center gap-3 border-b border-black/5 px-4 py-3 text-left transition hover:bg-neutral-50"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 text-sm text-white">
            DM
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-black">
              {scenarioThread.senderName}
            </p>
            <p className="truncate text-xs text-black/50">
              {scenarioThread.previewText}
            </p>
          </div>
        </button>
      )}
      <div className="grid grid-cols-3 gap-0.5 opacity-80">
        {Array.from({ length: 12 }, (_, tileIndex) => (
          <div
            key={`insta-tile-${tileIndex}`}
            className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100"
          />
        ))}
      </div>
    </div>
  );
}

type CallShellTab = "recents" | "keypad";

const dialKeyRows: string[][] = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["*", "0", "#"],
];

function CallShellContent({
  pendingOutboundDialNumber = null,
  onOutboundDialConnect,
}: {
  pendingOutboundDialNumber?: string | null;
  onOutboundDialConnect?: () => void;
}) {
  const [activeCallTab, setActiveCallTab] = useState<CallShellTab>(() =>
    pendingOutboundDialNumber ? "keypad" : "recents",
  );
  const [dialedDigits, setDialedDigits] = useState("");
  const [dialFeedbackMessage, setDialFeedbackMessage] = useState<string | null>(
    null,
  );

  const formattedDialNumber = formatDialDisplayNumber(dialedDigits);
  const hasDialedDigits = dialedDigits.length > 0;

  const handleAppendDigit = (nextDigit: string) => {
    setDialFeedbackMessage(null);
    playDialKeyTone(nextDigit);
    setDialedDigits((previousDigits) => {
      const digitOnly = previousDigits.replace(/\D/g, "");
      const digitLimit = resolveDialDigitLimit(digitOnly);
      if (/\d/.test(nextDigit) && digitOnly.length >= digitLimit) return previousDigits;
      return `${previousDigits}${nextDigit}`;
    });
  };

  const handleDeleteDigit = () => {
    setDialFeedbackMessage(null);
    setDialedDigits((previousDigits) => previousDigits.slice(0, -1));
  };

  const handleClearAllDigits = () => {
    setDialFeedbackMessage(null);
    setDialedDigits("");
  };

  const handleStartDialCall = () => {
    if (!hasDialedDigits || !pendingOutboundDialNumber) return;

    if (!dialNumbersMatch(dialedDigits, pendingOutboundDialNumber)) {
      setDialFeedbackMessage(
        "번호가 일치하지 않습니다. 문자에 안내된 번호를 확인하세요.",
      );
      return;
    }

    setDialFeedbackMessage(null);
    onOutboundDialConnect?.();
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex-1 overflow-y-auto">
        {activeCallTab === "recents" ? (
          <CallRecentsView />
        ) : (
          <CallDialKeypadView
            formattedDialNumber={formattedDialNumber}
            dialFeedbackMessage={dialFeedbackMessage}
            pendingOutboundDialNumber={pendingOutboundDialNumber}
            hasDialedDigits={hasDialedDigits}
            onAppendDigit={handleAppendDigit}
            onDeleteDigit={handleDeleteDigit}
            onClearAllDigits={handleClearAllDigits}
            onStartDialCall={handleStartDialCall}
          />
        )}
      </div>

      <nav
        className="flex shrink-0 border-t border-black/10 bg-white"
        aria-label="전화 앱 탭"
      >
        <CallShellTabButton
          tabId="recents"
          label="최근"
          isActive={activeCallTab === "recents"}
          onSelect={setActiveCallTab}
        />
        <CallShellTabButton
          tabId="keypad"
          label="키패드"
          isActive={activeCallTab === "keypad"}
          onSelect={setActiveCallTab}
        />
      </nav>
    </div>
  );
}

interface CallShellTabButtonProps {
  tabId: CallShellTab;
  label: string;
  isActive: boolean;
  onSelect: (tabId: CallShellTab) => void;
}

function CallShellTabButton({
  tabId,
  label,
  isActive,
  onSelect,
}: CallShellTabButtonProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(tabId)}
      aria-current={isActive ? "page" : undefined}
      className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
        isActive ? "text-emerald-600" : "text-black/45 hover:text-black/70"
      }`}
    >
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-lg ${
          isActive ? "bg-emerald-50" : "bg-transparent"
        }`}
        aria-hidden
      >
        {tabId === "recents" ? (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
            <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V21a1 1 0 01-1 1C10.07 22 2 13.93 2 3a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.46.57 3.58a1 1 0 01-.25 1.01l-2.2 2.2z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
            <path d="M4 5h3l2 5-2.5 1.5a11 11 0 005 5L13 14l5 2v3a1 1 0 01-1 1A15 15 0 014 5a1 1 0 011-1z" />
          </svg>
        )}
      </span>
      {label}
    </button>
  );
}

function CallRecentsView() {
  const callRows = [
    { name: "엄마", type: "수신", time: "오늘 11:20" },
    { name: "010-1234-5678", type: "부재중", time: "어제" },
  ];

  return (
    <ul className="divide-y divide-black/5">
      {callRows.map((rowItem) => (
        <li key={rowItem.name} className="flex items-center gap-3 px-4 py-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-lg">
            📞
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-black">{rowItem.name}</p>
            <p className="text-xs text-black/50">
              {rowItem.type} · {rowItem.time}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

interface CallDialKeypadViewProps {
  formattedDialNumber: string;
  dialFeedbackMessage: string | null;
  pendingOutboundDialNumber: string | null;
  hasDialedDigits: boolean;
  onAppendDigit: (digit: string) => void;
  onDeleteDigit: () => void;
  onClearAllDigits: () => void;
  onStartDialCall: () => void;
}

const dialDeleteLongPressMs = 500;

interface DialDeleteButtonProps {
  hasDialedDigits: boolean;
  onDeleteDigit: () => void;
  onClearAllDigits: () => void;
}

function DialDeleteButton({
  hasDialedDigits,
  onDeleteDigit,
  onClearAllDigits,
}: DialDeleteButtonProps) {
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPressRef = useRef(false);
  const isPointerActiveRef = useRef(false);

  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    };
  }, []);

  const clearLongPressTimer = () => {
    if (!longPressTimerRef.current) return;
    clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = null;
  };

  const handlePointerDown = () => {
    if (!hasDialedDigits) return;

    isPointerActiveRef.current = true;
    didLongPressRef.current = false;
    clearLongPressTimer();
    longPressTimerRef.current = setTimeout(() => {
      didLongPressRef.current = true;
      onClearAllDigits();
    }, dialDeleteLongPressMs);
  };

  const handlePointerUp = () => {
    clearLongPressTimer();
    const wasPointerActive = isPointerActiveRef.current;
    isPointerActiveRef.current = false;

    if (!wasPointerActive) return;

    if (didLongPressRef.current) {
      didLongPressRef.current = false;
      return;
    }
    if (hasDialedDigits) onDeleteDigit();
  };

  const handlePointerCancel = () => {
    clearLongPressTimer();
    isPointerActiveRef.current = false;
  };

  return (
    <button
      type="button"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerCancel}
      onPointerCancel={handlePointerCancel}
      onContextMenu={(event) => event.preventDefault()}
      disabled={!hasDialedDigits}
      aria-label="한 글자 지우기. 길게 누르면 전체 삭제"
      className="flex h-14 w-14 select-none items-center justify-center rounded-full text-black/70 transition-colors hover:bg-neutral-100 active:bg-neutral-200 disabled:invisible touch-none"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M21 4H8L1 12l7 8h13a2 2 0 002-2V6a2 2 0 00-2-2z" />
        <path d="M18 9l-6 6M12 9l6 6" />
      </svg>
    </button>
  );
}

function CallDialKeypadView({
  formattedDialNumber,
  dialFeedbackMessage,
  pendingOutboundDialNumber,
  hasDialedDigits,
  onAppendDigit,
  onDeleteDigit,
  onClearAllDigits,
  onStartDialCall,
}: CallDialKeypadViewProps) {
  return (
    <div className="flex h-full flex-col px-4 pb-4 pt-6">
      <div className="flex min-h-[52px] items-center justify-center px-8">
        <p
          className="truncate text-center text-[28px] font-light tracking-wide text-black"
          aria-live="polite"
          aria-label={
            formattedDialNumber
              ? `입력 번호 ${formattedDialNumber}`
              : "번호 입력"
          }
        >
          {formattedDialNumber || "\u00a0"}
        </p>
      </div>

      {pendingOutboundDialNumber && (
        <p className="mb-1 text-center text-xs text-black/45">
          문자에 안내된 번호를 입력하세요
        </p>
      )}

      {dialFeedbackMessage && (
        <p className="mb-2 text-center text-xs text-red-500" role="status">
          {dialFeedbackMessage}
        </p>
      )}

      <div className="mx-auto grid w-full max-w-[280px] grid-cols-3 justify-items-center gap-x-4 gap-y-3">
        {dialKeyRows.flatMap((keyRow) =>
          keyRow.map((keyDigit) => (
            <button
              key={keyDigit}
              type="button"
              onClick={() => onAppendDigit(keyDigit)}
              className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-neutral-100 text-[28px] font-light text-black transition-colors hover:bg-neutral-200 active:bg-neutral-300"
              aria-label={`숫자 ${keyDigit}`}
            >
              {keyDigit}
            </button>
          )),
        )}
      </div>

      <div className="mx-auto mt-4 flex w-full max-w-[280px] items-center justify-center gap-6">
        <span className="h-14 w-14" aria-hidden />

        <button
          type="button"
          onClick={onStartDialCall}
          disabled={!hasDialedDigits}
          aria-label="전화 걸기"
          className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white transition-colors hover:bg-emerald-600 active:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-7 w-7"
            fill="currentColor"
            aria-hidden
          >
            <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V21a1 1 0 01-1 1C10.07 22 2 13.93 2 2a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.46.57 3.58a1 1 0 01-.25 1.01l-2.2 2.2z" />
          </svg>
        </button>

        <DialDeleteButton
          hasDialedDigits={hasDialedDigits}
          onDeleteDigit={onDeleteDigit}
          onClearAllDigits={onClearAllDigits}
        />
      </div>
    </div>
  );
}

function BankShellContent() {
  return (
    <div className="bg-neutral-50">
      <div className="bg-blue-700 px-4 py-6 text-white">
        <p className="text-xs text-white/70">내 계좌 잔액</p>
        <p className="mt-1 text-2xl font-bold">3,481,200원</p>
      </div>
      <ul className="mt-2 divide-y divide-black/5 bg-white">
        {["이체", "계좌조회", "대출상담", "고객센터"].map((menuLabel) => (
          <li key={menuLabel} className="px-4 py-3.5 text-sm text-black">
            {menuLabel}
          </li>
        ))}
      </ul>
    </div>
  );
}
