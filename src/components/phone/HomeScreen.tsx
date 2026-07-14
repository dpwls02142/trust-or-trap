"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotificationSound } from "@/lib/client/use-notification-sound";
import {
  homeAppIconList,
  resolveAppDisplayConfig,
  resolveNotificationPreview,
} from "@/lib/phone/app-display";
import type { AppType } from "@/lib/scenario/types";
import { PhoneAppIcon } from "@/components/phone/shared/PhoneAppIcon";

interface HomeScreenProps {
  /** 알림이 도착할 앱 (시나리오 entry 노드의 app_type) */
  notificationAppType: AppType;
  notificationSenderName: string;
  onAppOpen: (appType: AppType) => void;
  /** 앱을 한 번 열었다가 홈으로 돌아온 경우 알림을 즉시 표시 */
  showNotificationImmediately?: boolean;
}

/**
 * 홈 화면 — 앱 아이콘 그리드 + 실시간 알림 배너로 스토리 시작.
 * 모든 앱 아이콘을 탭해 해당 앱으로 진입할 수 있다.
 */
export function HomeScreen({
  notificationAppType,
  notificationSenderName,
  onAppOpen,
  showNotificationImmediately = false,
}: HomeScreenProps) {
  const [isNotificationVisible, setIsNotificationVisible] = useState(
    showNotificationImmediately,
  );

  useEffect(() => {
    if (showNotificationImmediately) return;
    const notificationTimer = setTimeout(
      () => setIsNotificationVisible(true),
      1800,
    );
    return () => clearTimeout(notificationTimer);
  }, [showNotificationImmediately]);

  // 통화 중(앱을 한 번 연 뒤 홈 복귀)에는 수신 전화 알림·배지·벨소리를 표시하지 않는다.
  const shouldDisplayNotification =
    isNotificationVisible &&
    !(notificationAppType === "call" && showNotificationImmediately);

  useNotificationSound({
    isNotificationVisible: shouldDisplayNotification,
    notificationAppType,
    suppressSound: showNotificationImmediately,
  });

  const notificationApp = homeAppIconList.find(
    (iconItem) => iconItem.appType === notificationAppType,
  );
  const notificationPreviewText = resolveNotificationPreview(
    notificationAppType,
    notificationSenderName,
  );

  return (
    <div className="relative flex h-full flex-col justify-between bg-gray-600 px-6 pb-8 pt-16">
      {/* 실시간 알림 배너 */}
      <AnimatePresence>
        {shouldDisplayNotification && (
          <motion.button
            initial={{ y: -90, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -90, opacity: 0 }}
            transition={{ type: "spring", damping: 20 }}
            onClick={() => onAppOpen(notificationAppType)}
            className="absolute inset-x-3 top-12 z-30 flex items-center gap-3 rounded-2xl bg-white/95 p-3.5 text-left text-black shadow-xl backdrop-blur"
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

      {/* 앱 아이콘 그리드 */}
      <div className="mt-14 grid grid-cols-4 gap-x-4 gap-y-6">
        {homeAppIconList.map((iconItem) => {
          const isNotificationApp = iconItem.appType === notificationAppType;

          return (
            <button
              key={iconItem.appType}
              type="button"
              onClick={() => onAppOpen(iconItem.appType)}
              className="flex cursor-pointer flex-col items-center gap-1.5"
            >
              <span
                className={`relative flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg ${iconItem.tileColor}`}
              >
                <PhoneAppIcon appType={iconItem.appType} size={28} />
                {shouldDisplayNotification && isNotificationApp && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    1
                  </span>
                )}
              </span>
              <span className="text-[11px] text-white/90">
                {iconItem.appLabel}
              </span>
            </button>
          );
        })}
      </div>

      {/* 독(dock) */}
      <div className="mx-auto flex w-full items-center justify-center gap-6 rounded-3xl bg-white/10 py-3 backdrop-blur">
        {homeAppIconList.slice(0, 4).map((iconItem) => (
          <button
            key={iconItem.appType}
            type="button"
            onClick={() => onAppOpen(iconItem.appType)}
            className={`flex h-12 w-12 items-center justify-center rounded-2xl text-white ${iconItem.tileColor}`}
            aria-label={iconItem.appLabel}
          >
            <PhoneAppIcon appType={iconItem.appType} size={24} />
          </button>
        ))}
      </div>
    </div>
  );
}
