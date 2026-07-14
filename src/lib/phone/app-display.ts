import type { AppType } from "@/lib/scenario/types";

type PlayableAppType = Exclude<AppType, "home">;

export interface PhoneAppDisplayConfig {
  appLabel: string;
  tileColor: string;
  notificationPreview: (senderName: string) => string;
  statusBarLabel?: string;
}

const phoneAppDisplayConfigMap: Record<PlayableAppType, PhoneAppDisplayConfig> =
  {
    chat: {
      appLabel: "토크",
      tileColor: "bg-amber-400",
      notificationPreview: (senderName) =>
        `${senderName} — 새 메시지가 도착했습니다`,
    },
    sms: {
      appLabel: "메시지",
      tileColor: "bg-green-500",
      notificationPreview: (senderName) =>
        `${senderName} — 새 메시지가 도착했습니다`,
    },
    insta: {
      appLabel: "포토그램",
      tileColor: "bg-rose-500",
      notificationPreview: (senderName) =>
        `${senderName} — 새 DM이 도착했습니다`,
    },
    call: {
      appLabel: "전화",
      tileColor: "bg-emerald-500",
      notificationPreview: (senderName) => `${senderName} — 수신 전화`,
      statusBarLabel: "통화 중",
    },
    bank: {
      appLabel: "한빛은행",
      tileColor: "bg-blue-600",
      notificationPreview: () => "한빛은행 — 새 알림이 도착했습니다",
    },
    browser: {
      appLabel: "브라우저",
      tileColor: "bg-sky-600",
      notificationPreview: () => "브라우저 — 새 알림이 도착했습니다",
    },
  };

export const homeAppIconList = (
  Object.entries(phoneAppDisplayConfigMap) as [
    PlayableAppType,
    PhoneAppDisplayConfig,
  ][]
).map(([appType, displayConfig]) => ({
  appType,
  appLabel: displayConfig.appLabel,
  tileColor: displayConfig.tileColor,
}));

export function resolveAppDisplayConfig(
  appType: AppType,
): PhoneAppDisplayConfig | null {
  if (appType === "home") return null;
  return phoneAppDisplayConfigMap[appType];
}

export function resolveAppLabel(appType: AppType): string {
  return resolveAppDisplayConfig(appType)?.appLabel ?? "앱";
}

export function resolveNotificationPreview(
  appType: AppType,
  senderName: string,
): string {
  const displayConfig = resolveAppDisplayConfig(appType);
  if (!displayConfig) return "새 알림이 도착했습니다";
  return `${displayConfig.notificationPreview(senderName)}. 눌러서 확인하세요.`;
}
