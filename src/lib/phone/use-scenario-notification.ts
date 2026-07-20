"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AppType } from "@/lib/scenario/types";

interface UseScenarioNotificationOptions {
  notificationAppType: AppType;
  suppressIncomingCallAlert: boolean;
}

interface UseScenarioNotificationResult {
  shouldDisplayNotification: boolean;
  isNotificationBannerVisible: boolean;
  dismissNotificationBanner: () => void;
  beginDelayedNotificationReveal: (delayMs?: number) => void;
  revealNotificationImmediately: () => void;
  resetScenarioNotification: () => void;
}

const notificationRevealDelayMs = 1800;

/**
 * 시나리오 알림 배너·배지 표시 타이밍(1.8초 지연·즉시)과 스와이프 dismiss 상태.
 */
export function useScenarioNotification({
  notificationAppType,
  suppressIncomingCallAlert,
}: UseScenarioNotificationOptions): UseScenarioNotificationResult {
  const [isNotificationRevealed, setIsNotificationRevealed] = useState(false);
  const [isNotificationBannerDismissed, setIsNotificationBannerDismissed] =
    useState(false);
  const notificationRevealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const stopNotificationRevealTimer = useCallback(() => {
    if (notificationRevealTimerRef.current) {
      clearTimeout(notificationRevealTimerRef.current);
      notificationRevealTimerRef.current = null;
    }
  }, []);

  const resetScenarioNotification = useCallback(() => {
    stopNotificationRevealTimer();
    setIsNotificationRevealed(false);
    setIsNotificationBannerDismissed(false);
  }, [stopNotificationRevealTimer]);

  const beginDelayedNotificationReveal = useCallback(
    (delayMs: number = notificationRevealDelayMs) => {
      stopNotificationRevealTimer();
      setIsNotificationRevealed(false);
      setIsNotificationBannerDismissed(false);
      notificationRevealTimerRef.current = setTimeout(() => {
        setIsNotificationRevealed(true);
        notificationRevealTimerRef.current = null;
      }, delayMs);
    },
    [stopNotificationRevealTimer],
  );

  const revealNotificationImmediately = useCallback(() => {
    stopNotificationRevealTimer();
    setIsNotificationRevealed(true);
    setIsNotificationBannerDismissed(false);
  }, [stopNotificationRevealTimer]);

  const dismissNotificationBanner = useCallback(() => {
    setIsNotificationBannerDismissed(true);
  }, []);

  useEffect(() => () => stopNotificationRevealTimer(), [stopNotificationRevealTimer]);

  const shouldDisplayNotification =
    isNotificationRevealed &&
    notificationAppType !== "browser" &&
    !(notificationAppType === "call" && suppressIncomingCallAlert);

  const isNotificationBannerVisible =
    shouldDisplayNotification && !isNotificationBannerDismissed;

  return {
    shouldDisplayNotification,
    isNotificationBannerVisible,
    dismissNotificationBanner,
    beginDelayedNotificationReveal,
    revealNotificationImmediately,
    resetScenarioNotification,
  };
}
