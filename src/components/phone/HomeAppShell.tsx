"use client";

import { useMemo, useState } from "react";
import { AppBackButton } from "./shared/AppBackButton";
import { MessageAppThreadView } from "./shared/MessageAppThreadView";
import { resolveAppLabel } from "@/lib/phone/app-display";
import { buildScenarioMessageThread } from "@/lib/phone/message-thread-summary";
import type { AppType, ChatHistoryEntry } from "@/lib/scenario/types";

interface HomeAppShellProps {
  appType: AppType;
  onExitToHome: () => void;
  chatHistory?: ChatHistoryEntry[];
  scenarioSenderName?: string | null;
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
}: HomeAppShellProps) {
  const shellTitle = appType === "home" ? "앱" : resolveAppLabel(appType);
  const [openThreadSender, setOpenThreadSender] = useState<string | null>(null);

  const scenarioThread = useMemo(() => {
    if (!scenarioSenderName) return null;
    if (appType !== "chat" && appType !== "sms" && appType !== "insta") return null;
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
        {appType === "call" && <CallShellContent />}
        {appType === "bank" && <BankShellContent />}
        {appType === "browser" && <BrowserShellContent />}
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

function ChatShellContent({ scenarioThread, onOpenThread }: MessageShellContentProps) {
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
              <p className="truncate text-xs text-black/50">{scenarioThread.previewText}</p>
            </div>
          </button>
        </li>
      )}
      {decoyRows.map((rowItem) => (
        <li key={rowItem.name} className="flex items-center gap-3 px-4 py-3 opacity-60">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-300 text-xl">
            💬
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <p className="truncate text-sm font-semibold text-black">{rowItem.name}</p>
              <span className="shrink-0 text-[11px] text-black/40">{rowItem.time}</span>
            </div>
            <p className="truncate text-xs text-black/50">{rowItem.preview}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function SmsShellContent({ scenarioThread, onOpenThread }: MessageShellContentProps) {
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
              <p className="text-sm font-semibold text-black">{scenarioThread.senderName}</p>
              <p className="truncate text-xs text-black/50">{scenarioThread.previewText}</p>
            </div>
          </button>
        </li>
      )}
      {["1588-0000", "택배"].map((senderLabel) => (
        <li key={senderLabel} className="flex items-center gap-3 px-4 py-3 opacity-60">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-lg">
            ✉️
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-black">{senderLabel}</p>
            <p className="truncate text-xs text-black/50">최근 메시지가 없습니다</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function InstaShellContent({ scenarioThread, onOpenThread }: MessageShellContentProps) {
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
            <p className="text-sm font-semibold text-black">{scenarioThread.senderName}</p>
            <p className="truncate text-xs text-black/50">{scenarioThread.previewText}</p>
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

function CallShellContent() {
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

function BrowserShellContent() {
  return (
    <div className="p-4">
      <div className="rounded-full bg-neutral-100 px-4 py-2.5 text-sm text-black/50">
        검색 또는 URL 입력
      </div>
      <div className="mt-6 grid grid-cols-4 gap-4 text-center text-xs text-black/60">
        {["뉴스", "날씨", "지도", "쇼핑"].map((shortcutLabel) => (
          <div key={shortcutLabel} className="flex flex-col items-center gap-1">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-lg">
              🌐
            </span>
            {shortcutLabel}
          </div>
        ))}
      </div>
    </div>
  );
}
