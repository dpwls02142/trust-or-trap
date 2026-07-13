import type { AppType } from "@/lib/scenario/types";
import type { InputTutorialMode } from "@/components/phone/shared/InputTutorialBanner";
import { isMessagingAppType } from "@/lib/phone/app-interaction";

/** 노드 앱 타입·음성 설정에 맞는 입력 튜토리얼 모드 (없으면 null) */
export function resolveInputTutorialMode(
  appType: AppType,
  voiceEnabled: boolean,
): InputTutorialMode | null {
  if (appType === "call" && voiceEnabled) return "call";
  if (isMessagingAppType(appType)) return "messenger";
  return null;
}
