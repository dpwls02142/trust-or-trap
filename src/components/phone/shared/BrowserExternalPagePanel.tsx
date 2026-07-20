"use client";

import { RiGlobalFill } from "@remixicon/react";
import { openExternalBrowserPage } from "@/lib/phone/browser-navigation";

interface BrowserExternalPagePanelProps {
  pageUrl: string;
}

export function BrowserExternalPagePanel({
  pageUrl,
}: BrowserExternalPagePanelProps) {
  return (
    <div className="phone-scroll flex min-h-0 flex-1 flex-col items-center justify-center gap-4 overflow-y-auto bg-neutral-50 px-6 py-8">
      <span className="text-sky-600" aria-hidden>
        <RiGlobalFill size={36} />
      </span>
      <div className="w-full max-w-xs text-center">
        <p className="text-sm font-semibold text-black">
          이 사이트는 앱 안 미리보기를 지원하지 않습니다
        </p>
        <p className="mt-2 break-all text-xs leading-relaxed text-black/55">
          {pageUrl}
        </p>
      </div>
      <button
        type="button"
        onClick={() => openExternalBrowserPage(pageUrl)}
        className="rounded-full bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white"
      >
        새 탭에서 열기
      </button>
    </div>
  );
}
