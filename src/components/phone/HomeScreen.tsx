"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { AppType } from "@/lib/scenario/types";

interface HomeScreenProps {
  /** 알림이 도착할 앱 (시나리오 entry 노드의 app_type) */
  notificationAppType: AppType;
  notificationSenderName: string;
  onNotificationOpen: () => void;
}

const homeAppIconList: { appType: AppType; appLabel: string; iconGlyph: string; tileColor: string }[] = [
  { appType: "chat", appLabel: "토크", iconGlyph: "💬", tileColor: "bg-yellow-400" },
  { appType: "sms", appLabel: "메시지", iconGlyph: "✉️", tileColor: "bg-green-500" },
  { appType: "insta", appLabel: "포토그램", iconGlyph: "📷", tileColor: "bg-gradient-to-tr from-purple-500 to-pink-500" },
  { appType: "call", appLabel: "전화", iconGlyph: "📞", tileColor: "bg-emerald-500" },
  { appType: "bank", appLabel: "한빛은행", iconGlyph: "🏦", tileColor: "bg-blue-600" },
  { appType: "browser", appLabel: "브라우저", iconGlyph: "🌐", tileColor: "bg-sky-500" },
];

/**
 * 홈 화면 — 앱 아이콘 그리드 + 실시간 알림 배너로 스토리 시작.
 */
export function HomeScreen({
  notificationAppType,
  notificationSenderName,
  onNotificationOpen,
}: HomeScreenProps) {
  const [isNotificationVisible, setIsNotificationVisible] = useState(false);

  useEffect(() => {
    const notificationTimer = setTimeout(() => setIsNotificationVisible(true), 1800);
    return () => clearTimeout(notificationTimer);
  }, []);

  const notificationApp = homeAppIconList.find(
    (iconItem) => iconItem.appType === notificationAppType,
  );

  return (
    <div
      className="relative flex h-full flex-col justify-between bg-cover bg-center px-6 pb-8 pt-16"
      style={{
        backgroundImage: "linear-gradient(160deg, #1e293b 0%, #0f172a 55%, #020617 100%)",
      }}
    >
      {/* 실시간 알림 배너 */}
      <AnimatePresence>
        {isNotificationVisible && (
          <motion.button
            initial={{ y: -90, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -90, opacity: 0 }}
            transition={{ type: "spring", damping: 20 }}
            onClick={onNotificationOpen}
            className="absolute inset-x-3 top-12 z-30 flex items-center gap-3 rounded-2xl bg-white/95 p-3.5 text-left text-black shadow-xl backdrop-blur"
          >
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl ${notificationApp?.tileColor ?? "bg-neutral-300"}`}
            >
              {notificationApp?.iconGlyph ?? "🔔"}
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold">{notificationSenderName}</span>
              <span className="block truncate text-sm text-black/60">
                새 메시지가 도착했습니다. 눌러서 확인하세요.
              </span>
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* 앱 아이콘 그리드 */}
      <div className="mt-14 grid grid-cols-4 gap-x-4 gap-y-6">
        {homeAppIconList.map((iconItem) => (
          <div key={iconItem.appType} className="flex flex-col items-center gap-1.5">
            <span
              className={`relative flex h-14 w-14 items-center justify-center rounded-2xl text-2xl shadow-lg ${iconItem.tileColor}`}
            >
              {iconItem.iconGlyph}
              {isNotificationVisible && iconItem.appType === notificationAppType && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  1
                </span>
              )}
            </span>
            <span className="text-[11px] text-white/90">{iconItem.appLabel}</span>
          </div>
        ))}
      </div>

      {/* 독(dock) */}
      <div className="mx-auto flex w-full items-center justify-center gap-6 rounded-3xl bg-white/10 py-3 backdrop-blur">
        {homeAppIconList.slice(0, 4).map((iconItem) => (
          <span
            key={iconItem.appType}
            className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xl ${iconItem.tileColor}`}
            aria-label={iconItem.appLabel}
          >
            {iconItem.iconGlyph}
          </span>
        ))}
      </div>
    </div>
  );
}
