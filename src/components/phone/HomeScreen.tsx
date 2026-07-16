"use client";

import { homeAppIconList } from "@/lib/phone/app-display";
import type { AppType } from "@/lib/scenario/types";
import { PhoneAppIcon } from "@/components/phone/shared/PhoneAppIcon";
import { AppIconUnreadBadge } from "@/components/phone/shared/AppIconUnreadBadge";

interface HomeScreenProps {
  /** 미읽음 배지를 표시할 앱 (시나리오 entry·전환 노드의 app_type) */
  notificationAppType: AppType;
  onAppOpen: (appType: AppType) => void;
  /** 알림·배지 표시 여부 (통화 억제 등 GameController에서 계산) */
  shouldShowUnreadBadge: boolean;
}

/**
 * 홈 화면 — 앱 아이콘 그리드·독. 알림 배너는 PhoneNotificationOverlay가 전역 표시.
 */
export function HomeScreen({
  notificationAppType,
  onAppOpen,
  shouldShowUnreadBadge,
}: HomeScreenProps) {
  return (
    <div className="relative flex h-full flex-col justify-between bg-gray-600 px-6 pb-8 pt-16">
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
                {shouldShowUnreadBadge && isNotificationApp && (
                  <AppIconUnreadBadge />
                )}
              </span>
              <span className="text-[11px] text-white/90">
                {iconItem.appLabel}
              </span>
            </button>
          );
        })}
      </div>

      {/* 독(dock) — 그리드와 동일한 미읽음 배지 */}
      <div className="mx-auto flex w-full items-center justify-center gap-6 rounded-3xl bg-white/10 py-3 backdrop-blur">
        {homeAppIconList.slice(0, 4).map((iconItem) => {
          const isNotificationApp = iconItem.appType === notificationAppType;

          return (
            <button
              key={iconItem.appType}
              type="button"
              onClick={() => onAppOpen(iconItem.appType)}
              className={`relative flex h-12 w-12 items-center justify-center rounded-2xl text-white ${iconItem.tileColor}`}
              aria-label={iconItem.appLabel}
            >
              <PhoneAppIcon appType={iconItem.appType} size={24} />
              {shouldShowUnreadBadge && isNotificationApp && (
                <AppIconUnreadBadge />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
