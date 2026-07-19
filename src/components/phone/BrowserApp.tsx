"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BrowserAddressBar } from "./shared/BrowserAddressBar";
import { BrowserScenarioPagePanel } from "./shared/BrowserScenarioPagePanel";
import { BrowserPageView } from "./shared/BrowserPageView";
import { ScenarioActionPanel } from "./shared/ScenarioActionPanel";
import { findLatestSpeakerMessage } from "@/lib/phone/chat-history-view";
import {
  resolveBrowserPageConfig,
  resolveReverseImageSearchProfile,
  shouldShowBrowserPageNotice,
  type BrowserPageRevealPhase,
} from "@/lib/phone/browser-scenario-page";
import {
  getScenarioSiteSecurityWarning,
  resolveBrowserNavigationUrl,
  SCENARIO_FAKE_SITE_URL,
} from "@/lib/phone/browser-navigation";
import type { PhoneAppSharedProps } from "./shared/phone-app-props";

/**
 * app_type: browser — 가짜 사이트/역이미지 검색 화면 (범용 렌더러).
 * 주소창에 URL·검색어를 입력하면 iframe으로 실제 페이지를 연다.
 * 기본 가짜 URL은 시나리오 연출(역이미지 검색)을 유지한다.
 */
export function BrowserApp(sharedProps: PhoneAppSharedProps) {
  return <BrowserAppBody key={sharedProps.currentNode.node_id} sharedProps={sharedProps} />;
}

function BrowserAppBody({ sharedProps }: { sharedProps: PhoneAppSharedProps }) {
  const { activeScenarioId, currentNode, chatHistory, streamingMessage } = sharedProps;
  const [addressInputValue, setAddressInputValue] = useState(SCENARIO_FAKE_SITE_URL);
  const [activeNavigationUrl, setActiveNavigationUrl] = useState<string | null>(null);
  const [pageRevealPhase, setPageRevealPhase] =
    useState<BrowserPageRevealPhase>("awaiting_action");
  const pageRevealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const browserPageConfig = useMemo(
    () => resolveBrowserPageConfig(currentNode.node_id),
    [currentNode.node_id],
  );

  useEffect(() => {
    return () => {
      if (pageRevealTimerRef.current) {
        clearTimeout(pageRevealTimerRef.current);
      }
    };
  }, []);

  const handlePrimaryPageAction = useCallback(() => {
    if (pageRevealPhase !== "awaiting_action") {
      return;
    }

    setPageRevealPhase("loading");
    pageRevealTimerRef.current = setTimeout(() => {
      setPageRevealPhase("revealed");
      pageRevealTimerRef.current = null;
    }, 1400);
  }, [pageRevealPhase]);

  const pageNoticeText = useMemo(() => {
    const nodeScammerLine = findLatestSpeakerMessage(
      chatHistory.filter((entryItem) => entryItem.nodeId === currentNode.node_id),
      "scammer",
    );
    return streamingMessage || nodeScammerLine;
  }, [chatHistory, currentNode.node_id, streamingMessage]);

  const showPageNotice = shouldShowBrowserPageNotice(browserPageConfig.pageVariant);
  const reverseImageSearchProfile = useMemo(
    () =>
      resolveReverseImageSearchProfile(activeScenarioId, currentNode.sender_name),
    [activeScenarioId, currentNode.sender_name],
  );
  const isPageRevealed = pageRevealPhase === "revealed";

  const securityWarning = getScenarioSiteSecurityWarning(
    activeNavigationUrl ?? addressInputValue,
  );

  const handleNavigate = (submittedValue: string) => {
    const resolvedUrl = resolveBrowserNavigationUrl(submittedValue);
    if (!resolvedUrl) {
      return;
    }

    setAddressInputValue(resolvedUrl);

    if (resolvedUrl === SCENARIO_FAKE_SITE_URL) {
      setActiveNavigationUrl(null);
      return;
    }

    setActiveNavigationUrl(resolvedUrl);
  };

  return (
    <div className="flex h-full flex-col bg-white pt-10">
      <BrowserAddressBar
        addressValue={addressInputValue}
        onAddressChange={setAddressInputValue}
        onNavigate={handleNavigate}
        onBack={sharedProps.onExitToHome}
      />

      {securityWarning && (
        <div className="border-b border-black/10 bg-red-50 px-4 py-1.5 text-[11px] text-red-700">
          {securityWarning}
        </div>
      )}

      {activeNavigationUrl ? (
        <BrowserPageView pageUrl={activeNavigationUrl} />
      ) : (
        <BrowserScenarioPagePanel
          pageVariant={browserPageConfig.pageVariant}
          entryContextText={browserPageConfig.entryContextText}
          primaryActionLabel={browserPageConfig.primaryActionLabel}
          preRevealHint={browserPageConfig.preRevealHint}
          loadingLabel={browserPageConfig.loadingLabel}
          reverseImageProfilePath={reverseImageSearchProfile.profileImagePath}
          reverseImageProfileName={reverseImageSearchProfile.profileDisplayName}
          pageNoticeText={pageNoticeText}
          isAwaitingResponse={sharedProps.isAwaitingResponse}
          isStreamingNotice={!!streamingMessage}
          showPageNotice={showPageNotice}
          pageRevealPhase={pageRevealPhase}
          onPrimaryPageAction={handlePrimaryPageAction}
        />
      )}

      {isPageRevealed && (
        <ScenarioActionPanel
          composerResetKey={currentNode.node_id}
          panelTitle={browserPageConfig.actionPanelTitle}
          panelHint={browserPageConfig.actionPanelHint}
          availableOptions={sharedProps.availableOptions}
          allowFreeInput={false}
          freeInputPlaceholder="직접 판단을 입력..."
          isAwaitingResponse={sharedProps.isAwaitingResponse}
          onSelectOption={sharedProps.onSelectOption}
          onSubmitFreeInput={sharedProps.onSubmitFreeInput}
        />
      )}
    </div>
  );
}
