"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  homeAppIconList,
  resolveAppDisplayConfig,
} from "@/lib/phone/app-display";
import type { LockScreenNotificationSpec } from "@/lib/scenario/scenario-context-setup";
import type { AppType } from "@/lib/scenario/types";
import { PhoneAppIcon } from "@/components/phone/shared/PhoneAppIcon";

type LockScreenAppType = Exclude<AppType, "home">;

interface PhoneLockScreenProps {
  lockNotifications: LockScreenNotificationSpec[];
  onUnlock: () => void;
}

/**
 * 시나리오 시작 직전 잠금화면 — 쌓인 알림으로 상황 맥락을 보여준 뒤 홈으로 진입.
 */
export function PhoneLockScreen({
  lockNotifications,
  onUnlock,
}: PhoneLockScreenProps) {
  const [clockText, setClockText] = useState("");

  useEffect(() => {
    const updateClock = () => {
      const currentTime = new Date();
      setClockText(
        `${String(currentTime.getHours()).padStart(2, "0")}:${String(currentTime.getMinutes()).padStart(2, "0")}`,
      );
    };
    updateClock();
    const clockInterval = setInterval(updateClock, 10_000);
    return () => clearInterval(clockInterval);
  }, []);

  return (
    <div className="absolute inset-0 z-[60] flex flex-col bg-gradient-to-b from-slate-900 via-slate-950 to-black text-white">
      <div className="flex flex-1 flex-col items-center justify-start px-6 pt-20">
        <p className="text-5xl font-light tabular-nums" suppressHydrationWarning>
          {clockText}
        </p>
        <p className="mt-2 text-sm text-white/50">7월 20일 월요일</p>

        <ul className="mt-10 flex w-full max-w-sm flex-col gap-2.5">
          {lockNotifications.map((notificationItem, indexValue) => {
            const notificationApp = homeAppIconList.find(
              (iconItem) => iconItem.appType === notificationItem.appType,
            );
            const appLabel =
              resolveAppDisplayConfig(notificationItem.appType)?.appLabel ??
              "알림";

            return (
              <motion.li
                key={`${notificationItem.appType}-${notificationItem.senderName}-${indexValue}`}
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  delay: 0.4 + indexValue * 0.7,
                  type: "spring",
                  damping: 22,
                  stiffness: 260,
                }}
                className="flex items-start gap-3 rounded-2xl bg-white/10 p-3.5 backdrop-blur-md"
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white ${notificationApp?.tileColor ?? "bg-neutral-500"}`}
                >
                  <PhoneAppIcon
                    appType={notificationItem.appType as LockScreenAppType}
                    size={20}
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-sm font-semibold">
                      {appLabel}
                    </span>
                    {notificationItem.relativeTimeLabel && (
                      <span className="shrink-0 text-[11px] text-white/40">
                        {notificationItem.relativeTimeLabel}
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-white/70">
                    {notificationItem.senderName}
                  </span>
                  <span className="mt-1 block text-sm leading-snug text-white/85">
                    {notificationItem.previewText}
                  </span>
                </span>
              </motion.li>
            );
          })}
        </ul>
      </div>

      <div className="px-6 pb-10 pt-4">
        <button
          type="button"
          onClick={onUnlock}
          className="w-full rounded-2xl bg-white/15 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/25"
        >
          밀어서 잠금 해제
        </button>
        <p className="mt-3 text-center text-xs text-white/40">
          폰을 열면 평소처럼 앱을 둘러볼 수 있습니다
        </p>
      </div>
    </div>
  );
}
