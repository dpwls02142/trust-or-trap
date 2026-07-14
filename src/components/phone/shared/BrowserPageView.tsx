"use client";

import { isLikelyIframeBlockedUrl } from "@/lib/phone/browser-navigation";
import { BrowserWebFrame } from "./BrowserWebFrame";
import { BrowserExternalPagePanel } from "./BrowserExternalPagePanel";

interface BrowserPageViewProps {
  pageUrl: string;
}

/**
 * URL에 따라 iframe 미리보기 또는 외부 탭 안내를 선택한다.
 * YouTube·Google 등은 X-Frame-Options 때문에 iframe 자체가 불가능하다.
 */
export function BrowserPageView({ pageUrl }: BrowserPageViewProps) {
  if (isLikelyIframeBlockedUrl(pageUrl)) {
    return <BrowserExternalPagePanel pageUrl={pageUrl} />;
  }

  return <BrowserWebFrame frameUrl={pageUrl} />;
}
