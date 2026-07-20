"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { RiArrowUpSLine } from "@remixicon/react";
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

const swipeUnlockOffsetThreshold = 72;
const swipeUnlockVelocityThreshold = 420;

/**
 * 시나리오 시작 직전 잠금화면 — 쌓인 알림으로 상황 맥락을 보여준 뒤 홈으로 진입.
 * 하단에서 위로 스와이프하면 잠금 해제된다.
 */
export function PhoneLockScreen({
  lockNotifications,
  onUnlock,
}: PhoneLockScreenProps) {
  const [clockText, setClockText] = useState("");
  const panelDragOffset = useMotionValue(0);
  const panelOpacity = useTransform(panelDragOffset, [-140, 0], [0.35, 1]);
  const unlockHintOpacity = useTransform(
    panelDragOffset,
    [-100, -20, 0],
    [0, 0.55, 1],
  );

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

  const completeUnlock = useCallback(() => {
    void animate(panelDragOffset, -320, {
      type: "spring",
      stiffness: 280,
      damping: 32,
      onComplete: onUnlock,
    });
  }, [onUnlock, panelDragOffset]);

  const handleUnlockDragEnd = useCallback(
    (
      _pointerEvent: MouseEvent | TouchEvent | PointerEvent,
      dragInfo: { offset: { y: number }; velocity: { y: number } },
    ) => {
      const didSwipeUp =
        dragInfo.offset.y < -swipeUnlockOffsetThreshold ||
        dragInfo.velocity.y < -swipeUnlockVelocityThreshold;

      if (didSwipeUp) {
        completeUnlock();
        return;
      }

      void animate(panelDragOffset, 0, {
        type: "spring",
        stiffness: 420,
        damping: 34,
      });
    },
    [completeUnlock, panelDragOffset],
  );

  return (
    <motion.div
      style={{ y: panelDragOffset, opacity: panelOpacity }}
      drag="y"
      dragConstraints={{ top: -280, bottom: 0 }}
      dragElastic={{ top: 0.12, bottom: 0 }}
      onDragEnd={handleUnlockDragEnd}
      className="absolute inset-0 z-[60] flex cursor-grab touch-none flex-col bg-gradient-to-b from-slate-900 via-slate-950 to-black text-white active:cursor-grabbing"
    >
      <div className="flex flex-1 flex-col items-center justify-start px-6 pt-20">
        <p
          className="text-5xl font-light tabular-nums"
          suppressHydrationWarning
        >
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

      <motion.div
        style={{ opacity: unlockHintOpacity }}
        className="pointer-events-none flex flex-col items-center gap-2 px-6 pb-8 pt-3"
        aria-hidden
      >
        <motion.span
          animate={{ y: [0, -7, 0] }}
          transition={{
            duration: 1.35,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10"
        >
          <RiArrowUpSLine size={22} className="text-white/80" />
        </motion.span>
        <p className="text-sm font-medium text-white/70">
          아래에서 위로 밀어 잠금 해제
        </p>
        <span className="mt-1 h-1 w-28 rounded-full bg-white/25" />
      </motion.div>
    </motion.div>
  );
}
