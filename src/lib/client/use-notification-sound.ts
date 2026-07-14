"use client";

import { useEffect } from "react";
import { playUiSound, uiSoundPaths } from "@/lib/client/ui-sounds";
import type { AppType } from "@/lib/scenario/types";

interface UseNotificationSoundOptions {
  isNotificationVisible: boolean;
  notificationAppType: AppType;
  /** 홈 복귀 등 이미 본 알림을 즉시 표시할 때는 효과음 생략 */
  suppressSound?: boolean;
}

/**
 * 홈 화면 알림 배너 표시 시 앱 종류에 맞는 UI 효과음을 재생한다.
 * 전화(call)는 벨소리를 반복하고, 그 외 알림은 alert.mp3를 1회 재생한다.
 */
export function useNotificationSound({
  isNotificationVisible,
  notificationAppType,
  suppressSound = false,
}: UseNotificationSoundOptions): void {
  useEffect(() => {
    if (!isNotificationVisible || suppressSound) return;

    const isIncomingCall = notificationAppType === "call";
    const soundPath = isIncomingCall
      ? uiSoundPaths.incomingCall
      : uiSoundPaths.notificationAlert;

    return playUiSound(soundPath, { loop: isIncomingCall });
  }, [isNotificationVisible, notificationAppType, suppressSound]);
}
