"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotificationSound } from "@/lib/client/use-notification-sound";
import {
  homeAppIconList,
  resolveAppDisplayConfig,
  resolveNotificationPreview,
} from "@/lib/phone/app-display";
import type { AppType } from "@/lib/scenario/types";
import { PhoneAppIcon } from "@/components/phone/shared/PhoneAppIcon";

interface PhoneNotificationOverlayProps {
  notificationAppType: AppType;
  notificationSenderName: string;
  isBannerVisible: boolean;
  onAppOpen: (appType: AppType) => void;
  onDismissBanner: () => void;
  suppressIncomingCallAlert?: boolean;
}

const swipeDismissOffsetThreshold = 48;
const swipeDismissVelocityThreshold = 280;

/**
 * 홈·앱 플레이 중 상단에 표시되는 시나리오 알림 배너.
 * 아래로 스와이프하면 배너만 닫히고, 홈 아이콘 배지는 유지된다.
 */
export function PhoneNotificationOverlay({
  notificationAppType,
  notificationSenderName,
  isBannerVisible,
  onAppOpen,
  onDismissBanner,
  suppressIncomingCallAlert = false,
}: PhoneNotificationOverlayProps) {
  const didDragBannerRef = useRef(false);

  const shouldDisplayNotification =
    isBannerVisible &&
    !(notificationAppType === "call" && suppressIncomingCallAlert);

  useNotificationSound({
    isNotificationVisible: shouldDisplayNotification,
    notificationAppType,
    suppressSound: suppressIncomingCallAlert,
  });

  const notificationApp = homeAppIconList.find(
    (iconItem) => iconItem.appType === notificationAppType,
  );
  const notificationPreviewText = resolveNotificationPreview(
    notificationAppType,
    notificationSenderName,
  );

  useEffect(() => {
    if (!shouldDisplayNotification) return;

    const handleEscapeKey = (keyboardEvent: KeyboardEvent) => {
      if (keyboardEvent.key === "Escape") {
        onDismissBanner();
      }
    };

    window.addEventListener("keydown", handleEscapeKey);
    return () => window.removeEventListener("keydown", handleEscapeKey);
  }, [shouldDisplayNotification, onDismissBanner]);

  return (
    <AnimatePresence>
      {shouldDisplayNotification && (
        <motion.button
          type="button"
          initial={{ y: -90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -90, opacity: 0 }}
          transition={{ type: "spring", damping: 20 }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 120 }}
          dragElastic={{ top: 0, bottom: 0.35 }}
          onDragStart={() => {
            didDragBannerRef.current = true;
          }}
          onDragEnd={(_, dragInfo) => {
            const didSwipeDown =
              dragInfo.offset.y > swipeDismissOffsetThreshold ||
              dragInfo.velocity.y > swipeDismissVelocityThreshold;
            if (didSwipeDown) {
              onDismissBanner();
            }
          }}
          onClick={() => {
            if (didDragBannerRef.current) {
              didDragBannerRef.current = false;
              return;
            }
            onAppOpen(notificationAppType);
          }}
          className="absolute inset-x-3 top-12 z-50 flex cursor-grab items-center gap-3 rounded-2xl bg-white/95 p-3.5 text-left text-black shadow-xl backdrop-blur active:cursor-grabbing"
          aria-label={`${resolveAppDisplayConfig(notificationAppType)?.appLabel ?? "알림"} 알림 열기`}
        >
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white ${notificationApp?.tileColor ?? "bg-neutral-400"}`}
          >
            <PhoneAppIcon
              appType={notificationApp?.appType ?? "notification"}
              size={20}
            />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold">
              {resolveAppDisplayConfig(notificationAppType)?.appLabel ??
                "알림"}
            </span>
            <span className="block truncate text-sm text-black/60">
              {notificationPreviewText}
            </span>
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
